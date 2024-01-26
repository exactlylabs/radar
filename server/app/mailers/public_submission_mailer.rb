class PublicSubmissionMailer < ApplicationMailer
  def new_submission
    @submission = params[:submission]
    mail(to: ["matt@exactlylabs.com", "amanda@exactlylabs.com"], subject: 'New public page submission')
  end
end