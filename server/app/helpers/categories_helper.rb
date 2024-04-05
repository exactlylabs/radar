# frozen_string_literal: true

module CategoriesHelper
  def import_categories_into_account(categories_ids, import_to_account)
    error = nil
    begin
      Category.transaction do
        # Parse string to array of integers
        categories_ids = categories_ids.split(',').map(&:to_i).select(&:positive?)
        categories_ids.each do |category_id|
          category = Category.find(category_id)
          new_category = category.dup
          new_category.account_id = import_to_account
          new_category.save!
        end
      end
    rescue Exception => e
      error = "Oops! Something went wrong. Please try again later."
    end
    error
  end
end
