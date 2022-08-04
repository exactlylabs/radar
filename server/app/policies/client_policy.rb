class ClientPolicy < ApplicationPolicy
    def access_watchdog?
        @user_account && @user_account.user.superuser? && @record.has_watchdog_update?
    end
end
