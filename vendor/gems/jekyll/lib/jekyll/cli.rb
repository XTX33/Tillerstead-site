# frozen_string_literal: true

require 'optparse'
require_relative 'site'

module Jekyll
  class CLI
    def self.start(argv)
      new(argv).run
    end

    def initialize(argv)
      @argv = argv.dup
    end

    def run
      command = (@argv.shift || 'build').downcase
      case command
      when 'build'
        run_build
      when 'help', '-h', '--help'
        puts build_parser(nil).to_s
      else
        warn "Unknown command: #{command}\n"
        puts build_parser(nil).to_s
        exit 1
      end
    end

    private

    def run_build
      options = { source: Dir.pwd, destination: nil }
      parser = build_parser(options)
      parser.parse!(@argv)
      options[:destination] ||= File.join(options[:source], '_site')
      Site.new(options).build
    rescue StandardError => e
      warn "Build failed: #{e.message}"
      warn e.backtrace.join("\n") if ENV['JEKYLL_TRACE']
      exit 1
    end

    def build_parser(options)
      store = options
      OptionParser.new do |opts|
        opts.banner = "Usage: jekyll build [options]"
        opts.on('-s', '--source PATH', 'Source directory (default: current directory)') do |path|
          store[:source] = File.expand_path(path) if store
        end
        opts.on('-d', '--destination PATH', 'Destination directory (default: ./_site)') do |path|
          store[:destination] = File.expand_path(path) if store
        end
        opts.on('--trace', 'Show full backtrace on errors') do
          ENV['JEKYLL_TRACE'] = '1'
        end
        opts.on('-h', '--help', 'Show this message') do
          puts opts
          exit
        end
      end
    end
  end
end
