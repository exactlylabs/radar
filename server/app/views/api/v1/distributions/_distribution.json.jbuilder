json.extract! distribution, :id, :name, :created_at, :updated_at
json.binary url_for distribution.binary
json.signed_binary url_for distribution.signed_binary