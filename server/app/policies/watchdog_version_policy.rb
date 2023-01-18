class WatchdogVersionPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @user_account.present? && User.find(@user_account.user_id).super_user
        WatchdogVersion.all
      else
        scope.none
      end
    end
  end
end