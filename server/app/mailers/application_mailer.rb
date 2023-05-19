class ApplicationMailer < ActionMailer::Base
  default from: 'no-reply@radar.exactlylabs.com'
  layout 'mailer'
end
