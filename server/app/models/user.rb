class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :lockable
  validates :first_name, :last_name, presence: true
  validates_acceptance_of :terms

  has_one_attached :avatar
  has_many_attached :downloads

  has_many :clients
  has_many :locations
  has_many :measurements
  has_many :users_accounts
  has_many :accounts, through: :users_accounts
  
  has_many :shared_users_accounts, foreign_key: :shared_to_user_id
  has_many :shared_accounts, through: :shared_users_accounts, source: :account

  after_save :check_pending_downloads

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
