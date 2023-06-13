module Recents extend ActiveSupport::Concern

  module RecentTypes
    CLIENT = "CLIENT"
    LOCATION = "LOCATION"
  end

  def store_recent_search(resource_id, resource_type)
    possible_resource = get_possible_resource(resource_id, resource_type)
    if possible_resource.present?
      save_recent_search(possible_resource.id, resource_type)
      return
    else
      # Resource isn't present in the current account scope so we
      # switch to that specific account automatically
      resource = get_resource_anonimously(resource_id, resource_type)
      if resource.present?
        new_account = policy_scope(Account).find(resource.account_id)
        set_new_account new_account
        save_recent_search(resource.id, resource_type)
        @notice = "You are now viewing #{new_account.name} account." 
      end
    end
  end

  private

  def get_resource_anonimously(resource_id, resource_type)
    if resource_type == RecentTypes::CLIENT
      return get_client_anonimously(resource_id)
    else
      return get_location_anonimously(resource_id)
    end
  end

  def get_client_anonimously(client_id)
    Client.find_by_unix_user(client_id)
  end

  def get_location_anonimously(location_id)
    Location.where(id: location_id).first # Don't want this to throw
  end

  def save_recent_search(resource_id, resource_type)
    current_recents = policy_scope(RecentSearch)
    if resource_type == RecentTypes::CLIENT
      return if current_recents.find_by_client_id(resource_id).present?
    else
      return if current_recents.find_by_location_id(resource_id).present?
    end

    @recent_search = RecentSearch.new(user: current_user)
    @recent_search.client_id = resource_id if resource_type == RecentTypes::CLIENT
    @recent_search.location_id = resource_id if resource_type == RecentTypes::LOCATION
    @recent_search.save!

    if current_recents.count > 8
      current_recents.first.destroy
    end
  end

  def get_possible_resource(resource_id, resource_type)
    if resource_type == RecentTypes::CLIENT
      get_possible_client(resource_id)
    else
      get_possible_location(resource_id)
    end
  end

  def get_possible_client(client_id)
    if current_account.is_all_accounts?
      possible_client = policy_scope(Client).find_by_unix_user(client_id)
    else
      possible_client = current_account.clients.find_by_unix_user(client_id)
    end
  end

  def get_possible_location(location_id)
    if current_account.is_all_accounts?
      possible_location = policy_scope(Location).where(id: location_id).first # don't want this to throw
    else
      possible_location = current_account.locations.where(id: location_id).first # don't want this to throw
    end
  end
end