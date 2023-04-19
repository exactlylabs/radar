class SharedUsersAccount < ApplicationRecord
  belongs_to :account, foreign_key: :shared_to_account_id
  belongs_to :account, foreign_key: :original_account_id

  scope :not_deleted, -> { where({ deleted_at: nil }) }
end