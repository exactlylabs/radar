class UsersAccountPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @auth_holder.present?
        if @auth_holder.is_all_accounts?
          if @auth_holder.user.super_user && !@auth_holder.is_super_user_disabled?
            all_ua = []
            Account.all.not_deleted.each do |account|
              all_ua.append(*account.users_accounts.pluck(:id))
            end
            scope.where(id: all_ua)
          else
            user = @auth_holder.user
            all_ua = []
            user.accounts.not_deleted.each do |account|
              all_ua.append(*account.users_accounts.pluck(:id))
            end
            user.shared_accounts.not_deleted.each do |account|
              all_ua.append(*account.users_accounts.pluck(:id))
            end
            scope.where(id: all_ua)
          end
        else
          super
        end
      else
        scope.none
      end
    end
  end
end