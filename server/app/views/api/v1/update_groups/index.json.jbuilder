json.results @update_groups do |update_group|
  json.partial! "api/v1/update_groups/update_group", update_group: update_group
end
