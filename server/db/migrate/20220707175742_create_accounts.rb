class CreateAccounts < ActiveRecord::Migration[6.1]
  def change
    create_table :accounts do |t|
      t.integer :type, default: 0, null: false
      t.string :name, null: false
      t.boolean :superaccount, default: false
      t.boolean :exportaccount, default: false
      t.timestamps
    end
  end
end
