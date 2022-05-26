module ApplicationHelper
  def active_path?(path)
    "active" if request.path.starts_with?(path)
  end

  def active_full_path?(path)
    "active" if active_path?(path) && request.path == path
  end

  def pretty_print_date(date)
    date.strftime('%b %d, %Y')
  end

  def paginate(items, total)
    render partial: "pagination_footer", locals: { items: items, total: total }
  end
end
