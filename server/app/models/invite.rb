class Invite < ApplicationRecord
  belongs_to :account
  has_secure_password :token, validations: false

  enum role: { owner: 0, guest: 1 }

  def status_to_human
    "Pending"
  end

  def get_badge_style
    "badge-light-warning"
  end

  def full_name
    if first_name.present? && last_name.present?
      "#{self.first_name} #{self.last_name}"
    else
      self.email
    end
  end

  def get_letter_for_icon
    if self.first_name == '' && self.last_name == '' && self.email == ''
      return "-"
    end
    if self.first_name.present? && self.first_name != ''
      self.first_name[0].upcase
    elsif self.last_name.present? && self.last_name != ''
      self.last_name[0].upcase
    else
      self.email[0].upcase
    end
  end
end