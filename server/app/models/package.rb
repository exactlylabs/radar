#Package holds the package installers of the client
class Package < ApplicationRecord  
  belongs_to :client_version
  has_one_attached :file

  validates :file, presence: true
  validates :name, uniqueness: {scope: :client_version_id}
end
