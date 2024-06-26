require_relative "notifier.rb"
require 'discordrb/webhooks'

class DiscordNotifier < EventsNotifier::Notifier

  def initialize(webhook_url, tbp_alerts_webhook_url = nil, tbp_general_webhook_url = nil)
    @client = Discordrb::Webhooks::Client.new(url: webhook_url)
    @tbp_alerts_client = tbp_alerts_webhook_url ? Discordrb::Webhooks::Client.new(url: tbp_alerts_webhook_url) : nil
    @tbp_general_client = tbp_general_webhook_url ? Discordrb::Webhooks::Client.new(url: tbp_general_webhook_url) : nil
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
    if !location_info.location.study_county?
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
          self.fill_default_study_location_fieldset(location_info, fieldset)
          fieldset.add_field(name: "Account", value: location_info.location.account.name)
          fieldset.add_field(name: "Created By", value: "#{location_info.location.user.first_name}  #{location_info.location.user.last_name}")
        end
      end
    end
  end

  def notify_location_online(location_info)
    client = location_info.location.study_county? ? @tbp_alerts_client : @client
    fill_fn = location_info.location.study_county? ? method(:fill_study_online_notification_fieldset) : method(:fill_online_notification_fieldset)

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
    client = location_info.location.study_county? ? @tbp_alerts_client : @client
    fill_fn = location_info.location.study_county? ? method(:fill_study_online_notification_fieldset) : method(:fill_online_notification_fieldset)

    client.execute do |builder|
      builder.add_embed do |embed|
        embed.title = ":boom: == Location Offline == :boom:"
        embed.description = %{
          A location just got offline
        }
        embed.timestamp = Time.now
        embed.color = 0xF84F31
        add_fieldset embed, "Location Info" do |fieldset|
          fill_fn.call(location_info, fieldset, online: false)
        end
      end
    end
  end

  def notify_study_goal_reached(geospace, goal, as_org = nil)
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

  def notify_heartbeat_missing(since)
    @client.execute do |builder|
      builder.add_embed do |embed|
        embed.title = ":boom: == Application Heartbeat Missing == :boom:"
        embed.description = %{
          The application heartbeat is missing since #{since}
        }
        embed.timestamp = Time.now
        embed.color = 0xF84F31
      end
    end
  end

  def notify_heartbeat_recovered
    @client.execute do |builder|
      builder.add_embed do |embed|
        embed.title = ":white_check_mark: == Application Heartbeat Recovered! == :white_check_mark:"
        embed.description = %{
          Be Prepared! :saluting_face:
        }
        embed.timestamp = Time.now
        embed.color = 0x23C552
      end
    end
  end

  def notify_public_page_submission(submission)
    @client.execute do |builder|
      builder.add_embed do |embed|
        embed.title = ":new: == New Public Page Submission == :new:"
        embed.description = "A new user has just submitted a form in the public page"
        embed.timestamp = Time.now
        embed.color = 0x23C552
        add_fieldset embed, "Contact Information" do |fieldset|
          fieldset.add_field(name: "First Name", value: submission.first_name)
          fieldset.add_field(name: "Last Name", value: submission.last_name)
          fieldset.add_field(name: "E-Mail", value: submission.email)
          fieldset.add_field(name: "Phone Number", value: submission.phone_number)
        end
        add_fieldset embed, "Location Information" do |fieldset|
          fieldset.add_field(name: "State", value: submission.state)
          fieldset.add_field(name: "County", value: submission.county)
          fieldset.add_field(name: "Consumer Type", value: submission.consumer_type)
          fieldset.add_field(name: "Business Name", value: submission.business_name)
        end
        add_fieldset embed, "Connection Information" do |fieldset|
          fieldset.add_field(name: "ISP", value: submission.isp)
          fieldset.add_field(name: "Connection Type", value: submission.connection_type)
          fieldset.add_field(name: "Download Speed", value: submission.download_speed)
          fieldset.add_field(name: "Upload Speed", value: submission.upload_speed)
          fieldset.add_field(name: "Connection Placement", value: submission.connection_placement)
          fieldset.add_field(name: "Service Satisfaction", value: submission.service_satisfaction)
        end
      end
    end
  end

  private

  def fill_default_location_info(location_info, fieldset)
    fieldset.add_field(name: "Name", value: location_info.location.name)
    fieldset.add_field(name: "Address", value: location_info.location.address)
    fieldset.add_field(name: "Account", value: location_info.location.account.name)
    fieldset.add_field(name: "State", value: location_info.state.name) if location_info.state
    fieldset.add_field(name: "County", value: location_info.county.name) if location_info.county
    fieldset.add_field(name: "Place", value: location_info.place.name) if location_info.place
  end

  def fill_default_study_location_fieldset(location_info, fieldset)
    fieldset.add_field(name: "Name", value: location_info.location.name)
    fieldset.add_field(name: "Address", value: location_info.location.address)
    fieldset.add_field(name: "Account", value: location_info.location.account.name)
    fieldset.add_field(name: "State", value: location_info.state.name) if location_info.state
    fieldset.add_field(name: "County", value: location_info.county.name + " (#{location_info.location.study_county? ? "Inside" : "Outside"} Study Area)") if location_info.county
    fieldset.add_field(name: "Place", value: location_info.place.name) if location_info.place
  end

  def fill_study_online_notification_fieldset(location_info, fieldset, online: true)
    self.fill_default_study_location_fieldset(location_info, fieldset)
    fieldset.add_field(name: "ISP", value: location_info.extra[:as_org]&.name) if location_info.extra[:as_org]
    fieldset.add_field(name: "Total in County", value: "#{location_info.extra[:locations_per_county_count]} out of #{Location::LOCATIONS_PER_COUNTY_GOAL} goal") if location_info.county
    fieldset.add_field(name: "Total in Place", value: "#{location_info.extra[:locations_per_place_count]} out of #{Location::LOCATIONS_PER_PLACE_GOAL} goal") if location_info.place && location_info.extra[:locations_per_place_count].present?
    fieldset.add_field(name: "Total in ISP in the County", value: "#{location_info.extra[:locations_per_isp_county_count]} out of #{Location::LOCATIONS_PER_ISP_PER_COUNTY_GOAL}") if location_info.extra[:as_org].present? && location_info.extra[:locations_per_isp_county_count].present?
    fieldset.add_field(name: "Pod ID", value: location_info.location.clients.where(online: online).order(:updated_at).first.id)
  end

  def fill_online_notification_fieldset(location_info, fieldset, online: true)
    self.fill_default_location_info(location_info, fieldset)
    fieldset.add_field(name: "ISP", value: location_info.extra[:as_org]&.name) if location_info.extra[:as_org]
    fieldset.add_field(name: "Total in County", value: "#{location_info.extra[:locations_per_county_count]}") if location_info.county
    fieldset.add_field(name: "Total in Place", value: "#{location_info.extra[:locations_per_place_count]}") if location_info.place && location_info.extra[:locations_per_place_count]
    fieldset.add_field(name: "Total in ISP", value: "#{location_info.extra[:locations_per_isp_count]}") if location_info.extra[:as_org].present? && location_info.extra[:locations_per_isp_count].present?
    fieldset.add_field(name: "Pod ID", value: location_info.location.clients.where(online: online).order(:updated_at).first.id)
  end
end
