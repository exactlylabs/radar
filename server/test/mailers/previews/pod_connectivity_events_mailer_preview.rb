# frozen_string_literal: true

class PodConnectivityEventsMailerPreview < ActionMailer::Preview
  def pod_offline_email
    user = User.first
    client = Client.first
    offline_at = Time.now
    PodConnectivityEventsMailer.with(user: user, client: client, offline_at: offline_at).pod_offline_email
  end

  def pod_online_email
    user = User.first
    client = Client.first
    online_at = Time.now
    offline_at = Time.now - 1.day
    PodConnectivityEventsMailer.with(user: user, client: client, online_at: online_at, offline_at: offline_at).pod_online_email
  end

  def pod_partially_offline_email
    user = User.first
    client = Client.first
    offline_at = Time.now - 1.day
    PodConnectivityEventsMailer.with(user: user, client: client, offline_at: offline_at).pod_partially_offline_email
  end

  def pod_partially_online_email
    user = User.first
    client = Client.first
    online_at = Time.now
    offline_at = Time.now - 1.day
    PodConnectivityEventsMailer.with(user: user, client: client, online_at: online_at, offline_at: offline_at).pod_partially_online_email
  end
end
