json.extract! package, :id, :name, :os, :created_at, :updated_at
json.file url_for package.file unless !package.file.attached? 
