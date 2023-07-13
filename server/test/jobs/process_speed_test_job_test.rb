require 'test_helper'
require 'minitest/mock'
require 'minitest/autorun'

class ProcessSpeedTestJobTest < ActiveJob::TestCase

  setup do
    measurement = client_speed_tests(:measurement1)
    measurement.tested_by = 1
    measurement.save
  end

  def measurement_with_result(measurement, result_file)
    json_content = file_fixture(result_file).read
    measurement.result.attach(io: StringIO.new(json_content), filename: result_file, content_type: 'application/json')
    measurement.save
    ProcessSpeedTestJob.perform_now(measurement)
  end

  test 'When_LastServerMeasurement_on_download_is_nil_Expect_downloadId_loss_and_latency_to_be_nil' do
    has_performed = measurement_with_result(client_speed_tests(:measurement1),
                                            'result_with_lastServerMeasurement_on_download_nil.json')
    measurement = ClientSpeedTest.last
    assert has_performed
    assert_nil measurement.loss
    assert_nil measurement.latency
    assert_nil measurement.download_id
    assert_equal measurement.upload_id, 'ndt-8q4v2_1684399001_000000000009CE92'
  end

  test 'When_LastServerMeasurement_on_upload_is_nil_Expect_uploadId_to_be_nil' do
    has_performed = measurement_with_result(client_speed_tests(:measurement1),
                                            'result_with_lastServerMeasurement_on_upload_nil.json')
    measurement = ClientSpeedTest.last
    assert has_performed
    assert_equal measurement.loss, 0
    assert_equal measurement.latency, 63.0
    assert_equal measurement.download_id, 'ndt-bx8km_1685156513_0000000000340D1E'
    assert_nil measurement.upload_id
  end

  test 'When_LastServerMeasurement_on_download_and_upload_nil_Expect_uploadId_downloadId_loss_and_latency_to_be_nil' do
    has_performed = measurement_with_result(client_speed_tests(:measurement1),
                                            'result_with_lastServerMeasurement_on_download_and_upload_nil.json')
    measurement = ClientSpeedTest.last
    assert has_performed
    assert_nil measurement.loss
    assert_nil measurement.latency
    assert_nil measurement.download_id
    assert_nil measurement.upload_id
  end

  test 'When_LastServerMeasurement_on_download_and_upload_not_nil_Expect_uploadId_downloadId_loss_and_latency_not_to_be_nil' do
    has_performed = measurement_with_result(client_speed_tests(:measurement1),
                                            'result_with_lastServerMeasurement_on_download_and_upload.json')
    measurement = ClientSpeedTest.last
    assert has_performed
    assert_equal measurement.loss, 0
    assert_equal measurement.latency, 4
    assert_equal measurement.download_id, 'ndt-879bs_1679080442_000000000010F49A'
    assert_equal measurement.upload_id, 'ndt-879bs_1679080442_000000000010762D'
  end

  test 'When_LastServerMeasurement_nil_Expect_id_to_be_nil' do
    result_measurement = {}
    assert_nil ProcessSpeedTestJob.new.get_id(result_measurement)
  end

  test 'When_ConnectionInfo_on_LastServerMeasurement_nil_Expect_id_to_be_nil' do
    result_measurement = {
      'LastServerMeasurement' => {}
    }
    assert_nil ProcessSpeedTestJob.new.get_latency(result_measurement)
    assert_nil ProcessSpeedTestJob.new.get_loss(result_measurement)
  end

  test 'When_LastServerMeasurement_on_download_nil_Expect_loss_and_latency_to_be_nil' do
    result_measurement = {}
    assert_nil ProcessSpeedTestJob.new.get_latency(result_measurement)
    assert_nil ProcessSpeedTestJob.new.get_loss(result_measurement)
  end

  test 'When_TCPInfo_on_LastServerMeasurement_nil_Expect_loss_and_latency_to_be_nil' do
    result_measurement = {
      'LastServerMeasurement' => {}
    }
    assert_nil ProcessSpeedTestJob.new.get_latency(result_measurement)
    assert_nil ProcessSpeedTestJob.new.get_loss(result_measurement)
  end

end
