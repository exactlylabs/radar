class AddVersionAndBuildNumberToClientSpeedTest < ActiveRecord::Migration[6.1]
  def change
    add_column :client_speed_tests, :version_number, :string
    add_column :client_speed_tests, :build_number, :string
  end
end
