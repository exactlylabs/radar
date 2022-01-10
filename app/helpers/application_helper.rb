module ApplicationHelper
  def active_path?(path)
    puts "does #{request.path} start with #{path}?"
    "active" if request.path.starts_with?(path)
  end
end
