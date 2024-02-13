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

ActiveRecord::Schema.define(version: 2024_02_09_215434) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "postgis"

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

  create_table "autonomous_system_orgs", force: :cascade do |t|
    t.string "name"
    t.string "org_id"
    t.string "country"
    t.string "source"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["org_id"], name: "index_autonomous_system_orgs_on_org_id", unique: true
  end

  create_table "autonomous_system_orgs_geospaces", id: false, force: :cascade do |t|
    t.bigint "geospace_id", null: false
    t.bigint "autonomous_system_org_id", null: false
    t.index ["autonomous_system_org_id"], name: "idx_geospaces_as_orgs_as_org_id"
    t.index ["geospace_id"], name: "idx_geospaces_as_orgs_geospace_id"
  end

  create_table "autonomous_systems", force: :cascade do |t|
    t.string "name"
    t.string "asn"
    t.bigint "autonomous_system_org_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["asn"], name: "index_autonomous_systems_on_asn", unique: true
    t.index ["autonomous_system_org_id"], name: "index_autonomous_systems_on_autonomous_system_org_id"
  end

  create_table "categories", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "account_id"
    t.string "color_hex", null: false
    t.boolean "locked", default: false
    t.index ["account_id"], name: "index_categories_on_account_id"
  end

  create_table "categories_locations", force: :cascade do |t|
    t.bigint "category_id", null: false
    t.bigint "location_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["category_id"], name: "index_categories_locations_on_category_id"
    t.index ["location_id"], name: "index_categories_locations_on_location_id"
  end

  create_table "client_count_aggregates", force: :cascade do |t|
    t.string "aggregator_type"
    t.bigint "aggregator_id"
    t.float "online", default: 0.0
    t.integer "total", default: 0
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "total_in_service", default: 0
    t.index ["aggregator_type", "aggregator_id"], name: "index_client_count_aggregates_on_aggregator"
  end

  create_table "client_count_logs", force: :cascade do |t|
    t.bigint "client_count_aggregate_id"
    t.float "online"
    t.integer "total"
    t.string "update_cause"
    t.datetime "timestamp"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "total_in_service", default: 0
    t.index ["client_count_aggregate_id"], name: "index_client_count_logs_on_client_count_aggregate_id"
  end

  create_table "client_event_logs", force: :cascade do |t|
    t.string "name"
    t.bigint "client_id"
    t.datetime "timestamp"
    t.jsonb "data"
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
    t.jsonb "connection_data"
    t.string "version_number"
    t.string "build_number"
    t.bigint "tested_by"
    t.float "accuracy"
    t.float "altitude"
    t.string "address_provider"
    t.boolean "background_mode", default: false
    t.geography "lonlat", limit: {:srid=>4326, :type=>"st_point", :geographic=>true}
    t.bigint "autonomous_system_id"
    t.float "alt_accuracy"
    t.float "floor"
    t.float "heading"
    t.float "speed"
    t.float "speed_accuracy"
    t.float "latitude_after"
    t.float "longitude_after"
    t.float "altitude_after"
    t.float "accuracy_after"
    t.float "alt_accuracy_after"
    t.float "floor_after"
    t.float "heading_after"
    t.float "speed_after"
    t.float "speed_accuracy_after"
    t.float "latitude_before"
    t.float "longitude_before"
    t.float "altitude_before"
    t.float "accuracy_before"
    t.float "alt_accuracy_before"
    t.float "floor_before"
    t.float "heading_before"
    t.float "speed_before"
    t.float "speed_accuracy_before"
    t.string "session_id"
    t.boolean "backfilled", default: false
    t.jsonb "permissions"
    t.index ["latitude"], name: "client_speed_tests_latitude_idx"
    t.index ["lonlat"], name: "client_speed_tests_gist_lonlat_idx", using: :gist
    t.index ["lonlat"], name: "index_client_speed_tests_on_lonlat"
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
    t.string "distribution_name"
    t.jsonb "network_interfaces"
    t.integer "account_id"
    t.bigint "watchdog_version_id"
    t.string "raw_watchdog_version"
    t.boolean "online", default: false
    t.float "data_cap_max_usage"
    t.integer "data_cap_periodicity", default: 2
    t.float "data_cap_current_period_usage", default: 0.0
    t.datetime "data_cap_current_period"
    t.string "ip"
    t.bigint "autonomous_system_id"
    t.integer "scheduling_periodicity", default: 0
    t.integer "scheduling_amount_per_period", default: 1
    t.integer "scheduling_tests_in_period", default: 0
    t.datetime "scheduling_period_end"
    t.datetime "test_scheduled_at"
    t.boolean "custom_scheduling", default: false
    t.string "os_version"
    t.string "hardware_platform"
    t.integer "data_cap_day_of_month", default: 1
    t.boolean "in_service", default: false
    t.bigint "target_client_version_id"
    t.bigint "target_watchdog_version_id"
    t.boolean "has_watchdog", default: false
    t.float "download_avg"
    t.float "upload_avg"
    t.bigint "measurements_count", default: 0
    t.float "measurements_download_sum", default: 0.0
    t.float "measurements_upload_sum", default: 0.0
    t.boolean "debug_enabled", default: false
    t.time "test_allowed_time_start"
    t.time "test_allowed_time_end"
    t.string "test_allowed_time_tz", default: "UTC"
    t.index ["autonomous_system_id"], name: "index_clients_on_autonomous_system_id"
    t.index ["claimed_by_id"], name: "index_clients_on_claimed_by_id"
    t.index ["client_version_id"], name: "index_clients_on_client_version_id"
    t.index ["location_id"], name: "index_clients_on_location_id"
    t.index ["target_client_version_id"], name: "index_clients_on_target_client_version_id"
    t.index ["target_watchdog_version_id"], name: "index_clients_on_target_watchdog_version_id"
    t.index ["unix_user"], name: "index_clients_on_unix_user", unique: true
    t.index ["update_group_id"], name: "index_clients_on_update_group_id"
    t.index ["watchdog_version_id"], name: "index_clients_on_watchdog_version_id"
  end

  create_table "consumer_offsets", force: :cascade do |t|
    t.string "consumer_id"
    t.integer "offset", default: 0
    t.jsonb "state", default: {}
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

  create_table "events", force: :cascade do |t|
    t.string "name"
    t.datetime "timestamp"
    t.string "aggregate_type"
    t.bigint "aggregate_id"
    t.jsonb "data"
    t.bigint "version"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["aggregate_type", "aggregate_id"], name: "index_events_on_aggregate"
    t.index ["version", "aggregate_id", "aggregate_type"], name: "index_events_on_version_and_aggregate_id_and_aggregate_type", unique: true
  end

  create_table "feature_flags", force: :cascade do |t|
    t.string "name", null: false
    t.boolean "generally_available", default: false, null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "feature_flags_users", id: false, force: :cascade do |t|
    t.bigint "feature_flag_id", null: false
    t.bigint "user_id", null: false
  end

  create_table "geospaces", force: :cascade do |t|
    t.string "name"
    t.string "namespace"
    t.geometry "geom", limit: {:srid=>0, :type=>"geometry"}
    t.string "geoid"
    t.integer "gid"
    t.datetime "created_at", default: -> { "CURRENT_TIMESTAMP" }, null: false
    t.datetime "updated_at", default: -> { "CURRENT_TIMESTAMP" }, null: false
    t.boolean "study_geospace", default: false
    t.boolean "hrsa_designated_rural_area", default: false
    t.boolean "expanded_study_area", default: false
    t.index "st_setsrid(geom, 4326)", name: "index_geospaces_on_st_setsrid_geom_4326", using: :gist
    t.index ["namespace", "geoid"], name: "index_geospaces_on_namespace_and_geoid", unique: true
  end

  create_table "geospaces_locations", id: false, force: :cascade do |t|
    t.bigint "geospace_id", null: false
    t.bigint "location_id", null: false
    t.index ["geospace_id"], name: "index_geospaces_locations_on_geospace_id"
    t.index ["location_id"], name: "index_geospaces_locations_on_location_id"
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

  create_table "location_groups", force: :cascade do |t|
    t.string "name"
    t.bigint "account_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["account_id"], name: "index_location_groups_on_account_id"
  end

  create_table "location_metadata_projections", force: :cascade do |t|
    t.bigint "location_id"
    t.bigint "autonomous_system_org_id"
    t.integer "online_pods_count", default: 0
    t.integer "days_online", default: 0
    t.boolean "completed", default: false
    t.boolean "online", default: false
    t.datetime "last_offline_event_at"
    t.datetime "last_online_event_at"
    t.index ["autonomous_system_org_id"], name: "index_location_metadata_projections_on_autonomous_system_org_id"
    t.index ["location_id"], name: "index_location_metadata_projections_on_location_id", unique: true
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
    t.boolean "manual_lat_long", default: false
    t.string "state_fips"
    t.string "county_fips"
    t.boolean "automatic_location", default: false
    t.integer "account_id"
    t.float "download_avg"
    t.float "upload_avg"
    t.bigint "location_group_id"
    t.datetime "deleted_at"
    t.geography "lonlat", limit: {:srid=>4326, :type=>"st_point", :geographic=>true}
    t.datetime "offline_since"
    t.boolean "online", default: false
    t.boolean "notified_when_online", default: false
    t.bigint "measurements_count", default: 0
    t.float "measurements_download_sum", default: 0.0
    t.float "measurements_upload_sum", default: 0.0
    t.index ["account_id"], name: "index_locations_on_account_id"
    t.index ["created_by_id"], name: "index_locations_on_created_by_id"
    t.index ["location_group_id"], name: "index_locations_on_location_group_id"
  end

  create_table "mailer_targets", force: :cascade do |t|
    t.string "ip"
    t.string "campaign_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
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
    t.string "ip"
    t.bigint "autonomous_system_id"
    t.float "loss_rate"
    t.geography "lonlat", limit: {:srid=>4326, :type=>"st_point", :geographic=>true}
    t.boolean "wireless"
    t.string "interface"
    t.integer "signal"
    t.integer "tx_speed"
    t.integer "frequency"
    t.integer "channel"
    t.string "width"
    t.integer "noise"
    t.index ["account_id", "processed_at"], name: "index_measurements_on_account_id_and_processed_at", order: { processed_at: :desc }
    t.index ["account_id"], name: "index_measurements_on_account_id"
    t.index ["autonomous_system_id"], name: "index_measurements_on_autonomous_system_id"
    t.index ["client_id"], name: "index_measurements_on_client_id"
    t.index ["location_id"], name: "index_measurements_on_location_id"
    t.index ["lonlat"], name: "index_measurements_on_lonlat"
    t.index ["measured_by_id"], name: "index_measurements_on_measured_by_id"
    t.index ["processed_at", "location_id", "autonomous_system_id"], name: "idx_meas_filter_by_loc_and_isp", order: { processed_at: :desc }
    t.index ["processed_at"], name: "index_measurements_on_processed_at", order: :desc
  end

  create_table "metrics_projections", id: false, force: :cascade do |t|
    t.datetime "timestamp"
    t.string "bucket_name"
    t.bigint "parent_aggregate_id"
    t.bigint "study_aggregate_id"
    t.bigint "autonomous_system_org_id"
    t.integer "online_pods_count", default: 0
    t.integer "online_locations_count", default: 0
    t.integer "measurements_count", default: 0
    t.integer "points_with_tests_count", default: 0
    t.integer "completed_locations_count", default: 0
    t.integer "completed_and_online_locations_count"
    t.index ["autonomous_system_org_id"], name: "index_metrics_projections_on_autonomous_system_org_id"
    t.index ["parent_aggregate_id"], name: "index_metrics_projections_on_parent_aggregate_id"
    t.index ["study_aggregate_id", "autonomous_system_org_id", "bucket_name", "timestamp"], name: "metrics_projections_agg_asn_bucket_timestamp_desc_idx", order: { timestamp: :desc }
    t.index ["study_aggregate_id", "bucket_name", "timestamp"], name: "metrics_projections_agg_bucket_timestamp_desc_idx", order: { timestamp: :desc }
    t.index ["study_aggregate_id", "timestamp"], name: "metrics_projections_agg_timestamp_desc_idx", order: { timestamp: :desc }
    t.index ["study_aggregate_id"], name: "index_metrics_projections_on_study_aggregate_id"
  end

  create_table "ndt7_diagnose_reports", force: :cascade do |t|
    t.bigint "client_id"
    t.jsonb "report"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["client_id"], name: "index_ndt7_diagnose_reports_on_client_id"
  end

  create_table "notified_study_goals", force: :cascade do |t|
    t.bigint "geospace_id"
    t.bigint "autonomous_system_org_id"
    t.integer "goal"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["autonomous_system_org_id"], name: "index_notified_study_goals_on_autonomous_system_org_id"
    t.index ["geospace_id"], name: "index_notified_study_goals_on_geospace_id"
  end

  create_table "online_client_count_projections", force: :cascade do |t|
    t.bigint "account_id"
    t.bigint "autonomous_system_id"
    t.bigint "location_id"
    t.integer "online", default: 0
    t.integer "total", default: 0
    t.integer "total_in_service", default: 0
    t.datetime "timestamp"
    t.bigint "event_id"
    t.integer "incr"
    t.index ["account_id"], name: "index_online_client_count_projections_on_account_id"
    t.index ["autonomous_system_id"], name: "index_online_client_count_projections_on_autonomous_system_id"
    t.index ["event_id"], name: "index_online_client_count_projections_on_event_id"
    t.index ["location_id"], name: "index_online_client_count_projections_on_location_id"
  end

  create_table "packages", force: :cascade do |t|
    t.string "name"
    t.string "os"
    t.bigint "client_version_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["client_version_id"], name: "index_packages_on_client_version_id"
  end

  create_table "pod_connectivity_configs", force: :cascade do |t|
    t.bigint "client_id", null: false
    t.bigint "wlan_interface_id"
    t.boolean "wlan_enabled", default: false
    t.string "selected_ssid"
    t.string "current_ssid"
    t.boolean "wlan_connected", default: false
    t.index ["client_id"], name: "index_pod_connectivity_configs_on_client_id"
    t.index ["wlan_interface_id"], name: "index_pod_connectivity_configs_on_wlan_interface_id"
  end

  create_table "pod_network_interfaces", force: :cascade do |t|
    t.bigint "client_id", null: false
    t.string "name"
    t.string "mac_address"
    t.jsonb "ips"
    t.boolean "wireless", default: false
    t.boolean "default", default: false
    t.index ["client_id", "name"], name: "index_pod_network_interfaces_on_client_id_and_name", unique: true
    t.index ["client_id"], name: "index_pod_network_interfaces_on_client_id"
  end

  create_table "public_page_contact_submissions", force: :cascade do |t|
    t.string "first_name"
    t.string "last_name"
    t.string "email"
    t.string "phone_number"
    t.integer "consumer_type"
    t.string "business_name"
    t.string "state"
    t.string "county"
    t.string "isp"
    t.integer "connection_type"
    t.string "download_speed"
    t.string "upload_speed"
    t.integer "connection_placement"
    t.integer "service_satisfaction"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "recent_searches", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "location_id"
    t.bigint "client_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["client_id"], name: "index_recent_searches_on_client_id"
    t.index ["location_id"], name: "index_recent_searches_on_location_id"
    t.index ["user_id"], name: "index_recent_searches_on_user_id"
  end

  create_table "shared_accounts", force: :cascade do |t|
    t.bigint "original_account_id", null: false
    t.bigint "shared_to_account_id", null: false
    t.datetime "deleted_at"
    t.datetime "shared_at", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["original_account_id"], name: "index_shared_accounts_on_original_account_id"
    t.index ["shared_to_account_id"], name: "index_shared_accounts_on_shared_to_account_id"
  end

  create_table "snapshots", force: :cascade do |t|
    t.bigint "event_id"
    t.string "aggregate_type"
    t.bigint "aggregate_id"
    t.jsonb "state"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["aggregate_type", "aggregate_id"], name: "index_snapshots_on_aggregate"
    t.index ["event_id"], name: "index_snapshots_on_event_id"
  end

  create_table "study_aggregates", force: :cascade do |t|
    t.string "name"
    t.bigint "parent_aggregate_id"
    t.bigint "geospace_id"
    t.bigint "autonomous_system_org_id"
    t.string "level"
    t.boolean "study_aggregate", default: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "locations_goal"
    t.index ["autonomous_system_org_id"], name: "index_study_aggregates_on_autonomous_system_org_id"
    t.index ["geospace_id"], name: "index_study_aggregates_on_geospace_id"
    t.index ["parent_aggregate_id"], name: "index_study_aggregates_on_parent_aggregate_id"
  end

  create_table "study_level_projections", force: :cascade do |t|
    t.datetime "timestamp"
    t.bigint "parent_aggregate_id"
    t.bigint "study_aggregate_id"
    t.bigint "autonomous_system_org_id"
    t.bigint "location_id"
    t.bigint "event_id"
    t.bigint "measurement_id"
    t.bigint "client_speed_test_id"
    t.geography "lonlat", limit: {:srid=>4326, :type=>"st_point", :geographic=>true}
    t.string "level"
    t.integer "online_count", default: 0
    t.integer "incr", default: 0
    t.boolean "location_online", default: false
    t.integer "location_online_incr", default: 0
    t.integer "measurement_count", default: 0
    t.integer "measurement_incr", default: 0
    t.integer "points_with_tests_count", default: 0
    t.integer "points_with_tests_incr", default: 0
    t.integer "days_online_count", default: 0
    t.integer "completed_locations_count", default: 0
    t.integer "completed_locations_incr", default: 0
    t.boolean "location_completed", default: false
    t.string "metric_type"
    t.index ["autonomous_system_org_id"], name: "index_study_level_projections_on_autonomous_system_org_id"
    t.index ["client_speed_test_id"], name: "index_study_level_projections_on_client_speed_test_id"
    t.index ["event_id"], name: "index_study_level_projections_on_event_id"
    t.index ["location_id"], name: "index_study_level_projections_on_location_id"
    t.index ["measurement_id"], name: "index_study_level_projections_on_measurement_id"
    t.index ["metric_type", "timestamp"], name: "index_study_level_projections_on_metric_type_and_timestamp", order: { timestamp: :desc }
    t.index ["metric_type"], name: "index_study_level_projections_on_metric_type"
    t.index ["parent_aggregate_id"], name: "index_study_level_projections_on_parent_aggregate_id"
    t.index ["study_aggregate_id"], name: "index_study_level_projections_on_study_aggregate_id"
  end

  create_table "system_outages", force: :cascade do |t|
    t.string "description"
    t.datetime "start_time"
    t.datetime "end_time"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "tailscale_auth_keys", force: :cascade do |t|
    t.bigint "client_id", null: false
    t.string "key_id", null: false
    t.string "raw_key"
    t.datetime "consumed_at"
    t.datetime "expires_at"
    t.datetime "revoked_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["client_id"], name: "index_tailscale_auth_keys_on_client_id"
  end

  create_table "update_groups", force: :cascade do |t|
    t.string "name"
    t.bigint "client_version_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "watchdog_version_id"
    t.boolean "default", default: false
    t.bigint "old_client_version_id"
    t.bigint "old_watchdog_version_id"
    t.integer "client_version_rollout_percentage", default: 100
    t.integer "watchdog_version_rollout_percentage", default: 100
    t.index ["client_version_id"], name: "index_update_groups_on_client_version_id"
    t.index ["old_client_version_id"], name: "index_update_groups_on_old_client_version_id"
    t.index ["old_watchdog_version_id"], name: "index_update_groups_on_old_watchdog_version_id"
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
    t.boolean "super_user", default: false
    t.string "pending_downloads", array: true
    t.string "data_cap_unit", default: "GB"
    t.boolean "ftue_disabled", default: false
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

  create_table "widget_clients", force: :cascade do |t|
    t.string "client_name"
    t.string "client_urls", array: true
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "autonomous_systems", "autonomous_system_orgs"
  add_foreign_key "client_count_logs", "client_count_aggregates"
  add_foreign_key "client_event_logs", "clients"
  add_foreign_key "client_online_logs", "accounts"
  add_foreign_key "client_online_logs", "clients"
  add_foreign_key "client_speed_tests", "autonomous_systems"
  add_foreign_key "client_speed_tests", "widget_clients", column: "tested_by"
  add_foreign_key "clients", "accounts"
  add_foreign_key "clients", "autonomous_systems"
  add_foreign_key "clients", "client_versions"
  add_foreign_key "clients", "client_versions", column: "target_client_version_id"
  add_foreign_key "clients", "locations"
  add_foreign_key "clients", "update_groups"
  add_foreign_key "clients", "users", column: "claimed_by_id"
  add_foreign_key "clients", "watchdog_versions"
  add_foreign_key "clients", "watchdog_versions", column: "target_watchdog_version_id"
  add_foreign_key "distributions", "client_versions"
  add_foreign_key "invites", "accounts"
  add_foreign_key "invites", "users"
  add_foreign_key "location_groups", "accounts"
  add_foreign_key "location_metadata_projections", "autonomous_system_orgs"
  add_foreign_key "location_metadata_projections", "locations"
  add_foreign_key "locations", "accounts"
  add_foreign_key "locations", "location_groups"
  add_foreign_key "locations", "users", column: "created_by_id"
  add_foreign_key "measurements", "accounts"
  add_foreign_key "measurements", "autonomous_systems"
  add_foreign_key "measurements", "clients"
  add_foreign_key "measurements", "locations"
  add_foreign_key "measurements", "users", column: "measured_by_id"
  add_foreign_key "metrics_projections", "autonomous_system_orgs"
  add_foreign_key "metrics_projections", "study_aggregates"
  add_foreign_key "metrics_projections", "study_aggregates", column: "parent_aggregate_id"
  add_foreign_key "ndt7_diagnose_reports", "clients"
  add_foreign_key "online_client_count_projections", "accounts"
  add_foreign_key "online_client_count_projections", "autonomous_systems"
  add_foreign_key "online_client_count_projections", "events"
  add_foreign_key "online_client_count_projections", "locations"
  add_foreign_key "packages", "client_versions"
  add_foreign_key "pod_connectivity_configs", "clients"
  add_foreign_key "pod_connectivity_configs", "pod_network_interfaces", column: "wlan_interface_id"
  add_foreign_key "pod_network_interfaces", "clients"
  add_foreign_key "recent_searches", "clients"
  add_foreign_key "recent_searches", "locations"
  add_foreign_key "recent_searches", "users"
  add_foreign_key "shared_accounts", "accounts", column: "original_account_id"
  add_foreign_key "shared_accounts", "accounts", column: "shared_to_account_id"
  add_foreign_key "snapshots", "events"
  add_foreign_key "study_aggregates", "autonomous_system_orgs"
  add_foreign_key "study_aggregates", "geospaces"
  add_foreign_key "study_aggregates", "study_aggregates", column: "parent_aggregate_id"
  add_foreign_key "study_level_projections", "autonomous_system_orgs"
  add_foreign_key "study_level_projections", "client_speed_tests"
  add_foreign_key "study_level_projections", "events"
  add_foreign_key "study_level_projections", "locations"
  add_foreign_key "study_level_projections", "measurements"
  add_foreign_key "study_level_projections", "study_aggregates"
  add_foreign_key "study_level_projections", "study_aggregates", column: "parent_aggregate_id"
  add_foreign_key "update_groups", "client_versions"
  add_foreign_key "update_groups", "client_versions", column: "old_client_version_id"
  add_foreign_key "update_groups", "watchdog_versions"
  add_foreign_key "update_groups", "watchdog_versions", column: "old_watchdog_version_id"
  add_foreign_key "users_accounts", "accounts"
  add_foreign_key "users_accounts", "users"

  create_view "aggregated_measurements_by_hours", materialized: true, sql_definition: <<-SQL
      SELECT date_trunc('h'::text, measurements.processed_at) AS "time",
      measurements.account_id,
      autonomous_systems.autonomous_system_org_id,
      measurements.location_id,
      percentile_disc((0.5)::double precision) WITHIN GROUP (ORDER BY measurements.download) AS download_median,
      min(measurements.download) AS download_min,
      max(measurements.download) AS download_max,
      percentile_disc((0.5)::double precision) WITHIN GROUP (ORDER BY measurements.upload) AS upload_median,
      min(measurements.upload) AS upload_min,
      max(measurements.upload) AS upload_max,
      percentile_disc((0.5)::double precision) WITHIN GROUP (ORDER BY measurements.latency) AS latency_median,
      min(measurements.latency) AS latency_min,
      max(measurements.latency) AS latency_max
     FROM (measurements
       LEFT JOIN autonomous_systems ON ((autonomous_systems.id = measurements.autonomous_system_id)))
    GROUP BY (date_trunc('h'::text, measurements.processed_at)), measurements.account_id, autonomous_systems.autonomous_system_org_id, measurements.location_id
    ORDER BY (date_trunc('h'::text, measurements.processed_at));
  SQL
  create_view "aggregated_measurements_by_days", materialized: true, sql_definition: <<-SQL
      SELECT date_trunc('d'::text, measurements.processed_at) AS "time",
      measurements.account_id,
      autonomous_systems.autonomous_system_org_id,
      measurements.location_id,
      percentile_disc((0.5)::double precision) WITHIN GROUP (ORDER BY measurements.download) AS download_median,
      min(measurements.download) AS download_min,
      max(measurements.download) AS download_max,
      percentile_disc((0.5)::double precision) WITHIN GROUP (ORDER BY measurements.upload) AS upload_median,
      min(measurements.upload) AS upload_min,
      max(measurements.upload) AS upload_max,
      percentile_disc((0.5)::double precision) WITHIN GROUP (ORDER BY measurements.latency) AS latency_median,
      min(measurements.latency) AS latency_min,
      max(measurements.latency) AS latency_max
     FROM (measurements
       LEFT JOIN autonomous_systems ON ((autonomous_systems.id = measurements.autonomous_system_id)))
    GROUP BY (date_trunc('d'::text, measurements.processed_at)), measurements.account_id, autonomous_systems.autonomous_system_org_id, measurements.location_id
    ORDER BY (date_trunc('d'::text, measurements.processed_at));
  SQL
end
