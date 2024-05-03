class AddClaimTokenToAccount < ActiveRecord::Migration[6.1]
  def change
    add_column :users_accounts, :token, :string
    add_column :clients, :register_label, :string

    reversible do |dir|
      dir.up do
        UsersAccount.all.each do |ua|
          ua.regenerate_token
        end
      end
    end
  end
end
