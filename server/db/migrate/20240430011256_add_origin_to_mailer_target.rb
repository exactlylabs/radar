class AddOriginToMailerTarget < ActiveRecord::Migration[6.1]
  def change
    add_column :mailer_targets, :origin, :string
    add_column :mailer_targets, :payload, :jsonb
  end
end
