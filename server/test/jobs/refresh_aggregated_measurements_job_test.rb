require 'test_helper'

class RefreshAggregatedMeasurementsJobTest < ActiveJob::TestCase
  TABLES = RefreshAggregatedMeasurementsJob::TABLES.keys

  setup do
    @client = clients(:online_with_autonomous_system_and_location)
    @location = locations(:offline1)
    @now = Time.utc(2026, 10, 11, 18, 30)
  end

  def add_measurement(processed_at, download:, location: @location, account: accounts(:root))
    Measurement.insert_all!([{
      client_id: @client.id, location_id: location.id, account_id: account.id,
      autonomous_system_id: autonomous_systems(:as_1).id,
      download: download, upload: download / 2.0, latency: 10, download_total_bytes: 100, upload_total_bytes: 50,
      processed_at: processed_at, created_at: processed_at, updated_at: processed_at,
    }])
  end

  # What the materialized view these tables replaced would contain now.
  def view_rows(table)
    sql = File.read(Rails.root.join("db/views/#{table}_v02.sql")).delete_suffix(";\n").chomp(";")
    rows(ActiveRecord::Base.connection.select_all(sql))
  end

  def table_rows(table)
    rows(ActiveRecord::Base.connection.select_all("SELECT * FROM #{table}"))
  end

  def rows(result)
    result.to_a.map { |r| r.transform_values(&:to_s) }.sort_by(&:to_s)
  end

  def assert_matches_views
    TABLES.each do |table|
      expected = view_rows(table)
      assert_not_empty expected, table
      assert_equal expected, table_rows(table), table
    end
  end

  test "builds everything when the tables are empty" do
    add_measurement(@now - 3.days, download: 10)
    add_measurement(@now - 3.days + 5.minutes, download: 30)
    add_measurement(@now - 2.hours, download: 20)
    add_measurement(@now, download: -1)

    RefreshAggregatedMeasurementsJob.perform_now

    assert_matches_views
  end

  test "picks up new measurements in the latest buckets" do
    add_measurement(@now - 3.days, download: 10)
    add_measurement(@now - 1.hour, download: 20)
    RefreshAggregatedMeasurementsJob.perform_now

    # Committed after the previous run but processed in its last bucket, plus a new bucket.
    add_measurement(@now - 1.hour + 1.minute, download: 40)
    add_measurement(@now, download: 50)
    add_measurement(@now + 1.day, download: 60)
    RefreshAggregatedMeasurementsJob.perform_now

    assert_matches_views
  end

  test "leaves older buckets alone" do
    add_measurement(@now - 3.days, download: 10)
    add_measurement(@now, download: 20)
    RefreshAggregatedMeasurementsJob.perform_now
    before = table_rows("aggregated_measurements_by_hours")

    add_measurement(@now - 3.days, download: 90)
    RefreshAggregatedMeasurementsJob.perform_now

    assert_equal before, table_rows("aggregated_measurements_by_hours")
  end

  test "rebuild_location! follows measurements moved to another account" do
    add_measurement(@now - 3.days, download: 10)
    add_measurement(@now, download: 20)
    add_measurement(@now, download: 30, location: locations(:online1))
    RefreshAggregatedMeasurementsJob.perform_now

    Measurement.where(location: @location).update_all(account_id: accounts(:superaccount).id)
    RefreshAggregatedMeasurementsJob.rebuild_location!(@location.id)

    assert_matches_views
  end

  test "rebuild_all! recomputes every bucket" do
    add_measurement(@now - 3.days, download: 10)
    add_measurement(@now, download: 20)
    RefreshAggregatedMeasurementsJob.perform_now
    add_measurement(@now - 3.days, download: 90)

    RefreshAggregatedMeasurementsJob.rebuild_all!

    assert_matches_views
  end
end
