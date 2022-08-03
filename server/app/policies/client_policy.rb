class ClientPolicy < ApplicationPolicy
    def access_watchdog?
        puts "AAAAAA"
        puts "User is #{@current_user}"
        @user_account && @user_account.user.superuser? && @record.has_watchdog_update?
    end
end
