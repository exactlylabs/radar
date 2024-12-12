class Projector
  include Fetchers

  cattr_accessor :projection_model

  def initialize
    @aggregate_states = {}
    @consumer_offset = ConsumerOffset.find_or_create_by!(consumer_id: self.projection_model.name)
    @state = @consumer_offset.state
  end

  def inspect
    "#<#{self.class.name}:#{self.object_id}>"
  end

  def self.clear
    ActiveRecord::Base.connection.transaction do
      raise "missing projection_model" if self.projection_model.nil?
      ActiveRecord::Base.connection.execute("TRUNCATE TABLE #{self.projection_model.table_name}")
      ConsumerOffset.find_by(consumer_id: self.projection_model.name)&.destroy
    end
  end


  def self.replay!
    self.clear
    self.new.process!
  end

  def process!
    raise "Not Implemented"
  end

  def raw_connection
    conn = ActiveRecord::Base.connection_pool.checkout
    begin
      yield conn.raw_connection
    ensure
      ActiveRecord::Base.connection_pool.checkin(conn)
    end
  end

  # Compare states with a caching mechanism to avoid duplicated queries
  def with_previous_state(model, current_state, aggregate_id, timestamp)
    @aggregate_states ||= {}
    key = "#{model.name}-#{aggregate_id}"
    if @aggregate_states[key].nil?
      previous_event = Event.of(model).where(aggregate_id: aggregate_id).where("timestamp < ?", timestamp).order(:timestamp => :asc, :version => :asc).last
      @aggregate_states[key] = previous_event&.snapshot&.state
    end
    yield @aggregate_states[key], current_state

    @aggregate_states[key] = current_state
  end
end
