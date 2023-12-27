class CreateTaiscaleAuthKey < ActiveRecord::Migration[6.1]
  def change
    create_table :tailscale_auth_keys do |t|
      t.references :client, null: false
      t.string :key_id, null: false
      t.string :raw_key

      t.timestamp :consumed_at
      t.timestamp :expires_at
      t.timestamp :revoked_at

      t.timestamps
    end

    add_column :clients, :debug_enabled, :boolean, default: false
  end
end
