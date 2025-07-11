require "csv"

class Measurement < ApplicationRecord

  belongs_to :client
  belongs_to :location, optional: true
  belongs_to :account, optional: true
  belongs_to :autonomous_system, optional: true
  has_one_attached :result

  def read_result
    if self.result.attached?
      content = self.result.download
      self.gzip? ? ActiveSupport::Gzip.decompress(content) : content
    end
  end

  def self.to_ndt7_csv(measurements)
    info_attributes = %w{id client_id account location_name latitude longitude address loss_rate}
    attributes = %w{style upload download avg_data_used jitter latency created_at(UTC+0)}
    extended_attributes = %w{State CAState Retransmits Probes Backoff Options WScale AppLimited RTO ATO SndMSS RcvMSS Unacked Sacked Lost Retrans Fackets LastDataSent LastAckSent LastDataRecv LastAckRecv PMTU RcvSsThresh RTT RTTVar SndSsThresh SndCwnd AdvMSS Reordering RcvRTT RcvSpace TotalRetrans PacingRate MaxPacingRate BytesAcked BytesReceived SegsOut SegsIn NotsentBytes MinRTT DataSegsIn DataSegsOut DeliveryRate BusyTime RWndLimited SndBufLimited Delivered DeliveredCE BytesSent BytesRetrans DSackDups ReordSeen RcvOooPack SndWnd ElapsedTime}

    CSV.generate(headers: true) do |csv|
      csv << info_attributes + attributes + extended_attributes

      measurements.includes(:location, :client, :account).each do |measurement|
        info = [
          measurement.id,
          measurement.client ? measurement.client.unix_user : "",
          measurement.account ? measurement.account.name : "",
          measurement.location ? measurement.location.name : "",
          measurement.location ? measurement.location.latitude : "",
          measurement.location ? measurement.location.longitude : "",
          measurement.location ? measurement.location.address : "",
          measurement.extended_info ? measurement.extended_info["BytesRetrans"].to_f / measurement.extended_info["BytesSent"].to_f : "",
        ]

        values = attributes.map do |attr|
          if attr == 'created_at(UTC+0)'
            measurement.created_at.strftime("%m/%d/%Y %H:%M:%S")
          else
            measurement.send(attr)
          end
        end

        extended_values = extended_attributes.map { |attr| measurement.extended_info ? measurement.extended_info[attr] : "" }

        csv << info + values + extended_values
      end
    end
  end

  def self.to_ndt7_csv_enumerator(measurements)
    info_attributes = %w{id client_id account location_name latitude longitude address loss_rate}
    attributes = %w{style upload download avg_data_used jitter latency created_at(UTC+0)}
    extended_attributes = %w{State CAState Retransmits Probes Backoff Options WScale AppLimited RTO ATO SndMSS RcvMSS Unacked Sacked Lost Retrans Fackets LastDataSent LastAckSent LastDataRecv LastAckRecv PMTU RcvSsThresh RTT RTTVar SndSsThresh SndCwnd AdvMSS Reordering RcvRTT RcvSpace TotalRetrans PacingRate MaxPacingRate BytesAcked BytesReceived SegsOut SegsIn NotsentBytes MinRTT DataSegsIn DataSegsOut DeliveryRate BusyTime RWndLimited SndBufLimited Delivered DeliveredCE BytesSent BytesRetrans DSackDups ReordSeen RcvOooPack SndWnd ElapsedTime}
    @enumerator = Enumerator.new do |yielder|
      yielder << CSV.generate_line(info_attributes + attributes + extended_attributes)
      measurements.includes(:location, :client, :account).find_each do |measurement|
        info = [
          measurement.id,
          measurement.client ? measurement.client.unix_user : "",
          measurement.account ? measurement.account.name : "",
          measurement.location ? measurement.location.name : "",
          measurement.location ? measurement.location.latitude : "",
          measurement.location ? measurement.location.longitude : "",
          measurement.location ? measurement.location.address : "",
          measurement.extended_info ? measurement.extended_info["BytesRetrans"].to_f / measurement.extended_info["BytesSent"].to_f : "",
        ]

        values = attributes.map do |attr|
          if attr == 'created_at(UTC+0)'
            measurement.created_at.strftime("%m/%d/%Y %H:%M:%S")
          else
            measurement.send(attr)
          end
        end

        extended_values = extended_attributes.map { |attr| measurement.extended_info ? measurement.extended_info[attr] : "" }
        yielder << CSV.generate_line(info + values + extended_values)
      end
    end
  end

  def self.to_ndt7_csv_file(measurements)
    tmp_file = Tempfile.new("tmp_all_ndt7_measurements.csv")
    File.open(tmp_file.path, 'w') do |file|
      to_ndt7_csv_enumerator(measurements).each_with_index do |line, index|
        file.write(line)
      end
    end
    tmp_file
  end

  def self.to_csv(measurements)
    CSV.generate(headers: true) do |csv|
      csv << %w{id client_id account location_name latitude longitude address style upload download avg_data_used jitter latency created_at(UTC+0)}

      measurements.includes(:location, :client, :account).each do |measurement|
        csv << [
          measurement.id,
          measurement.client ? measurement.client.unix_user : "",
          measurement.account ? measurement.account.name : "",
          measurement.location ? measurement.location.name : "",
          measurement.location ? measurement.location.latitude : "",
          measurement.location ? measurement.location.longitude : "",
          measurement.location ? measurement.location.address : "",
          measurement.style,
          measurement.upload,
          measurement.download,
          measurement.avg_data_used,
          measurement.jitter,
          measurement.latency,
          measurement.created_at.strftime("%m/%d/%Y %H:%M:%S"),
        ]
      end
    end
  end

  def self.to_csv_enumerator(measurements)
    @enumerator = Enumerator.new do |yielder|
      yielder << CSV.generate_line(%w{id client_id account location_name latitude longitude address style upload download avg_data_used jitter latency created_at(UTC+0)})
      measurements.includes(:location, :client, :account).find_each do |measurement|

        yielder << CSV.generate_line([
                                       measurement.id,
                                       measurement.client ? measurement.client.unix_user : "",
                                       measurement.account ? measurement.account.name : "",
                                       measurement.location ? measurement.location.name : "",
                                       measurement.location ? measurement.location.latitude : "",
                                       measurement.location ? measurement.location.longitude : "",
                                       measurement.location ? measurement.location.address : "",
                                       measurement.style,
                                       measurement.upload,
                                       measurement.download,
                                       measurement.avg_data_used,
                                       measurement.jitter,
                                       measurement.latency,
                                       measurement.created_at.strftime("%m/%d/%Y %H:%M:%S"),
                                     ])
      end
    end
  end

  def self.to_csv_file(measurements)
    tmp_file = Tempfile.new("tmp_all_measurements.csv")
    File.open(tmp_file.path, 'w') do |file|
      to_csv_enumerator(measurements).each_with_index do |line, index|
        file.write(line)
      end
    end
    tmp_file
  end

  def avg_data_used
    if self.download_total_bytes && self.upload_total_bytes
      mbytes = ((self.download_total_bytes + self.upload_total_bytes) / (1024 ** 2)).round(0)
      "#{mbytes} MB"
    else
      "N/A"
    end
  end

  def get_download
    if self.download.present?
      "#{self.download.round(3)} Mbps"
    else
      "N/A"
    end
  end

  def get_upload
    if self.upload.present?
      "#{self.upload.round(3)} Mbps"
    else
      "N/A"
    end
  end

  def get_jitter
    if self.jitter.present?
      "#{self.jitter.round(3)} ms"
    else
      "N/A"
    end
  end

  def get_latency
    if self.latency.present?
      "#{self.latency.round(3)} ms"
    else
      "N/A"
    end
  end

  def get_location
    if self.location.present?
      "#{self.location.latitude}, #{self.location.longitude}"
    else
      "Unavailable"
    end
  end

  def get_connection
    self.wireless ? "Wi-Fi" : "Wired"
  end

end
