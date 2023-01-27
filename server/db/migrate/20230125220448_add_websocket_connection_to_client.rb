class AddWebsocketConnectionToClient < ActiveRecord::Migration[6.1]
  def change
    add_column :clients, :using_websocket, :boolean, default: false
  end
end
