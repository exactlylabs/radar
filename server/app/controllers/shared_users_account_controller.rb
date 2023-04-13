class SharedUsersAccountController < ApplicationController
  before_action :authenticate_user!

  def delegate_access
    error = false
    shared_to_account = policy_scope(Account).not_deleted.find(params[:share_to])
    if shared_to_account.present?
      if shared_to_account.kind_of?(Array)
        shared_to_account.each do |account|
          account.users.each do |account_user|
            SharedUsersAccount.transaction do
              new_shared_account = SharedUsersAccount.new
              new_shared_account.original_account_id = current_account.id
              new_shared_account.shared_to_account_id = account.id
              new_shared_account.shared_to_user_id = account_user.id
              new_shared_account.shared_at = Time.now
              new_shared_account.save!
            end
          end
        end
      else
        shared_to_account.users.each do |account_user|
          SharedUsersAccount.transaction do
            new_shared_account = SharedUsersAccount.new
            new_shared_account.original_account_id = current_account.id
            new_shared_account.shared_to_account_id = shared_to_account.id
            new_shared_account.shared_to_user_id = account_user.id
            new_shared_account.shared_at = Time.now
            new_shared_account.save!
          end
        end
      end
    end
  end

  private
  def set_origin_account
    @origin_account = current_account if current_account.present?
  end
end