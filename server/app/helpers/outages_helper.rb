module OutagesHelper

  def get_outage_icon(outage)
    type = outage['outage_type']
    case type
    when 'pod_failure'
      'pod-failure-outage-icon.png'
    when 'isp_outage'
      'isp-outage-icon.png'
    when 'power_outage'
      'power-outage-icon.png'
    end
  end

  def self.group_outages(outages)
    outages_obj = {}
    group_idx = 0
    outages.each do |outage|
      if outages_obj[group_idx].nil?
        outages_obj[group_idx] = {
          started_at: outage['started_at'],
          resolved_at: outage['resolved_at'],
          outages: [outage],
          duration: outage['resolved_at'] - outage['started_at']
        }
        next
      end

      if (outage['started_at'] >= outages_obj[group_idx][:started_at] &&
        outage['started_at'] <= outages_obj[group_idx][:resolved_at]) ||
        (outage['started_at'] >= outages_obj[group_idx][:started_at] &&
          outage['resolved_at'] <= outages_obj[group_idx][:resolved_at])
        outages_obj[group_idx][:outages] << outage

        if outage['resolved_at'] > outages_obj[group_idx][:resolved_at]
          new_resolved_at = outage['resolved_at']
          outages_obj[group_idx][:resolved_at] = new_resolved_at
          outages_obj[group_idx][:duration] = new_resolved_at - outages_obj[group_idx][:started_at]
        end
      else
        group_idx += 1
        outages_obj[group_idx] = {
          started_at: outage['started_at'],
          resolved_at: outage['resolved_at'],
          outages: [outage],
          duration: outage['resolved_at'] - outage['started_at']
        }
      end
    end
    outages_obj
  end

end