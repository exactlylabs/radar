class AddStatusToClientAndClientHistory < ActiveRecord::Migration[6.1]
  def change
    add_column :clients, :online, :bool, default: false
  end

  create_table :client_online_logs do |t|
    t.references :client, foreign_key: true
    t.references :account, foreign_key: true

    t.string :event_name

    t.timestamps
  end
end
