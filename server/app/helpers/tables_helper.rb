module TablesHelper
  module TableTypes
    MEMBERS = "Members"
    ALL_ACCOUNTS_MEMBERS = "AllAccountsMembers"
  end

  module OptionsMenuType
    MEMBER = "Member"
    INVITEE = "Invitee"
    ALL_ACCOUNTS_MEMBER = "AllAccountsMember"
  end

  def self.get_footer_label(type)
    case type
    when TableTypes::MEMBERS
    when TableTypes::ALL_ACCOUNTS_MEMBERS
      'Members'
    end
  end

  def self.widths(table_type, is_all_accounts = false, is_super_user = false)
    widths = []
    case table_type
    when TableTypes::MEMBERS
      widths = [
        *widths,
        '4%',
      ]

      if is_all_accounts
        widths = [
          *widths,
          '35%',
          '26%',
          '0%', # Need to fill with empty width to keep the same number of columns
          '0%',
          '30%',
          '5%'
        ]
      else
        widths = [
          *widths,
          '35%',
          '15%',
          '13%',
          '13%',
          '15%',
          '5%'
        ]
      end
    when TableTypes::ALL_ACCOUNTS_MEMBERS
      widths = [
        *widths,
        '30%',
        '18%',
        '18%',
        '26%',
        '8%'
      ]
    end
    widths
  end

  def self.titles(table_type, is_all_accounts, is_super_user = false)
    rows = []
    case table_type
    when TableTypes::MEMBERS
      rows = [
        *rows,
        { text: 'Checkbox', hidden: true },
        { text: 'Name', sort: 'name', sort_action: 'click->table#sortByName' },
      ]
      if is_all_accounts
        rows = [
          *rows,
          { text: 'Account(s)', hidden: false },
          { text: 'Resend', hidden: true },
          { text: 'Actions', hidden: true}
        ]
      else
        rows = [
          *rows,
          { text: 'Account', hidden: false },
          { text: 'Invited' },
          { text: 'Join date' },
          { text: 'Resend', hidden: true },
          { text: 'Actions', hidden: true}
        ]
      end
    when TableTypes::ALL_ACCOUNTS_MEMBERS
      rows = [
        *rows,
        { text: 'Name', sort: 'account_name', sort_action: 'click->table#sortByAccountName' },
        { text: 'Invited' },
        { text: 'Join date' },
        { text: 'Resend', hidden: true },
        { text: 'Actions', hidden: true}
      ]
    end
    rows
  end
end