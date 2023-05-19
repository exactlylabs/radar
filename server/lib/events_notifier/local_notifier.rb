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

  def notify_user_invite_accepted(account, user)
    puts %{
      User Invite Accepted

        * Account Name: #{account.name}
        * User: #{user.first_name}
    }
  end

  

  def notify_new_location(location_info)
    puts %{
      New Location!

        #{location_info_as_str(location_info)}
    }
  end

  def notify_location_online(location_info)
    puts %{
      Location Online!

        #{location_info_as_str(location_info)}
    }
  end

  def notify_location_offline(location_info)
    puts %{
      Location Offline!

        #{location_info_as_str(location_info)}
    }
  end

  def notify_study_goal_reached(geospace, goal, as_org=nil)
    puts %{
      Study Goal Reached!
        #{geospace.namespace.titleize} just reached #{goal} locations#{" for ISP#{as_org.name}" if as_org}!
    }
  end

  private

  def location_info_as_str(location_info)
    %{
      * Location: #{location_info.location.id}
      * Location Name: #{location_info.location.name}
      * Location State: #{location_info&.state&.name}
      * Location County: #{location_info&.county&.name}
      * Location Place: #{location_info&.place&.name}
      * Location Study State?: #{location_info.location.study_state?}
      * Location Extras: #{location_info&.extra}
    }
  end
end
