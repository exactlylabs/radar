require_relative "notifier.rb"
require 'discordrb/webhooks'

class DiscordNotifier < EventsNotifier::Notifier

  def initialize(webhook_url, tbp_alerts_webhook_url, tbp_general_webhook_url)
    @client = Discordrb::Webhooks::Client.new(url: webhook_url)
    @tbp_alerts_client = Discordrb::Webhooks::Client.new(url: tbp_alerts_webhook_url)
    @tbp_general_client = Discordrb::Webhooks::Client.new(url: tbp_general_webhook_url)
  end

  def add_fieldset(embed, title, &block)
    embed.add_field(name: "--------#{title}--------", value: "\u200b")
    yield embed
    embed.add_field(name: "-------------------------------------", value: "\u200b")
  end

  def notify_new_account(account, contact)
    @client.execute do |builder|
      builder.add_embed do |embed|
        embed.title = ":new: == New Account Signed Up == :new:"
        embed.description = "A new user has just signed up in Radar Pods"
        embed.timestamp = Time.now
        embed.color = 0x23C552
        add_fieldset embed, "Account Information" do |fieldset|
          fieldset.add_field(name: "Name", value: account.name)
          fieldset.add_field(name: "Account Type", value: account.account_type.titleize)
        end
        add_fieldset embed, "Contact Information" do |fieldset|
          fieldset.add_field(name: "First Name", value: contact.first_name)
          fieldset.add_field(name: "Last Name", value: contact.last_name)
          fieldset.add_field(name: "E-Mail", value: contact.email)
        end
      end
    end
  end

  def notify_user_invite_accepted(account, user)
    @client.execute do |builder|
      builder.add_embed do |embed|
        embed.title = ":new: == New User from Invite == :new:"
        embed.description = "A new user has just signed up in Radar Pods from an invite from #{account.name} Account" 
        embed.timestamp = Time.now
        embed.color = 0x23C552
        add_fieldset embed, "Account Information" do |fieldset|
          fieldset.add_field(name: "Name", value: account.name)
          fieldset.add_field(name: "Account Type", value: account.account_type.titleize)
        end
        add_fieldset embed, "User Information" do |fieldset|
          fieldset.add_field(name: "First Name", value: user.first_name)
          fieldset.add_field(name: "Last Name", value: user.last_name)
          fieldset.add_field(name: "E-Mail", value: user.email)
        end
      end
    end
  end

  def notify_new_location(location_info)
    if !location_info.location.study_state?
      return
    end

    @tbp_alerts_client.execute do |builder|
      builder.add_embed do |embed|
        embed.title = ":new: == New Location Created == :new:"
        embed.description = %{
          A location was just created in a study state
        }
        embed.timestamp = location_info.location.created_at
        embed.color = 0x23C552
        add_fieldset embed, "" do |fieldset|
          self.add_default_study_location_info(location_info, fieldset)
          fieldset.add_field(name: "Account", value: location_info.location.account.name)
          fieldset.add_field(name: "Created By", value: "#{location_info.location.created_by.first_name}  #{location_info.location.created_by.last_name}")
        end
      end
    end
  end

  def notify_location_online(location_info)
    client = location_info.location.study_state? ? @tbp_alerts_client : @client
    fill_fn = location_info.location.study_state? ? method(:fill_study_online_notification_fieldset) : method(:fill_online_notification_fieldset)

    client.execute do |builder|
      builder.add_embed do |embed|
        embed.title = ":white_check_mark: == Location Online == :white_check_mark:"
        embed.timestamp = Time.now
        embed.color = 0x23C552
        add_fieldset embed, "Location Info" do |fieldset|
          fill_fn.call(location_info, fieldset)
        end    
      end
    end
  end

  def notify_location_offline(location_info)
    client = location_info.location.study_state? ? @tbp_alerts_client : @client
    fill_fn = location_info.location.study_state? ? method(:fill_study_online_notification_fieldset) : method(:fill_online_notification_fieldset)

    client.execute do |builder|
      builder.add_embed do |embed|
        embed.title = ":boom: == Location Offline == :boom:"
        embed.description = %{
          A location just got offline in a study state
        }
        embed.timestamp = Time.now
        embed.color = 0xF84F31
        add_fieldset embed, "Location Info" do |fieldset|
          fill_fn.call(location_info, fieldset)
        end
      end
    end
  end

  def notify_study_goal_reached(geospace, goal, as_org=nil)
    @tbp_general_client.execute do |builder|
      builder.add_embed do |embed|
        embed.title = ":white_check_mark: == Study Goal Reached == :white_check_mark:"
        embed.description = %{
          We just reached a goal of #{goal} locations on #{geospace.namespace.titleize} #{geospace.name}#{" for ISP #{as_org.name}" if as_org}!
        }
        embed.timestamp = Time.now
        embed.color = 0x23C552
      end
    end
  end

  private  

  def add_default_location_info(location_info, fieldset)
    fieldset.add_field(name: "Name", value: location_info.location.name)
    fieldset.add_field(name: "Address", value: location_info.location.address)
    fieldset.add_field(name: "Account", value: location_info.location.account.name)
    fieldset.add_field(name: "State", value: location_info.state.name)
    fieldset.add_field(name: "County", value: location_info.county.name)
    fieldset.add_field(name: "Place", value: location_info.place.name) if location_info.place
  end

  def fill_default_study_location_fieldset(location_info, fieldset)
    fieldset.add_field(name: "Name", value: location_info.location.name)
    fieldset.add_field(name: "Address", value: location_info.location.address)
    fieldset.add_field(name: "Account", value: location_info.location.account.name)
    fieldset.add_field(name: "State", value: location_info.state.name)
    fieldset.add_field(name: "County", value: location_info.county.name + " (#{location_info.location.study_county? ? "Inside" : "Outside"} Study Area)")
    fieldset.add_field(name: "Place", value: location_info.place.name) if location_info.place
  end

  def fill_study_online_notification_fieldset(location_info, fieldset)
    self.fill_default_study_location_fieldset(location_info, fieldset)
    fieldset.add_field(name: "ISP", value: location_info.extra[:as_org]&.name) if location_info.extra[:as_org]
    fieldset.add_field(name: "Total in County", value: "#{location_info.extra[:locations_per_county_count]} out of #{Location::LOCATIONS_PER_COUNTY_GOAL} goal")
    fieldset.add_field(name: "Total in Place", value: "#{location_info.extra[:locations_per_place_count]} out of #{Location::LOCATIONS_PER_PLACE_GOAL} goal") if location_info.extra[:locations_per_place_count]
    fieldset.add_field(name: "Total in ISP in the County", value: "#{location_info.extra[:locations_per_isp_county_count]} out of #{Location::LOCATIONS_PER_ISP_PER_COUNTY_GOAL}") if location_info.extra[:locations_per_isp_county_count]
  end

  def fill_online_notification_fieldset(location_info, fieldset)
    self.add_default_location_info(location_info, fieldset)
    fieldset.add_field(name: "ISP", value: location_info.extra[:as_org]&.name) if location_info.extra[:as_org]
    fieldset.add_field(name: "Total in County", value: "#{location_info.extra[:locations_per_county_count]}")
    fieldset.add_field(name: "Total in Place", value: "#{location_info.extra[:locations_per_place_count]}") if location_info.extra[:locations_per_place_count]
    fieldset.add_field(name: "Total in ISP", value: "#{location_info.extra[:locations_per_isp_count]}") if location_info.extra[:locations_per_isp_count]
  end
end