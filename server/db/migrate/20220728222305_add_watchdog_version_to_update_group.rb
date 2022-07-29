class AddWatchdogVersionToUpdateGroup < ActiveRecord::Migration[6.1]
  def change
    # ClientVersion model
    create_table :watchdog_versions do |t|
      t.string :version, index: { unique: true }

      t.timestamps
    end

    add_reference :update_groups, :watchdog_version, foreign_key: true
    add_reference :clients, :watchdog_version, foreign_key: true
    add_column :clients, :raw_watchdog_version, :string, null: true, default: nil
  end
end
