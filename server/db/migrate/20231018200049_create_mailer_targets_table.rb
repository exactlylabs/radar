class CreateMailerTargetsTable < ActiveRecord::Migration[6.1]
  def change
    create_table :mailer_targets do |t|
      t.string :ip
      t.string :campaign_id, null: false
      t.timestamps
    end
  end
end
