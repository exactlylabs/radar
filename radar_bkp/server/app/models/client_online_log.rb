class ClientOnlineLog < ApplicationRecord
  belongs_to :client
  belongs_to :account, optional: true
end