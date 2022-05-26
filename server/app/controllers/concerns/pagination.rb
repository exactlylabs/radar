module Pagination
  extend ActiveSupport::Concern

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

  def paginate
    ->(it){ it.order(created_at: :desc).limit(per_page).offset(paginate_offset) }
  end
end