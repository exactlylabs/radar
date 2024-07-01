class DeliverPartialPublicPageSubmissionsJob < ApplicationJob
  queue_as :default

  def perform()
    PublicPageContactSubmission.where_not_completed.where_not_delivered.where("created_at < NOW() - INTERVAL '1h'").each do |submission|
      PublicSubmissionMailer.with(submission: submission).new_submission.deliver_later
    end
  end
end
