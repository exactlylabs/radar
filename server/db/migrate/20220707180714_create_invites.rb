class CreateInvites < ActiveRecord::Migration[6.1]
  def change
    create_table :invites do |t|
      t.boolean :is_active, default: false
      t.string :user_first_name, null: false
      t.string :user_last_name, null: false
      t.string :user_email, null: false
      t.datetime :sent_at, null: false
      t.belongs_to :account, null: false, foreign_key: true
      t.references :user, null: true, foreign_key: true
      t.timestamps
    end

  end
end
