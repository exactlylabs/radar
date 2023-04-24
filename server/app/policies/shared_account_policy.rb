class SharedAccountPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @user_account.present? && User.find(@user_account.user_id).super_user
        scope.all
      elsif @user_account.present?
        scope.where(original_account_id: @user_account.account_id)
      else
        scope.none
      end
    end
  end
end