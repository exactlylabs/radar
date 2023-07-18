class StudyLevelHandlerTest < ActiveJob::TestCase
  setup do
    @handler = StudyLevelHandler::Handler.new
  end

  test "When_aggregate_is_called_Expect_client_event_to_be_processed" do
    e = Event.new(aggregate: clients(:pod1), name: Client::Events::CREATED, data: {}, timestamp: Time.now)
    e.save!
    mock = Minitest::Mock.new
    mock.expect(:call, nil) do |event|
      assert_equal event, e
    end

    @handler.stub(:handle_event, mock) do
      @handler.aggregate!
    end

    ConsumerOffset.find_by(consumer_id: "StudyLevelHandler#events").tap do |co|
      assert_equal co.offset, e.id
    end
  end

  test "When_aggregate_is_called_with_duplicated_event_Expect_duplicated_event_to_not_be_processed" do
    event1 = Event.create(aggregate: clients(:pod1), name: Client::Events::WENT_ONLINE, data: {}, timestamp: Time.now)
    event2 = Event.create(aggregate: clients(:pod1), name: Client::Events::WENT_ONLINE, data: {}, timestamp: Time.now)

    # Expect just event1 to be processed, but event2 to be accounted for in ConsumerOffset
    mock = Minitest::Mock.new
    mock.expect :call, nil, [event1]

    @handler.stub(:handle_event, mock) do
      @handler.aggregate!
    end

    ConsumerOffset.find_by(consumer_id: "StudyLevelHandler#events").tap do |co|
      assert_equal co.offset, event2.id
    end

  end

  test "When_aggregate_is_called_with_duplicated_event_Expect_duplicated_LOCATION_CHANGED_event_to_be_processed" do
    event1 = Event.create(aggregate: clients(:pod1), name: Client::Events::LOCATION_CHANGED, data: {}, timestamp: Time.now)
    event2 = Event.create(aggregate: clients(:pod1), name: Client::Events::LOCATION_CHANGED, data: {}, timestamp: Time.now)

    # Expect just event1 to be processed, but event2 to be accounted for in ConsumerOffset
    mock = Minitest::Mock.new
    mock.expect :call, nil, [event1]
    mock.expect :call, nil, [event2]

    @handler.stub(:handle_event, mock) do
      @handler.aggregate!
    end

    ConsumerOffset.find_by(consumer_id: "StudyLevelHandler#events").tap do |co|
      assert_equal co.offset, event2.id
    end

  end
end
