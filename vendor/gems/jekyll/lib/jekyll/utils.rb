# frozen_string_literal: true

module Jekyll
  module Utils
    module_function

    def deep_stringify(obj)
      case obj
      when Hash
        obj.each_with_object({}) do |(key, value), memo|
          memo[key.to_s] = deep_stringify(value)
        end
      when Array
        obj.map { |item| deep_stringify(item) }
      else
        obj
      end
    end

    def deep_dup(obj)
      case obj
      when Hash
        obj.each_with_object({}) { |(key, value), memo| memo[key] = deep_dup(value) }
      when Array
        obj.map { |item| deep_dup(item) }
      else
        begin
          obj.dup
        rescue TypeError
          obj
        end
      end
    end

    def blank?(value)
      value.nil? || (value.respond_to?(:empty?) && value.empty?)
    end

    def present?(value)
      !blank?(value)
    end
  end
end
