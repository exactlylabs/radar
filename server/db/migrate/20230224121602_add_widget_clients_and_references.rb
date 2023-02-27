class AddWidgetClientsAndReferences < ActiveRecord::Migration[6.1]
  def change
    create_table :widget_clients do |t|
      t.string :client_name
      t.string :client_urls, array: true
      t.timestamps
    end

    add_column :client_speed_tests, :tested_by, :bigint, nullable: true
    add_foreign_key :client_speed_tests, :widget_clients, column: :tested_by, primary_key: :id
  end
end
