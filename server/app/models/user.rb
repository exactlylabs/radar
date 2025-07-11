class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :lockable
  validates :first_name, :last_name, presence: true, if: Proc.new { |user| user.pods_access? }
  validates_acceptance_of :terms, if: Proc.new { |user| user.pods_access? }

  has_one_attached :avatar
  has_many_attached :downloads

  has_many :clients
  has_many :locations
  has_many :measurements
  has_many :users_accounts
  has_many :accounts, through: :users_accounts
  has_and_belongs_to_many :feature_flags
  has_many :notification_settings
  has_many :mobile_user_devices

  after_save :check_pending_downloads

  def password_required?
    self.pods_access? ? super : false
  end

  def prefers_gb_unit
    self.data_cap_unit == "GB"
  end

  def prefers_tb_unit
    self.data_cap_unit == "TB"
  end

  def shared_accounts
    Account
      .not_deleted
      .joins("JOIN shared_accounts ON shared_accounts.original_account_id = accounts.id")
      .where(
        shared_accounts: {shared_to_account_id: self.accounts}
      )
      .where.not(id: self.accounts)
  end

  def has_pending_downloads
    self.pending_downloads.present? && self.pending_downloads.size > 0
  end

  def has_all_data_pending_download
    return false unless self.has_pending_downloads
    has_pending_download_key 'all-data'
  end

  def has_ndt7_pending_download
    return false unless self.has_pending_downloads
    has_pending_download_key 'ndt7'
  end

  def has_all_measurements_pending_download
    return false unless self.has_pending_downloads
    has_pending_download_key 'all-measurements'
  end

  def has_measurements_pending_download
    return false unless self.has_pending_downloads
    has_pending_download_key 'measurements'
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

  def mobile_account_settings
    settings = MobileAccountSettings.find_by(user: self)
    if settings.nil?
      settings = MobileAccountSettings.create!(user: self)
    end
    settings
  end

  private
  def has_pending_download_key(key)
    self.pending_downloads.filter { |p| p.include? key }.size > 0
  end

  def check_pending_downloads
    if saved_change_to_pending_downloads
      ExportsChannel.broadcast_to(CHANNELS[:exports], {has_pending_downloads: self.has_pending_downloads});
    end
  end
end
