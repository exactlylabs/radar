class EmailVerificationCode < ApplicationRecord
  belongs_to :user, optional: true
  
  enum reason: {new_token: "new_token", change_email: "change_email"}

  validates :user, presence: true, if: Proc.new { |e| e.change_email? }

  scope :not_expired, -> { where("valid_until > ?", Time.current) }

  before_create do
    self.valid_until = (Time.current + 1.hour)
    self.code = rand(10**6).to_s.rjust(6, "0")
  end

  def self.pending_for_device(email, device_id)
    not_expired.where(email: email, device_id: device_id).first
  end

  def expired?
    valid_until <= Time.current
  end

  def expire!
    self.update!(valid_until: Time.current)
  end
end
