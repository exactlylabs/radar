class OnlineClientCountProjection < ApplicationRecord
  belongs_to :account, foreign_key: true, optional: true
  belongs_to :autonomous_system, foreign_key: true, optional: true
  belongs_to :location, foreign_key: true, optional: true

  def self.latest_for(account_id, as_id, location_id)
    self.where(account_id: account_id, autonomous_system_id: as_id, location_id: location_id).last
  end

end
