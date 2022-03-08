require "csv"

class Measurement < ApplicationRecord
  belongs_to :client
  belongs_to :location, optional: true
  belongs_to :user
  has_one_attached :result

  def self.to_ndt7_csv
    info_attributes = %w{location_name client_name user}
    attributes = %w{id style upload download jitter latency created_at}
    extended_attributes = %w{State CAState Retransmits Probes Backoff Options WScale AppLimited RTO ATO SndMSS RcvMSS Unacked Sacked Lost Retrans Fackets LastDataSent LastAckSent LastDataRecv LastAckRecv PMTU RcvSsThresh RTT RTTVar SndSsThresh SndCwnd AdvMSS Reordering RcvRTT RcvSpace TotalRetrans PacingRate MaxPacingRate BytesAcked BytesReceived SegsOut SegsIn NotsentBytes MinRTT DataSegsIn DataSegsOut DeliveryRate BusyTime RWndLimited SndBufLimited Delivered DeliveredCE BytesSent BytesRetrans DSackDups ReordSeen RcvOooPack SndWnd ElapsedTime}

    CSV.generate(headers: true) do |csv|
      csv << info_attributes + attributes + extended_attributes

      includes(:location, :client, :user).each do |measurement|
        info = [
          measurement.location ? measurement.location.name : "",
          measurement.client ? measurement.client.name : "",
          measurement.user ? measurement.user.email : "",
        ]

        values = attributes.map{ |attr| measurement.send(attr) }
        extended_values = extended_attributes.map{ |attr| measurement.extended_info ? measurement.extended_info[attr] : "" }

        csv << info + values + extended_values
      end
    end
  end

  def self.to_csv
    CSV.generate(headers: true) do |csv|
      csv << %w{id location_name client_name user style upload download jitter latency created_at}

      includes(:location, :client, :user).each do |measurement|
        csv << [
          measurement.id,
          measurement.location ? measurement.location.name : "",
          measurement.client ? measurement.client.name : "",
          measurement.user ? measurement.user.email : "",
          measurement.style,
          measurement.upload,
          measurement.download,
          measurement.jitter,
          measurement.latency,
          measurement.created_at
        ]
      end
    end
  end
end
