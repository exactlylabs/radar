require 'sidekiq/api'

class ProjectionJob < ActiveJob::Base
  queue_as :study_projection
  sidekiq_options retry: false
  around_enqueue do |_job, block|
    # Check Sidekiq API and see if this job is already running/enqueued
    already_enqueued = false
    Sidekiq::Queue.new("study_projection").each do |j|
      if j.args[0]["job_class"] = self.class.name
        already_enqueued = true
      end
    end
    Sidekiq::WorkSet.new.each do |process_id, thread_id, work|
      if JSON.parse(work["payload"])["args"][0]["job_class"] == self.class.name
        already_enqueued = true
      end
    end
    block.call unless already_enqueued
  end
end