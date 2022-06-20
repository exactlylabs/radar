class AddNetInterfacesToClients < ActiveRecord::Migration[6.1]
  def change
    add_column :clients, :network_interfaces, :string
    add_column :measurements, :network_interfaces, :string
    add_column :measurements, :download_total_bytes, :bigint
    add_column :measurements, :upload_total_bytes, :bigint
  end
end
