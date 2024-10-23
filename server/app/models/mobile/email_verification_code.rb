class EmailVerificationCode < ApplicationRecord
  belongs_to :mobile_user_device, optional: true
  
  enum reason: {new_token: "new_token", change_email: "change_email"}

  validates :mobile_user_device, presence: true, if: Proc.new { |e| e.change_email? }

  scope :not_expired, -> { where("valid_until > ?", Time.current) }

  before_create do
    self.valid_until = (Time.current + 1.hour)
    self.code = rand(10**6).to_s.rjust(6, "0")
  end

  def self.pending_new_token_for_device(email, device_id)
    not_expired.where(email: email, device_id: device_id).first
  end

  def self.pending_change_email_for_user(mobile_user_device)
    not_expired.where(mobile_user_device: mobile_user_device).first
  end

  def expired?
    valid_until <= Time.current
  end

  def expire!
    self.update!(valid_until: Time.current)
  end
end
