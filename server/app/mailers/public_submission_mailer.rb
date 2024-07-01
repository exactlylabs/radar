class PublicSubmissionMailer < ApplicationMailer
  def new_submission
    @submission = params[:submission]
    to_mails = ENV['PUBLIC_PAGE_SUBMISSION_EMAILS']&.split(",")
    mail(to: to_mails, subject: 'New public page submission')
    EventsNotifier.notify_public_page_submission(@submission)
    @submission.update!(delivered_at: Time.now)
  end
end
