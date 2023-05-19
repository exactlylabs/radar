class  ConsumerOffset < ApplicationRecord
    validates :consumer_id, uniqueness: true
end