class TailscaleAuthKey < ApplicationRecord
  belongs_to :client

  scope :where_active, -> { where(revoked_at: nil, consumed_at: nil).where('expires_at > ?', Time.now) }
  scope :where_consumed, -> { where.not(consumed_at: nil) }

  before_create do
    self.client.tailscale_auth_keys.where_active.any? && raise('Client already has an active auth key')
    tailscale_key = TailscaleClient.device_auth_key
    self.key_id = tailscale_key["id"]
    self.expires_at = tailscale_key["expires"]
    self.raw_key = tailscale_key["key"]
  end

  def self.revoke_expired_keys!
    t = TailscaleAuthKey.arel_table
    all.where('expires_at < ?', Time.now).where(revoked_at: nil).update(revoked_at: t[:expires_at])
  end

  def revoke!
    TailscaleClient.revoke_key(key_id)
    update(revoked_at: Time.now) unless revoked_at.present?
  end

  def expired?
    revoked_at.present? || expires_at < Time.now
  end

  def consumed!
    update(consumed_at: Time.now, raw_key: nil)
  end

end
