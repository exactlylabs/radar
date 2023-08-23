class FillClientCountProjection < ProjectionJob

  def perform()
    OnlineClientCountHandler.new.aggregate!
  end
end
