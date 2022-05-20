module ApplicationHelper
  def active_path?(path)
    "active" if request.path.starts_with?(path)
  end

  def exact_path?(path)
    'active' if active_path?(path) && request.path == path
  end

  def pretty_print_date(date)
    date.strftime('%b %d, %Y')
  end
end
