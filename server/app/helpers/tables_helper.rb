module TablesHelper
  module TableTypes
    MEMBERS = "Members"
    NETWORKS = "Networks"
    MEASUREMENTS = "Measurements"
    NETWORK_PODS = "NetworkPods"
    ALL_ACCOUNTS_MEMBERS = "AllAccountsMembers"
    PODS = "Pods"
  end

  module OptionsMenuType
    MEMBER = "Member"
    INVITEE = "Invitee"
    ALL_ACCOUNTS_MEMBER = "AllAccountsMember"
    NETWORK = "Network"
    NETWORKS_INDEX = "NetworksIndex"
    NETWORK_OVERVIEW = "NetworkOverview"
    PODS = "Pods"
    POD_OVERVIEW = "PodOverview"
    PODS_INDEX = "PodsIndex"
  end

  def self.get_footer_label(type)
    case type
    when TableTypes::MEMBERS
      'Members'
    when TableTypes::ALL_ACCOUNTS_MEMBERS
      'Members'
    when TableTypes::NETWORKS
      'Networks'
    when TableTypes::MEASUREMENTS
      'Measurements'
    when TableTypes::NETWORK_PODS
      'Pods'
    when TableTypes::PODS
      'Pods'
    end
  end

  def self.widths(table_type, is_all_accounts = false, is_super_user = false)
    case table_type
    when TableTypes::MEMBERS
      [
        '4%',
        is_all_accounts ? '31%' : '46%',
        is_all_accounts ? '15%' : '0%',
        '15%',
        '15%',
        '15%',
        '5%'
      ]
    when TableTypes::NETWORKS
      [
        '4%',
        '33%',
        '16%',
        '21%',
        '21%',
        '5%'
      ]
    when TableTypes::MEASUREMENTS
      [
        '12%',
        '10%',
        '10%',
        '14%',
        '14%',
        '10%',
        '10%',
        '10%',
        '10%',
      ]
    when TableTypes::NETWORK_PODS
      [
        '4%',
        '40%',
        '17%',
        '17%',
        '17%',
        '5%'
      ]
    when TableTypes::PODS
      [
        '4%',
        get_pod_id_width(is_all_accounts, is_super_user),
        is_all_accounts ? '17%' : '0%',
        is_super_user ? '17%' : '0%',
        '17%',
        '5%'
      ]
    end
  end

  def self.titles(table_type, is_all_accounts = false, is_super_user = false)
    rows = []
    case table_type
    when TableTypes::MEMBERS
      rows = [
        *rows,
        { text: 'Checkbox', hidden: true },
        { text: 'Name', sort: 'name', sort_action: 'click->table#sortBy' },
      ]
      if is_all_accounts
        rows = [
          *rows,
          { text: 'Account(s)', hidden: false },
          { text: 'Resend', hidden: true },
          { text: 'Actions', hidden: true }
        ]
      else
        rows = [
          *rows,
          { text: 'Account', hidden: false },
          { text: 'Invited' },
          { text: 'Join date' },
          { text: 'Resend', hidden: true },
          { text: 'Actions', hidden: true }
        ]
      end
    when TableTypes::NETWORKS
      rows = [
        *rows,
        { text: 'Checkbox', hidden: true },
        { text: 'Network', sort: 'name', sort_action: 'click->table#sortBy' },
        { text: 'Category' },
        { text: 'Avg. Download (24h)', icon_before: 'download-icon.png' },
        { text: 'Avg. Upload (24h)', icon_before: 'upload-icon.png' },
        { text: 'Actions', hidden: true }
      ]
    when TableTypes::MEASUREMENTS
      rows = [
        *rows,
        { text: 'Time', sort: 'created_at', sort_action: 'click->table#sortBy' },
        { text: 'Style', sort: 'style', sort_action: 'click->table#sortBy' },
        { text: 'Connection', sort: 'wireless', sort_action: 'click->table#sortBy' },
        { text: 'Download', sort: 'download', sort_action: 'click->table#sortBy' },
        { text: 'Upload', sort: 'upload', sort_action: 'click->table#sortBy' },
        { text: 'Latency', sort: 'latency', sort_action: 'click->table#sortBy' },
        { text: 'Loss', sort: 'loss_rate', sort_action: 'click->table#sortBy' },
        { text: 'Jitter', sort: 'jitter', sort_action: 'click->table#sortBy' },
        { text: 'Actions', hidden: true }
      ]
    when TableTypes::NETWORK_PODS
      rows = [
        *rows,
        { text: 'Checkbox', hidden: true },
        { text: 'Pod ID' },
        { text: 'Avg. Download', icon_before: 'download-icon.png' },
        { text: 'Avg. Upload', icon_before: 'upload-icon.png' },
        { text: 'Last measurement' },
        { text: 'Actions', hidden: true }
      ]
    when TableTypes::PODS
      rows = [
        *rows,
        { text: 'Checkbox', hidden: true },
        { text: 'Pod ID' },
        { text: 'Account', hidden: !is_all_accounts },
        { text: 'Release', hidden: !is_super_user },
        { text: 'Last measurement' },
        { text: 'Actions', hidden: true }
      ]
    end
    rows
  end

  private

  def self.get_pod_id_width(is_all_accounts, is_super_user)
    width = '74%'
    if (is_all_accounts && !is_super_user) ||
      (!is_all_accounts && is_super_user)
      width = '57%'
    elsif (is_all_accounts && is_super_user)
      width = '40%'
    end
    width
  end
end