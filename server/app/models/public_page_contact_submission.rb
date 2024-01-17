class PublicPageContactSubmission < ApplicationRecord
  enum consumer_type: [:residential, :business, :public_sector, :community, :other_consumer_type]
  enum connection_type: [:dsl, :cable, :fiber, :fixed_wireless, :satellite, :other_connection_type]
  enum service_satisfaction: [:very_dissatisfied, :dissatisfied, :satisfied, :very_satisfied]
  enum connection_placement: [:single_property, :multiple_properties]
end