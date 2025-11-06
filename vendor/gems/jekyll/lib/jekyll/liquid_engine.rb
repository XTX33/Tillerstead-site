# frozen_string_literal: true

require 'erb'
require 'json'
require 'time'
require_relative 'utils'

module Jekyll
  class LiquidEngine
    def initialize(includes)
      @includes = includes
      @converter = LiquidTemplate.new
    end

    def render(template, context)
      erb_source = @converter.convert(template.to_s)
      TemplateRuntime.new(self, context).render(erb_source)
    end

    def render_include(name, context)
      source = @includes[name] || @includes["#{name}.html"]
      raise "Include not found: #{name}" unless source

      render(source, context)
    end
  end

  class LiquidTemplate
    TAG_REGEX = /\{%-?\s*(.*?)\s*-?%\}/m.freeze
    OUTPUT_REGEX = /\{\{\s*(.*?)\s*\}\}/m.freeze

    def convert(source)
      text = strip_comments(source.to_s)
      text = convert_tags(text)
      text.gsub(OUTPUT_REGEX) do
        expression = Regexp.last_match(1)
        "<%= liquid_eval(#{expression.dump}) %>"
      end
    end

    private

    def strip_comments(text)
      text.gsub(/\{%-?\s*comment\s*-?%\}.*?\{%-?\s*endcomment\s*-?%\}/m, '')
    end

    def convert_tags(text)
      text.gsub(TAG_REGEX) do
        body = Regexp.last_match(1).strip
        case body
        when /^include\s+(.+)$/
          name = Regexp.last_match(1).strip
          "<%= render_include(#{name.dump}) %>"
        when /^if\s+(.+)$/
          "<% if liquid_condition(#{Regexp.last_match(1).dump}) %>"
        when /^elsif\s+(.+)$/
          "<% elsif liquid_condition(#{Regexp.last_match(1).dump}) %>"
        when /^else$/
          '<% else %>'
        when /^endif$/
          '<% end %>'
        when /^for\s+(\w+)\s+in\s+(.+)$/
          variable = Regexp.last_match(1)
          expression = Regexp.last_match(2)
          "<% liquid_each(#{variable.dump}, #{expression.dump}) do |#{variable}| %>"
        when /^endfor$/
          '<% end %>'
        when /^assign\s+(\w+)\s*=\s*(.+)$/
          variable = Regexp.last_match(1)
          expression = Regexp.last_match(2)
          "<% liquid_assign(#{variable.dump}, #{expression.dump}) %>"
        else
          ''
        end
      end
    end
  end

  class TemplateRuntime
    def initialize(engine, context)
      @engine = engine
      @context = context
    end

    def render(erb_source)
      ERB.new(erb_source, trim_mode: '-').result(binding)
    end

    def liquid_eval(expression)
      ExpressionEvaluator.new(@context).evaluate(expression)
    end

    def liquid_condition(expression)
      ConditionEvaluator.new(@context).evaluate(expression)
    end

    def liquid_assign(variable, expression)
      value = liquid_eval(expression)
      @context[variable.to_s] = value
      nil
    end

    def liquid_each(variable, expression)
      items = Array(liquid_eval(expression))
      items.each do |item|
        @context[variable.to_s] = item
        yield(item)
      end
      @context.delete(variable.to_s)
      nil
    end

    def render_include(name)
      @engine.render_include(name, @context)
    end
  end

  class ConditionEvaluator
    def initialize(context)
      @value_evaluator = ExpressionEvaluator.new(context)
    end

    def evaluate(expression)
      expr = expression.to_s.strip
      return false if expr.empty?

      if (match = expr.match(/^(.*?)\s+contains\s+(.*)$/))
        left = @value_evaluator.evaluate(match[1])
        right = @value_evaluator.evaluate(match[2])
        includes?(left, right)
      elsif (match = expr.match(/^(.*?)\s*==\s*(.*)$/))
        left = @value_evaluator.evaluate(match[1])
        right = @value_evaluator.evaluate(match[2])
        left == right
      elsif (match = expr.match(/^(.*?)\s*!=\s*(.*)$/))
        left = @value_evaluator.evaluate(match[1])
        right = @value_evaluator.evaluate(match[2])
        left != right
      else
        value = @value_evaluator.evaluate(expr)
        !value.nil? && !(value.respond_to?(:empty?) && value.empty?)
      end
    end

    private

    def includes?(left, right)
      return false if left.nil? || right.nil?

      if left.respond_to?(:include?)
        left.include?(right)
      else
        left.to_s.include?(right.to_s)
      end
    end
  end

  class ExpressionEvaluator
    def initialize(context)
      @context = context
    end

    def evaluate(expression)
      parts = expression.to_s.split('|').map(&:strip)
      base = parts.shift
      value = evaluate_base(base)
      parts.each do |filter_part|
        name, args = parse_filter(filter_part)
        value = apply_filter(name, value, args)
      end
      value
    end

    private

    def evaluate_base(token)
      token = token.to_s.strip
      return nil if token.empty?

      case token
      when /^'(.*)'$/m, /^"(.*)"$/m
        Regexp.last_match(1)
      when /^-?\d+$/
        token.to_i
      when /^-?\d+\.\d+$/
        token.to_f
      when 'true'
        true
      when 'false'
        false
      when 'nil', 'null'
        nil
      else
        lookup_variable(token)
      end
    end

    def lookup_variable(path)
      segments = path.split('.')
      first = segments.shift
      value = fetch_context_value(first)
      segments.each do |segment|
        value = dig_value(value, segment)
        break if value.nil?
      end
      value
    end

    def fetch_context_value(key)
      @context[key] || @context[key.to_s] || @context[key.to_sym]
    end

    def dig_value(value, key)
      case value
      when Hash
        value[key] || value[key.to_s] || value[key.to_sym]
      else
        value.respond_to?(key) ? value.public_send(key) : nil
      end
    end

    def parse_filter(text)
      name, args = text.split(':', 2)
      args_list = args ? split_arguments(args) : []
      [name.strip, args_list]
    end

    def split_arguments(text)
      buffer = String.new
      args = []
      depth = 0
      quote = nil
      text.each_char do |char|
        if quote
          if char == quote && buffer[-1] != '\\'
            quote = nil
          end
          buffer << char
        else
          case char
          when '"', "'"
            quote = char
            buffer << char
          when '('
            depth += 1
            buffer << char
          when ')'
            depth -= 1 if depth.positive?
            buffer << char
          when ','
            if depth.zero?
              args << buffer.strip
              buffer = String.new
            else
              buffer << char
            end
          else
            buffer << char
          end
        end
      end
      args << buffer.strip unless buffer.strip.empty?
      args
    end

    def apply_filter(name, value, args)
      case name
      when 'default'
        fallback = args.first ? evaluate(args.first) : nil
        Utils.blank?(value) ? fallback : value
      when 'relative_url'
        path = value.to_s
        return path if path.start_with?('http://', 'https://')

        baseurl = lookup_variable('site.baseurl') || ''
        joined = [baseurl.to_s.chomp('/'), path.start_with?('/') ? path : "/#{path}"].join
        joined.gsub(%r{(?<!:)//+}, '/')
      when 'replace'
        from = args[0] ? evaluate(args[0]) : ''
        to = args[1] ? evaluate(args[1]) : ''
        value.to_s.gsub(from.to_s, to.to_s)
      when 'join'
        separator = args[0] ? evaluate(args[0]) : ', '
        Array(value).map { |item| item.to_s }.join(separator.to_s)
      when 'jsonify'
        JSON.generate(value)
      when 'date'
        format = args[0] ? evaluate(args[0]) : ''
        time = case value
               when Time
                 value
               when Date
                 value.to_time
               when String
                 begin
                   Time.parse(value)
                 rescue StandardError
                   Time.now
                 end
               else
                 Time.now
               end
        format.empty? ? time : time.strftime(format)
      when 'sort'
        key = args[0] ? evaluate(args[0]) : nil
        if key && value.respond_to?(:sort_by)
          value.sort_by { |item| dig_value(item, key.to_s) }
        else
          value
        end
      when 'reverse'
        value.respond_to?(:reverse) ? value.reverse : value
      when 'size'
        value.respond_to?(:size) ? value.size : 0
      else
        value
      end
    end
  end
end
