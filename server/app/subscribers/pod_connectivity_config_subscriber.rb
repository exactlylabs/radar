class PodConnectivityConfigSubscriber < EventsSubscriber

  subscribe(PodConnectivityConfig, [PodConnectivityConfig::Events::WLAN_CONNECTED, PodConnectivityConfig::Events::WLAN_DISCONNECTED]) do |event|
    # Call job to notify users that own this pod and are signed for receiving this notification
    NotifyClientWlanStatusChangeJob.perform_later(event.aggregate, event.data["to"])
  end
end
