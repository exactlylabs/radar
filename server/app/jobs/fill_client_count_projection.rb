class FillClientCountProjection < ProjectionJob

  def perform()
    OnlineClientCountHandler.new.process!
  end
end
