Rails.application.configure do
  config.logger = Logdna::Ruby.new(ENV["LOGDNA_KEY"])
end