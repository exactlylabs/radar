module ApplicationHelper
  def active_path?(path)
    "active" if request.path.starts_with?(path)
  end
end
