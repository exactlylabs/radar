class AccountPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @user_account.present? && @user_account.user.super_user?
        scope.all
      elsif @user_account.present?
        User.find(@user_account.user_id).accounts
      else
        scope.none
      end
    end
  end
end