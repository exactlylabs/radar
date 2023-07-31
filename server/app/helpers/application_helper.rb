module ApplicationHelper
  GB_MULTIPLIER = 1024**3
  MB_MULTIPLIER = 1024**2

  def are_there_unassigned_pods?
    policy_scope(Client).where(location: nil).count > 0
  end

  def get_value_in_preferred_unit(value)
    if current_user.prefers_gb_unit
      value / GB_MULTIPLIER
    else
      value / MB_MULTIPLIER
    end
  end

  def are_there_unassigned_pods?
    policy_scope(Client).where(location: nil).count > 0
  end

  def are_there_unassigned_pods?
    policy_scope(Client).where(location: nil).count > 0
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
    if path == locations_path && FeatureFlagHelper.is_available('networks', current_user)
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
