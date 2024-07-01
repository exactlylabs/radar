class AddDeliveredAtToPublicPageContactSubmission < ActiveRecord::Migration[6.1]
  def change
    add_column :public_page_contact_submissions, :delivered_at, :timestamp
    add_column :public_page_contact_submissions, :step_2_completed, :boolean
    change_column_default :public_page_contact_submissions, :step_2_completed, false # set this separately to have old records default to nil
  end
end
