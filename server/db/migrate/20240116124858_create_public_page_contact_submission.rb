class CreatePublicPageContactSubmission < ActiveRecord::Migration[6.1]
  def change
    create_table :public_page_contact_submissions do |t|
      t.string :first_name
      t.string :last_name
      t.string :email
      t.string :phone_number
      t.integer :consumer_type
      t.string :business_name, null: true
      t.string :state
      t.string :county
      t.string :isp
      t.integer :connection_type
      t.string :download_speed
      t.string :upload_speed
      t.integer :connection_placement
      t.integer :service_satisfaction
      t.timestamps
    end
  end
end
