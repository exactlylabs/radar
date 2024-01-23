class PublicSubmissionMailer < ApplicationMailer
  def new_submission
    @submission = params[:submission]
    mail(to: "eugenio@exactlylabs.com", subject: 'New public page submission')
  end
end