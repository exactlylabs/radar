class ApplicationMailer < ActionMailer::Base
  default from: 'no-reply@pods.radartoolkit.com'
  layout 'mailer'
end
