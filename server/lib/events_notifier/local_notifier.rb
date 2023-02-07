require_relative "notifier.rb"

class LocalNotifier < EventsNotifier::Notifier
  def notify_new_account(account, contact)
    puts %{
      New Account created
        
        * Account Name: #{account.name}
        * Account Type: #{account.account_type.titleize}
        * Contact Name: #{contact.first_name} #{contact.last_name}
        * Contact Email: #{contact.email}
    }
  end
end
