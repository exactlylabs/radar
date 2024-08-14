module OutagesHelper

  def get_outage_icon(outage)
    type = outage['outage_type']
    case type
    when 'network_failure'
      'isp-outage-icon.png'
    when 'isp_outage'
      'pod-failure-outage-icon.png'
    when 'power_outage'
      'power-outage-icon.png'
    when 'unknown_reason'
      'generic-outage-icon.png'
    end
  end

  # Join outages based on their type + parent
  # If no parent, then the join group will be of a single outage.
  def self.join_by_parent(outages)
    isp_outages = {}
    single_outages = []
    outages.each do |outage|
      if outage["isp_outage_id"].present?
        isp_outages[outage["isp_outage_id"]] ||= {
          "id" => outage["isp_outage_id"],
          "outage_type" => outage["outage_type"],
          "autonomous_system_id" => outage["autonomous_system_id"],
          "started_at" => outage["isp_outage_started_at"],
          "resolved_at" => outage["isp_outage_resolved_at"],
          "network_outages" => []
        }
        isp_outages[outage["isp_outage_id"]]["network_outages"] << outage
      else
        single_outages << {
          "id" => outage["id"],
          "outage_type" => outage["outage_type"],
          "autonomous_system_id" => outage["autonomous_system_id"],
          "started_at" => outage["started_at"],
          "resolved_at" => outage["resolved_at"],
          "network_outages" => [outage]
        }
      end
    end
    isp_outages.values + single_outages
  end

  def self.group_outages(outages, order='asc', already_grouped=false)
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

      if already_grouped
        outages_obj[group_idx][:outages] << outage
        if outage['resolved_at'] > outages_obj[group_idx][:resolved_at]
          new_resolved_at = outage['resolved_at']
          outages_obj[group_idx][:resolved_at] = new_resolved_at
          outages_obj[group_idx][:duration] = new_resolved_at - outages_obj[group_idx][:started_at]
        end
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

    if order == 'desc'
      outages_obj = outages_obj.sort_by { |_, v| v[:started_at] }.reverse.to_h
    end

    outages_obj
  end

end
