# frozen_string_literal: true

class NotificationSettings < ApplicationRecord
  belongs_to :user
  belongs_to :account
end
