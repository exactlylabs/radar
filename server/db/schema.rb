# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2022_12_15_192147) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "accounts", force: :cascade do |t|
    t.integer "account_type", default: 0, null: false
    t.string "name", null: false
    t.boolean "superaccount", default: false
    t.boolean "exportaccount", default: false
    t.datetime "deleted_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "token"
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum", null: false
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "client_count_aggregates", force: :cascade do |t|
    t.string "aggregator_type"
    t.bigint "aggregator_id"
    t.float "online", default: 0.0
    t.integer "total", default: 0
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["aggregator_type", "aggregator_id"], name: "index_client_count_aggregates_on_aggregator"
  end

  create_table "client_count_logs", force: :cascade do |t|
    t.bigint "client_count_aggregate_id"
    t.float "online"
    t.integer "total"
    t.string "update_cause"
    t.time "timestamp"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["client_count_aggregate_id"], name: "index_client_count_logs_on_client_count_aggregate_id"
  end

  create_table "client_event_logs", force: :cascade do |t|
    t.string "name"
    t.bigint "client_id"
    t.datetime "timestamp"
    t.json "data"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["client_id"], name: "index_client_event_logs_on_client_id"
  end

  create_table "client_online_logs", force: :cascade do |t|
    t.bigint "client_id"
    t.bigint "account_id"
    t.string "event_name"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["account_id"], name: "index_client_online_logs_on_account_id"
    t.index ["client_id"], name: "index_client_online_logs_on_client_id"
  end

  create_table "client_speed_tests", force: :cascade do |t|
    t.datetime "tested_at"
    t.float "latitude"
    t.float "longitude"
    t.float "download_avg"
    t.float "upload_avg"
    t.string "ip"
    t.string "token"
    t.string "download_id"
    t.string "upload_id"
    t.float "latency"
    t.float "loss"
    t.datetime "processed_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "address"
    t.string "network_location"
    t.string "city"
    t.string "street"
    t.string "state"
    t.string "postal_code"
    t.integer "house_number"
    t.string "network_type"
    t.float "network_cost"
  end

  create_table "client_versions", force: :cascade do |t|
    t.string "version"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.boolean "is_stable"
    t.index ["is_stable"], name: "index_client_versions_on_is_stable", unique: true
    t.index ["version"], name: "index_client_versions_on_version", unique: true
  end

  create_table "clients", force: :cascade do |t|
    t.string "unix_user", null: false
    t.string "secret_digest"
    t.string "public_key"
    t.string "endpoint_host"
    t.integer "endpoint_port"
    t.integer "remote_gateway_port"
    t.string "name"
    t.string "address"
    t.float "latitude"
    t.float "longitude"
    t.bigint "claimed_by_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "location_id"
    t.datetime "pinged_at"
    t.boolean "test_requested", default: false
    t.bigint "client_version_id"
    t.string "raw_version"
    t.bigint "update_group_id"
    t.boolean "staging"
    t.string "distribution_name"
    t.string "raw_secret"
    t.jsonb "network_interfaces"
    t.integer "account_id"
    t.bigint "watchdog_version_id"
    t.string "raw_watchdog_version"
    t.boolean "online", default: false
    t.datetime "next_schedule_at"
    t.string "cron_string"
    t.float "data_cap_max_usage"
    t.integer "data_cap_periodicity", default: 2
    t.float "data_cap_current_period_usage", default: 0.0
    t.datetime "data_cap_current_period"
    t.index ["claimed_by_id"], name: "index_clients_on_claimed_by_id"
    t.index ["client_version_id"], name: "index_clients_on_client_version_id"
    t.index ["location_id"], name: "index_clients_on_location_id"
    t.index ["unix_user"], name: "index_clients_on_unix_user", unique: true
    t.index ["update_group_id"], name: "index_clients_on_update_group_id"
    t.index ["watchdog_version_id"], name: "index_clients_on_watchdog_version_id"
  end

  create_table "consumer_offsets", force: :cascade do |t|
    t.string "consumer_id"
    t.integer "offset", default: 0
    t.index ["consumer_id"], name: "index_consumer_offsets_on_consumer_id", unique: true
  end

  create_table "distributions", force: :cascade do |t|
    t.string "name"
    t.bigint "client_version_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["client_version_id"], name: "index_distributions_on_client_version_id"
    t.index ["name", "client_version_id"], name: "index_distributions_on_name_and_client_version_id", unique: true
  end

  create_table "invites", force: :cascade do |t|
    t.boolean "is_active", default: false
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "email", null: false
    t.datetime "sent_at", null: false
    t.bigint "account_id", null: false
    t.bigint "user_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "token_digest"
    t.index ["account_id"], name: "index_invites_on_account_id"
    t.index ["user_id"], name: "index_invites_on_user_id"
  end

  create_table "locations", force: :cascade do |t|
    t.string "name"
    t.string "address"
    t.float "latitude"
    t.float "longitude"
    t.bigint "created_by_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.decimal "expected_mbps_up"
    t.decimal "expected_mbps_down"
    t.boolean "test_requested", default: false
    t.string "state"
    t.string "county"
    t.string "state_fips"
    t.string "county_fips"
    t.boolean "manual_lat_long", default: false
    t.boolean "automatic_location", default: false
    t.integer "account_id"
    t.index ["created_by_id"], name: "index_locations_on_created_by_id"
  end

  create_table "measurements", force: :cascade do |t|
    t.string "style"
    t.bigint "client_id", null: false
    t.float "upload"
    t.float "download"
    t.float "jitter"
    t.float "latency"
    t.boolean "processed"
    t.datetime "processed_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.jsonb "extended_info"
    t.bigint "location_id"
    t.bigint "measured_by_id"
    t.string "client_version"
    t.string "client_distribution"
    t.jsonb "network_interfaces"
    t.bigint "download_total_bytes"
    t.bigint "upload_total_bytes"
    t.integer "account_id"
    t.index ["client_id"], name: "index_measurements_on_client_id"
    t.index ["location_id"], name: "index_measurements_on_location_id"
    t.index ["measured_by_id"], name: "index_measurements_on_measured_by_id"
  end

  create_table "packages", force: :cascade do |t|
    t.string "name"
    t.string "os"
    t.bigint "client_version_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["client_version_id"], name: "index_packages_on_client_version_id"
  end

  create_table "update_groups", force: :cascade do |t|
    t.string "name"
    t.bigint "client_version_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "watchdog_version_id"
    t.index ["client_version_id"], name: "index_update_groups_on_client_version_id"
    t.index ["watchdog_version_id"], name: "index_update_groups_on_watchdog_version_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "first_name"
    t.string "last_name"
    t.boolean "terms"
    t.integer "failed_attempts", default: 0
    t.string "unlock_token"
    t.datetime "locked_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "users_accounts", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "user_id", null: false
    t.datetime "joined_at", null: false
    t.datetime "deleted_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.datetime "invited_at"
    t.index ["account_id"], name: "index_users_accounts_on_account_id"
    t.index ["user_id"], name: "index_users_accounts_on_user_id"
  end

  create_table "watchdog_versions", force: :cascade do |t|
    t.string "version"
    t.boolean "is_stable"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["is_stable"], name: "index_watchdog_versions_on_is_stable", unique: true
    t.index ["version"], name: "index_watchdog_versions_on_version", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "client_count_logs", "client_count_aggregates"
  add_foreign_key "client_event_logs", "clients"
  add_foreign_key "client_online_logs", "accounts"
  add_foreign_key "client_online_logs", "clients"
  add_foreign_key "clients", "accounts"
  add_foreign_key "clients", "client_versions"
  add_foreign_key "clients", "locations"
  add_foreign_key "clients", "update_groups"
  add_foreign_key "clients", "users", column: "claimed_by_id"
  add_foreign_key "clients", "watchdog_versions"
  add_foreign_key "distributions", "client_versions"
  add_foreign_key "invites", "accounts"
  add_foreign_key "invites", "users"
  add_foreign_key "locations", "accounts"
  add_foreign_key "locations", "users", column: "created_by_id"
  add_foreign_key "measurements", "accounts"
  add_foreign_key "measurements", "clients"
  add_foreign_key "measurements", "locations"
  add_foreign_key "measurements", "users", column: "measured_by_id"
  add_foreign_key "packages", "client_versions"
  add_foreign_key "update_groups", "client_versions"
  add_foreign_key "update_groups", "watchdog_versions"
  add_foreign_key "users_accounts", "accounts"
  add_foreign_key "users_accounts", "users"
end
