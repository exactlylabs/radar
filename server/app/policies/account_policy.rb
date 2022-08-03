class AccountPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      User.find(@user_account.user_id).accounts
    end
  end
end