class OutagesController < ApplicationController
  def detail_modal
    respond_to do |format|
      format.turbo_stream
      format.html
    end
  end
end