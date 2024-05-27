class CreateNotificationSettings < ActiveRecord::Migration[6.1]
  def change
    create_table :notification_settings do |t|
      t.references :user, null: false, foreign_key: true
      t.references :account, null: false, foreign_key: true
      t.boolean :email_notifications_enabled, default: false
      t.boolean :pod_loses_total_connectivity, default: false
      t.boolean :pod_recovers_total_connectivity, default: false
      t.boolean :pod_loses_partial_connectivity, default: false
      t.boolean :pod_recovers_partial_connectivity, default: false
      t.boolean :significant_speed_variation, default: false
      t.boolean :isp_goes_offline, default: false
      t.boolean :isp_comes_back_online, default: false
      t.timestamps
    end
  end
end
