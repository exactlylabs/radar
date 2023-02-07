require_relative "notifier.rb"
require 'discordrb/webhooks'

class DiscordNotifier < EventsNotifier::Notifier

  def initialize(webhook_url)
    @client = Discordrb::Webhooks::Client.new(url: webhook_url)
  end

  def add_fieldset(embed, title, &block)
    embed.add_field(name: "--------#{title}--------", value: "\u200b")
    yield embed
    embed.add_field(name: "-------------------------------------", value: "\u200b")
  end

  def notify_new_account(account, contact)
    @client.execute do |builder|
      builder.add_embed do |embed|
        embed.title = "New Account Signed Up"
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
end