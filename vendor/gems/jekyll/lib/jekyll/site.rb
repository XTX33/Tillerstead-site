# frozen_string_literal: true

require 'yaml'
require 'json'
require 'fileutils'
require 'time'
require_relative 'utils'
require_relative 'markdown'
require_relative 'liquid_engine'

module Jekyll
  class Site
    DEFAULT_LAYOUT_PAGE = 'default'
    DEFAULT_LAYOUT_POST = 'post'

    def initialize(options = {})
      @source = options[:source] ? File.expand_path(options[:source]) : Dir.pwd
      @destination = options[:destination] ? File.expand_path(options[:destination]) : File.join(@source, '_site')
      @processed_sources = []
      @config = {}
    end

    def build
      @config = load_config
      includes = load_includes
      layouts = load_layouts
      engine = LiquidEngine.new(includes)

      FileUtils.rm_rf(@destination)
      FileUtils.mkdir_p(@destination)

      site_data = Utils.deep_stringify(@config)
      site_data['data'] = load_data
      site_data['time'] = Time.now
      site_data['baseurl'] = site_data['baseurl'] || ''
      site_data['url'] = site_data['url'] || ''

      posts = prepare_posts(site_data)
      site_data['posts'] = posts.map { |doc| Utils.deep_dup(doc[:site_payload]) }
      site_data['posts'].sort_by! { |data| data['date'] || Time.at(0) }
      site_data['posts'].reverse!

      posts.each do |doc|
        render_document(doc, site_data, engine, layouts)
      end

      pages = prepare_pages
      pages.each do |doc|
        render_document(doc, site_data, engine, layouts)
      end

      copy_static_assets
    end

    private

    def load_config
      config_path = File.join(@source, '_config.yml')
      return {} unless File.exist?(config_path)

      raw = File.read(config_path)
      data = YAML.safe_load(raw, permitted_classes: [Date, Time], aliases: true) || {}
      Utils.deep_stringify(data)
    rescue Psych::SyntaxError => e
      raise "Invalid YAML in _config.yml: #{e.message}"
    end

    def load_data
      data_dir = File.join(@source, '_data')
      return {} unless Dir.exist?(data_dir)

      files = Dir.glob(File.join(data_dir, '**', '*.{yml,yaml,json}'))
      data = {}

      files.each do |path|
        relative = path.sub(%r{^#{Regexp.escape(data_dir)}/}, '')
        ext = File.extname(relative).downcase
        key_path = relative.sub(/#{Regexp.escape(ext)}$/, '').split('/')
        target = data
        key_path[0...-1].each do |segment|
          target[segment] ||= {}
          target = target[segment]
        end
        target[key_path.last] = parse_data_file(path, ext)
      end

      Utils.deep_stringify(data)
    end

    def load_includes
      dir = File.join(@source, '_includes')
      return {} unless Dir.exist?(dir)

      files = Dir.glob(File.join(dir, '**', '*')).select { |path| File.file?(path) }
      files.each_with_object({}) do |path, memo|
        relative = path.sub(%r{^#{Regexp.escape(dir)}/}, '')
        memo[relative] = File.read(path)
      end
    end

    def parse_data_file(path, ext)
      raw = File.read(path)
      case ext
      when '.json'
        JSON.parse(raw)
      else
        YAML.safe_load(raw, permitted_classes: [Date, Time], aliases: true) || {}
      end
    rescue Psych::SyntaxError => e
      raise "Invalid YAML in #{path}: #{e.message}"
    rescue JSON::ParserError => e
      raise "Invalid JSON in #{path}: #{e.message}"
    end

    def load_layouts
      dir = File.join(@source, '_layouts')
      return {} unless Dir.exist?(dir)

      files = Dir.glob(File.join(dir, '*.html'))
      files.each_with_object({}) do |path, memo|
        name = File.basename(path, File.extname(path))
        memo[name] = File.read(path)
      end
    end

    def prepare_posts(site_data)
      posts_dir = File.join(@source, '_posts')
      return [] unless Dir.exist?(posts_dir)

      Dir.glob(File.join(posts_dir, '*.*')).sort.map do |path|
        relative = path.sub(%r{^#{Regexp.escape(@source)}/}, '')
        @processed_sources << relative
        data, body = parse_document(File.read(path))
        data = Utils.deep_stringify(data || {})

        date_prefix, slug = parse_post_filename(File.basename(path))
        data['date'] = parse_date(data['date'] || date_prefix)
        data['layout'] ||= DEFAULT_LAYOUT_POST
        data['collection'] = 'posts'
        data['slug'] ||= slug
        data['title'] ||= slug.tr('-', ' ').split.map(&:capitalize).join(' ')
        data['permalink'] ||= "/blog/#{slug}/"
        data['url'] = ensure_leading_slash(data['permalink'])
        html_body = Markdown.new(body).to_html

        output_rel = destination_from_permalink(data['permalink'])
        {
          data: data,
          content: html_body,
          output_rel: output_rel,
          source_path: relative,
          site_payload: build_site_payload_for_post(data, html_body)
        }
      end
    end

    def build_site_payload_for_post(data, html)
      payload = Utils.deep_dup(data)
      payload['content'] = html
      payload
    end

    def parse_post_filename(filename)
      if filename =~ /^(\d{4}-\d{2}-\d{2})-(.+)\.[^.]+$/
        [Regexp.last_match(1), Regexp.last_match(2)]
      else
        [Time.now.strftime('%Y-%m-%d'), filename.sub(/\.[^.]+$/, '')]
      end
    end

    def parse_date(value)
      case value
      when Time
        value
      when Date
        value.to_time
      when String
        Time.parse(value)
      else
        Time.now
      end
    rescue ArgumentError
      Time.now
    end

    def prepare_pages
      files = Dir.glob(File.join(@source, '*.html'))
      files += Dir.glob(File.join(@source, 'pages', '**', '*.html'))
      files += Dir.glob(File.join(@source, 'pages', '**', '*.md'))

      files.sort.map do |path|
        next if path.start_with?(File.join(@source, '_'))

        relative = path.sub(%r{^#{Regexp.escape(@source)}/}, '')
        next if relative.start_with?('pages/assets')

        data, body = parse_document(File.read(path))
        next unless data

        data = Utils.deep_stringify(data)
        data['layout'] ||= DEFAULT_LAYOUT_PAGE
        data['collection'] = 'pages'
        data['permalink'] ||= default_page_permalink(relative)
        data['url'] = ensure_leading_slash(data['permalink'])
        if File.extname(path) == '.md'
          body = Markdown.new(body).to_html
        end

        @processed_sources << relative

        {
          data: data,
          content: body,
          output_rel: destination_from_permalink(data['permalink']),
          source_path: relative
        }
      end.compact
    end

    def default_page_permalink(relative)
      base = relative.sub(%r{^pages/}, '')
      if base == 'index.html'
        '/'
      elsif base.end_with?('.html')
        "/#{base.sub(/\.html$/, '')}/"
      else
        "/#{base}"
      end
    end

    def render_document(doc, site_data, engine, layouts)
      page_data = Utils.deep_dup(doc[:data])
      context = {
        'site' => site_data,
        'page' => page_data
      }

      body_output = engine.render(doc[:content], context)
      context['content'] = body_output

      layout_name = page_data['layout']
      output = if layout_name && layouts[layout_name]
                 engine.render(layouts[layout_name], context)
               else
                 body_output
               end

      write_output(doc[:output_rel], output)
    end

    def destination_from_permalink(permalink)
      path = ensure_leading_slash(permalink || '')
      if path.end_with?('/')
        File.join(path.sub(%r{^/}, ''), 'index.html')
      else
        path.sub(%r{^/}, '')
      end
    end

    def ensure_leading_slash(path)
      return '/' if path.nil? || path.empty?

      path.start_with?('/') ? path : "/#{path}"
    end

    def write_output(relative_path, content)
      relative_path = relative_path.sub(%r{^/}, '')
      dest_path = File.join(@destination, relative_path)
      FileUtils.mkdir_p(File.dirname(dest_path))
      File.write(dest_path, content)
    end

    def parse_document(text)
      return [nil, text] unless text.start_with?('---')

      if text =~ /\A---\s*\r?\n(.*?)\r?\n---\s*\r?\n/m
        front_matter = Regexp.last_match(1)
        body_start = Regexp.last_match.end(0)
        body = text[body_start..] || ''
        data = YAML.safe_load(front_matter, permitted_classes: [Date, Time], aliases: true) || {}
        [data, body]
      else
        [nil, text]
      end
    end

    def copy_static_assets
      excludes = Array(@config['exclude']).map { |item| item.sub(%r{^/}, '') }
      Dir.chdir(@source) do
        Dir.glob('**/*', File::FNM_DOTMATCH).each do |entry|
          next if entry == '.' || entry == '..'
          next if entry.start_with?('_site/')
          next if entry.start_with?('.git')

          full = File.join(@source, entry)
          next if File.directory?(full)

          next if should_skip_static?(entry, excludes)

          dest = File.join(@destination, entry)
          FileUtils.mkdir_p(File.dirname(dest))
          FileUtils.cp(full, dest)
        end
      end
    end

    def should_skip_static?(entry, excludes)
      return true if @processed_sources.include?(entry)
      return true if entry.start_with?('_includes/') || entry.start_with?('_layouts/') || entry.start_with?('_posts/') || entry.start_with?('vendor/') || entry.start_with?('pages/')
      return true if entry == 'Gemfile' || entry == 'Gemfile.lock' || entry == 'README.md' || entry == 'LICENSE' || entry == '.gitignore' || entry == '_config.yml'
      excludes.any? { |item| entry.start_with?(item) }
    end
  end
end
