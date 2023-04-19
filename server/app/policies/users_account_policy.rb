class UsersAccountPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @user_account.present?
        if @user_account.is_all_accounts?
          user = User.find(@user_account.user_id)
          all_ua = []
          user.accounts.not_deleted.each do |account|
            all_ua.append(*account.users_accounts.map{|l| l.id})
          end
          user.shared_accounts.not_deleted.each do |account|
            all_ua.append(*account.users_accounts.map{|l| l.id})
          end
          scope.where(id: all_ua)
        else
          scope.where(account_id: @user_account.account_id)
        end
      else
        scope.none
      end
    end
  end
end