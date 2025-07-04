module Paginator extend ActiveSupport::Concern
  def paginate(elements, page, page_size)
    page = page.nil? ? 0 : page.to_i > 0 ? page.to_i - 1 : 0
    page_size = page_size.nil? ? 10 : page_size.to_i
    elements.offset(page * page_size).limit(page_size)
  end
end
