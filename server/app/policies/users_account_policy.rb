class UsersAccountPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @auth_holder.present?
        if @auth_holder.is_all_accounts?
          user = @auth_holder.user
          all_ua = []
          user.accounts.not_deleted.each do |account|
            all_ua.append(*account.users_accounts.map{|l| l.id})
          end
          user.shared_accounts.not_deleted.each do |account|
            all_ua.append(*account.users_accounts.map{|l| l.id})
          end
          scope.where(id: all_ua)
        else
          scope.where(account_id: @auth_holder.account.id)
        end
      else
        scope.none
      end
    end
  end
end