module AccountNotificationJobs
  
  class NewAccountNotification < ApplicationJob
    def perform(account, contact)
      EventsNotifier.notify_new_account(account, contact)
    end
  end

  class InviteAcceptedNotification < ApplicationJob
    def perform(account, user)
      EventsNotifier.notify_user_invite_accepted(account, user)
    end
  end
end