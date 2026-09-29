class AddAccountToStudies < ActiveRecord::Migration[6.1]
  def change
    add_reference :studies, :account, foreign_key: true, index: true
  end
end
