class ClientVersionPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @user_account.present? && User.find(@user_account.user_id).super_user
        ClientVersion.all
      else
        scope.none
      end
    end
  end
end