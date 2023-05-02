class FillClientCountProjection < ProjectionJob

  def perform()
    OnlineClientCountProjection.aggregate!
  end
end