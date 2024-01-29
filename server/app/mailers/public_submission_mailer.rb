class PublicSubmissionMailer < ApplicationMailer
  def new_submission
    @submission = params[:submission]
    mail(to: ENV['PUBLIC_PAGE_SUBMISSION_EMAILS'].split(","), subject: 'New public page submission')
  end
end