module ApplicationHelper
  TB_MULTIPLIER = 1024**4
  GB_MULTIPLIER = 1024**3
  MB_MULTIPLIER = 1024**2

  def get_minimum_precision(value)
    (1..10).find {|digit_count| value.round(digit_count).to_s.split('.')[1].to_i != 0 } || 1
  end

  def has_pending_invites?(user = current_user)
    Invite.where(email: user.email).count > 0
  end

  def preferred_unit_humanized(given_unit = nil)
    unit = given_unit || current_user.data_cap_unit
    if unit == "TB"
      "Terabytes"
    elsif unit == "GB"
      "Gigabytes"
    elsif unit == "MB"
      "Megabytes"
    else
      "Bytes"
    end
  end

  def get_ideal_data_unit(value)
    remaining_value = value.to_i
    exponent = 0
    while remaining_value >= 1_000
      remaining_value /= 1_000
      exponent += 1
    end
    unit = case exponent
            when 0
              "B"
            when 1
              "KB"
            when 2
              "MB"
            when 3
              "GB"
            when 4
              "TB"
            else
              "TB"
           end
  end

  def get_value_in_preferred_unit(value, unit = nil)
    if unit.present?
      case unit
      when "TB"
        value /= TB_MULTIPLIER
      when "GB"
        value /= GB_MULTIPLIER
      when "MB"
        value /= MB_MULTIPLIER
      else
        value = value.round(0)
      end
      return value
    end
    if current_user.prefers_tb_unit
      value / TB_MULTIPLIER
    elsif current_user.prefers_gb_unit
      value / GB_MULTIPLIER
    else
      value / MB_MULTIPLIER
    end
  end

  def unassigned_pods_count
    unassigned = policy_scope(Client).where(location: nil)
    unassigned = unassigned.where(account: current_account) unless current_account.is_all_accounts?
    unassigned.count
  end

  def are_there_unassigned_pods?
    unassigned_pods_count.positive?
  end

  def is_super_user_disabled?
    possible_cookie = cookies[:radar_super_user_disabled]
    possible_cookie.present? && possible_cookie == "true"
  end

  def is_active_path?(path)
    request.path.starts_with? path
  end

  def is_active_full_path?(path)
    is_active_path?(path) && request.path == path
  end

  def active_path?(path)
    if path == dashboard_path && request.path == comparison_dashboard_path
      "active"
    elsif path == locations_path && FeatureFlagHelper.is_available('networks', current_user)
      "active" if request.path.starts_with?(path) || request.path.starts_with?(clients_path)
    else
      "active" if request.path.starts_with?(path)
    end

  end

  def active_sidebar_item?(path)
    "sidebar-item--text-active" if request.path.starts_with?(path)
  end

  def active_full_path?(path)
    "active" if active_path?(path) && request.path == path
  end

  def pretty_print_date(date)
    if date.nil?
      return "-"
    end
    date.localtime.strftime('%b %d, %Y')
  end

  def pretty_print_date_with_time(date_time)
    if date_time.nil?
      return "-"
    end
    date_time.localtime.strftime('%b %d, %Y %I:%M %p')
  end

  def empty_search_params?
    # controller & action
    params.values.length == 2
  end

  def get_bytes_with_user_units(bytes, user)
    unit = current_user&.data_cap_unit || 'MB'
    multiplier = 1024 ** (unit == 'MB' ? 2 : unit == 'GB' ? 3 : 4)
    amount = (bytes / multiplier).round(0)
    "#{amount} #{unit}"
  end

  ##### PAGINATION METHODS #####

  def get_date_range(range)
    case range
    when 'last-week'
      [Time.now - 7.day, Time.now]
    when 'last-month'
      [Time.now - 30.day, Time.now]
    when 'last-six-months'
      [Time.now - 180.day, Time.now]
    when 'last-year'
      [Time.now - 365.day, Time.now]
    else
      [nil, Time.now]
    end
  end

  def default_items_per_page
    10
  end

  def page_number
    params[:page]&.to_i || 1
  end

  def per_page
    params[:per_page]&.to_i || default_items_per_page
  end

  def paginate_offset
    (page_number - 1) * per_page
  end

  ###
  # The idea is to execute this method when we need any pagination
  # sending the ActiveRecord received from the controller as well
  # as an array of possible symbols to look for in the URL query params
  # not including page, page_offset, which are shared between all.
  # for example: the measurements URL has 2 possible filters, style & range
  # /measurements?range=last-week&style=NDT7 could be en example.
  # execution would look like: <%= paginate_elements(@measurements, [:style, :range])
  # allowing for an abstracted implementation
  def paginate_elements(items, possible_filters = [], possible_order = nil)
    possible_filters.each do |symbol|
      if params[symbol].present?
        if symbol == :range
          range = get_date_range(params[:range])
          items = items.where(created_at: range[0]..range[1])
        else
          items = items.where(symbol => params[symbol])
        end
      end
    end
    @total = items.length
    if possible_order.nil?
      @items = items.order(created_at: :desc).limit(per_page).offset(paginate_offset)
    else
      @items = items.order(possible_order).limit(per_page).offset(paginate_offset)
    end
  end

  ##
  # This method just retrieves the module's items and total variables set in the
  # paginate_elements previously (should be present in the same screen probably)
  # and renders the table pagination helper
  def pagination_footer
    render partial: "pagination_footer", locals: { items: @items, total: @total }
  end
end
