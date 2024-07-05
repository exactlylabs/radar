module SvgHelper

  # This helper method is used to render SVG files in all views.
  # It takes the filename of the SVG file and an options hash.
  # The options hash can contain the following
  # - class: a string that will be added to the class attribute of the SVG tag
  # - width: a string that will be added to the width attribute of the SVG tag
  # - height: a string that will be added to the height attribute of the SVG tag
  # If no options are provided, the SVG tag will have a class of 'svg' and a width and height of 16px.
  # The SVG file should be placed in the app/assets/images directory.
  # Example usage:
  # <%= svg_tag('icon.svg', { class: 'icon', width: '24px', height: '24px' }) %>
  def svg_tag(filename, options = {})
    options[:class] = "svg #{options[:class]}"
    file = File.read("app/assets/images/#{filename}")
    doc = Nokogiri::HTML::DocumentFragment.parse file
    svg = doc.at_css 'svg'
    svg['class'] = options[:class]
    svg['width'] = options[:width] || '16px'
    svg['height'] = options[:height] || '16px'
    doc.to_html.html_safe
  end
end