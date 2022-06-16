module ApplicationHelper

  def active_path?(path)
    "active" if request.path.starts_with?(path)
  end

  def active_full_path?(path)
    "active" if active_path?(path) && request.path == path
  end

  def pretty_print_date(date)
    date.strftime('%b %d, %Y')
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
  def paginate_elements(items, possible_filter_symbols)
    possible_filter_symbols.each do |symbol|
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
    @items = items.order(created_at: :desc).limit(per_page).offset(paginate_offset)
  end

  ##
  # This method just retrieves the module's items and total variables set in the
  # paginate_elements previously (should be present in the same screen probably)
  # and renders the table pagination helper
  def pagination_footer
    render partial: "pagination_footer", locals: { items: @items, total: @total }
  end
end
