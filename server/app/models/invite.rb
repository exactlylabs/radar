class Invite < ApplicationRecord
  belongs_to :account
  has_secure_password :token, validations: false

  def status_to_human
    "Pending"
  end

  def get_badge_style
    "badge-light-warning"
  end

  def get_letter_for_icon
    if self.first_name == '' && self.last_name == '' && self.email == ''
      return "-"
    end
    if self.first_name != ''
      self.first_name[0].upcase
    elsif self.last_name != ''
      self.last_name[0].upcase
    else
      self.email[0].upcase
    end
  end
end