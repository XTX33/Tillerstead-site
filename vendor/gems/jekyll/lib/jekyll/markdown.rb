# frozen_string_literal: true

require 'cgi'

module Jekyll
  class Markdown
    def initialize(text)
      @text = text.to_s
    end

    def to_html
      lines = @text.gsub("\r\n", "\n").split("\n")
      output = []
      paragraph = []
      blockquote_buffer = []
      list_stack = []

      lines.each_with_index do |line, index|
        last_line = index == lines.length - 1
        stripped = line.strip

        if stripped.empty?
          flush_paragraph(output, paragraph)
          flush_blockquote(output, blockquote_buffer)
          close_lists(output, list_stack)
          next
        end

        if stripped == '---' || stripped == '***'
          flush_paragraph(output, paragraph)
          flush_blockquote(output, blockquote_buffer)
          close_lists(output, list_stack)
          output << '<hr>'
          next
        end

        if (heading = stripped.match(/^(#{'#' * 6}|#{'#' * 5}|#{'#' * 4}|#{'#' * 3}|#{'#' * 2}|#)\s+(.*)$/))
          level = heading[1].length
          text = heading[2]
          flush_paragraph(output, paragraph)
          flush_blockquote(output, blockquote_buffer)
          close_lists(output, list_stack)
          output << "<h#{level}>#{format_inline(text)}</h#{level}>"
          next
        end

        if (match = line.match(/^\s{0,3}>\s?(.*)$/))
          flush_paragraph(output, paragraph)
          close_lists(output, list_stack)
          blockquote_buffer << match[1]
          if last_line
            flush_blockquote(output, blockquote_buffer)
          end
          next
        elsif !blockquote_buffer.empty?
          flush_blockquote(output, blockquote_buffer)
        end

        if (match = line.match(/^\s{0,3}-\s+(.*)$/))
          flush_paragraph(output, paragraph)
          ensure_list(list_stack, :ul)
          append_list_item(list_stack, format_inline(match[1].strip))
          next
        elsif (match = line.match(/^\s{0,3}\d+\.\s+(.*)$/))
          flush_paragraph(output, paragraph)
          ensure_list(list_stack, :ol)
          append_list_item(list_stack, format_inline(match[1].strip))
          next
        elsif !list_stack.empty? && line.match(/^\s{2,}(.*)$/)
          append_to_current_item(list_stack, format_inline(Regexp.last_match(1).strip))
          flush_paragraph(output, paragraph)
          next
        else
          flush_blockquote(output, blockquote_buffer)
          close_lists(output, list_stack)
        end

        paragraph << stripped
        flush_paragraph(output, paragraph) if last_line
      end

      flush_paragraph(output, paragraph)
      flush_blockquote(output, blockquote_buffer)
      close_lists(output, list_stack)

      output.join("\n")
    end

    private

    def flush_paragraph(output, paragraph)
      return if paragraph.empty?

      text = paragraph.join(' ')
      paragraph.clear
      output << "<p>#{format_inline(text)}</p>"
    end

    def ensure_list(stack, type)
      last = stack.last
      if last.nil? || last[:type] != type
        stack << { type: type, items: [] }
      end
    end

    def append_list_item(stack, text)
      stack.last[:items] << text
    end

    def append_to_current_item(stack, text)
      current = stack.last
      return unless current && current[:items].any?

      current[:items][-1] = "#{current[:items].last} #{text}".strip
    end

    def close_lists(output, stack)
      until stack.empty?
        list = stack.pop
        tag = list[:type] == :ul ? 'ul' : 'ol'
        items = list[:items].map { |item| "<li>#{item}</li>" }.join("\n")
        output << "<#{tag}>\n#{items}\n</#{tag}>"
      end
    end

    def flush_blockquote(output, buffer)
      return if buffer.empty?

      inner = buffer.join("\n")
      buffer.clear
      rendered = self.class.new(inner).to_html
      output << "<blockquote>\n#{rendered}\n</blockquote>"
    end

    def format_inline(text)
      escaped = CGI.escapeHTML(text)
      escaped.gsub!(/\[(.+?)\]\((.+?)\)/) { "<a href=\"#{CGI.escapeHTML($2)}\">#{$1}</a>" }
      escaped.gsub!(/\*\*(.+?)\*\*/) { "<strong>#{$1}</strong>" }
      escaped.gsub!(/\*(.+?)\*/) { "<em>#{$1}</em>" }
      escaped.gsub!(/`([^`]+)`/) { "<code>#{$1}</code>" }
      escaped
    end
  end
end
