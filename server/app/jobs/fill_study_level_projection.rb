class FillStudyLevelProjection < ProjectionJob

  def perform()
    StudyLevelHandler::Handler.new.aggregate!
  end
end