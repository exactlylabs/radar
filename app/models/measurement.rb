require "csv"

class Measurement < ApplicationRecord
  belongs_to :client
  has_one_attached :result

  def self.to_ndt7_csv
    attributes = %w{id style upload download jitter latency created_at}
    extended_attributes = %w{State CAState Retransmits Probes Backoff Options WScale AppLimited RTO ATO SndMSS RcvMSS Unacked Sacked Lost Retrans Fackets LastDataSent LastAckSent LastDataRecv LastAckRecv PMTU RcvSsThresh RTT RTTVar SndSsThresh SndCwnd AdvMSS Reordering RcvRTT RcvSpace TotalRetrans PacingRate MaxPacingRate BytesAcked BytesReceived SegsOut SegsIn NotsentBytes MinRTT DataSegsIn DataSegsOut DeliveryRate BusyTime RWndLimited SndBufLimited Delivered DeliveredCE BytesSent BytesRetrans DSackDups ReordSeen RcvOooPack SndWnd ElapsedTime}

    CSV.generate(headers: true) do |csv|
      csv << attributes + extended_attributes

      all.each do |measurement|
        values = attributes.map{ |attr| measurement.send(attr) }
        extended_values = extended_attributes.map{ |attr| measurement.extended_info ? measurement.extended_info[attr] : "" }

        csv << values + extended_values
      end
    end
  end

  def self.to_csv
    attributes = %w{id style upload download jitter latency created_at}

    CSV.generate(headers: true) do |csv|
      csv << attributes

      all.each do |measurement|
        csv << attributes.map{ |attr| measurement.send(attr) }
      end
    end
  end
end
