class PublicController < PublicApplicationController
  layout "landing", only: [:landing]

  def supported_browsers
  end

  def landing
  end

  def get_started_modal
  end
end