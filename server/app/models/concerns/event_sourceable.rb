module EventSourceable
  extend ActiveSupport::Concern
  
  module Hooks
    def notify_change(field, event_name, options={})
      if options[:applier].nil?
        # set the default applier for this field
        define_method("#{field}_applier") do |state, event|
          state[field.to_s] = event.data["to"]
        end
        options[:applier] = "#{field}_applier".to_sym

      end
      # Register the field to have its changes monitored
      self._config[:observed_fields] << {
        field: field, 
        event: event_name,
        applier: options[:applier]
      }
    end

    def on_create(opts={})
      if opts[:applier].present?
        self._config[:on_create][:applier] = opts[:applier]
      end
      if opts[:event_name].present?
        self._config[:on_create][:event] = opts[:event_name]
      end
      if opts[:event_data].present?
        self._config[:on_create][:event_data] = opts[:event_data]
      end
    end

    def on_destroy(opts={})
      if opts[:applier].present?
        self._config[:on_destroy][:applier] = opts[:applier]
      end
      if opts[:event_name].present?
        self._config[:on_destroy][:event] = opts[:event_name]
      end
      if opts[:event_applier].present?
        self._config[:on_destroy][:event_data] = opts[:event_data]
      end
    end

  end

  module ClassMethods
    def new_event(obj, name, data, timestamp=nil)
      timestamp = timestamp or Time.now
      evt = Event.create(aggregate: obj, name: name, data: data, timestamp: timestamp, version: Event.last_version_from(obj) + 1)
    end
  end

  included do |klass|
    klass.send("cattr_accessor", :_config)
    klass._config = {
      observed_fields: [],
      on_create: {
        event: "CREATED",
        applier: :default_created_applier,
        event_data: :default_created_event_data,
      },
      on_destroy: {
        event: "DELETED",
        applier: :default_destroyed_applier,
        event_data: :default_destroyed_event_data,
      },
    }
    has_many :snapshots, as: :aggregate
    has_many :events, as: :aggregate
    after_save :send_change_events
    after_destroy :send_destroyed_event
    klass.extend(Hooks)
    klass.extend(ClassMethods)
  end

  def create_snapshot_from_event(event, opts={}, &applier)
    last_snap = Snapshot.last_from self
    if last_snap.present? || opts[:is_created]
      state = last_snap&.state || {}
      applier.call(state, event)
      Snapshot.create aggregate: self, event: event, state: state
    end
  end

  def send_change_events()
    if id_previously_changed?
      return self.send_created_event
    end
    t = Time.now

    self._config[:observed_fields].each do |field_data|
      if self.send("saved_change_to_#{field_data[:field]}")
        event_data = {
          "from":self.send("#{field_data[:field]}_before_last_save"),
          "to": self.read_attribute(field_data[:field])
        }
        
        # event name could be a hash, mapping the value to the correct event name
        event_name = field_data[:event]
        if event_name.is_a?(Hash)
          event_name = event_name[self.read_attribute(field_data[:field])]
        end

        evt = self.class.new_event(self, event_name, event_data, timestamp=t)
        if field_data[:applier].present?
          self.create_snapshot_from_event(evt, &self.method(field_data[:applier]))
        end
      end
    end
  end

  def send_created_event()
    evt = self.class.new_event(
      self, 
      self._config[:on_create][:event], 
      self.method(self._config[:on_create][:event_data]).call(), 
      timestamp=self.created_at
    )
    self.create_snapshot_from_event(
      evt, 
      is_created: true, 
      &self.method(self._config[:on_create][:applier])
    )
    return evt
  end

  def send_destroyed_event()
    evt = self.class.new_event(
      self, 
      self._config[:on_destroy][:event], 
      self.method(self._config[:on_destroy][:event_data]).call(), 
      timestamp=Time.now
    )
    self.create_snapshot_from_event(
      evt, 
      &self.method(self._config[:on_destroy][:applier])
    )
  end

  private

  def default_created_applier(state, event)
    self._config[:observed_fields].each do |field_data|
      state[field_data[:field]] = self.send(field_data[:field])
    end
  end

  def default_created_event_data()
    self.as_json.transform_keys(&:to_sym)
  end

  def default_destroyed_applier(state, event)
    state["deleted_at"] = event.timestamp
  end

  def default_destroyed_event_data()
    return {}
  end
end