json.extract! distribution, :id, :name, :created_at, :updated_at
json.binary url_for distribution.binary unless !distribution.binary.attached? 
json.signed_binary url_for distribution.signed_binary unless !distribution.signed_binary.attached?