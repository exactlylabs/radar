class CategoryPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @auth_holder.present?
        if @auth_holder.is_all_accounts?
          account_policy = AccountPolicy.new(@auth_holder, Account.new)::Scope
          accounts_scope = account_policy.resolve
          scope.where(account: accounts_scope)
        else
          scope.where(account_id: @auth_holder.account.id)
        end
      else
        scope.none
      end
    end
  end
end