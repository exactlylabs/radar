class AccountPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @user_account.present?
        user = User.find(@user_account.user_id)
        if user.super_user?
          scope.all.not_deleted
        else
          own_accounts = user.accounts.not_deleted
          shared = user.shared_accounts.not_deleted
          # Bring back array to actual ORM model to be able to use it as usual
          scope.where(id: (own_accounts + shared).map {|a| a.id})
        end
      else
        scope.none
      end
    end
  end
end