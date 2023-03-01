class Event < ApplicationRecord
  belongs_to :aggregate, polymorphic: true
  has_one :snapshot

  def self.last_version_from(aggregate)
    version = Event.where(aggregate: aggregate).order("version DESC").limit(1).pluck(:version)
    version.empty? ? 0 : version[0]
  end
end
