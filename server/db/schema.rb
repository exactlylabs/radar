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

ActiveRecord::Schema.define(version: 2022_05_09_224219) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

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
    t.bigint "user_id"
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
    t.index ["client_version_id"], name: "index_clients_on_client_version_id"
    t.index ["location_id"], name: "index_clients_on_location_id"
    t.index ["unix_user"], name: "index_clients_on_unix_user", unique: true
    t.index ["update_group_id"], name: "index_clients_on_update_group_id"
    t.index ["user_id"], name: "index_clients_on_user_id"
  end

  create_table "distributions", force: :cascade do |t|
    t.string "name"
    t.bigint "client_version_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["client_version_id"], name: "index_distributions_on_client_version_id"
    t.index ["name", "client_version_id"], name: "index_distributions_on_name_and_client_version_id", unique: true
  end

  create_table "locations", force: :cascade do |t|
    t.string "name"
    t.string "address"
    t.float "latitude"
    t.float "longitude"
    t.bigint "user_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.decimal "expected_mbps_up"
    t.decimal "expected_mbps_down"
    t.boolean "test_requested", default: false
    t.string "state"
    t.string "county"
    t.index ["user_id"], name: "index_locations_on_user_id"
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
    t.bigint "user_id"
    t.index ["client_id"], name: "index_measurements_on_client_id"
    t.index ["location_id"], name: "index_measurements_on_location_id"
    t.index ["user_id"], name: "index_measurements_on_user_id"
  end

  create_table "update_groups", force: :cascade do |t|
    t.string "name"
    t.bigint "client_version_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["client_version_id"], name: "index_update_groups_on_client_version_id"
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
    t.boolean "superuser", default: false
    t.integer "failed_attempts", default: 0
    t.string "unlock_token"
    t.datetime "locked_at"
    t.string "token"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["token"], name: "index_users_on_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "clients", "client_versions"
  add_foreign_key "clients", "locations"
  add_foreign_key "clients", "update_groups"
  add_foreign_key "clients", "users"
  add_foreign_key "distributions", "client_versions"
  add_foreign_key "locations", "users"
  add_foreign_key "measurements", "clients"
  add_foreign_key "measurements", "locations"
  add_foreign_key "measurements", "users"
  add_foreign_key "update_groups", "client_versions"
end
