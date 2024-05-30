
Dir[Rails.root.join("app", "subscribers", '*.rb')].each do |file|
  cls = File.basename(file, ".rb").camelize.constantize
  if cls.respond_to?(:call)
    cls.call
  end
end
