module EventSourceable
  extend ActiveSupport::Concern
  
  module Hooks
    def notify_change(field, event_name, options={})
      if self.observed_fields.nil?
        self.observed_fields = []
      end
      if options[:applier].nil?
        # set the default applier for this field
        define_method("#{field}_applier") do |state, event|
          state[field.to_s] = event.data["to"]
        end
        options[:applier] = "#{field}_applier".to_sym

      end
      # Register the field to have its changes monitored
      self.observed_fields << {
        field: field, 
        event: event_name,
        applier: options[:applier]
      }
    end

    def many_added_callback(field, event_name, options={})
      # the only way of being able to notify many relations
      # is to generate a callback method and return a symbol referencing this new method
      #
      # usage: has_many :field_name, after_add => many_added_callback :field_name, "EventName"

      # Create a default applier if not given
      if options[:applier].nil?
        # set the default applier for this field
        define_method("#{field}_added_applier") do |state, event|
          if state[field.to_s].nil?
            state[field.to_s] = []
          end
          state[field.to_s] << event.data["id"]
        end
        options[:applier] = "#{field}_added_applier".to_sym
      end

      # Define the method in the class
      define_method("#{field}_added") do |obj|
        last_snap = Snapshot.last_from self
        if last_snap.nil?
          # We can only work with objects that have an initial state
          # If this has happened, it means that an initial "Create" event is missing
          return
        end
        # Send the Event and then update the snapshot
        event_data = {
          "id": obj.id
        }

        evt = self.class.new_event(self, event_name, event_data, timestamp=Time.now)
        if options[:applier].present?
          state = last_snap.state
          self.method(options[:applier]).call(state, evt)
          last_snap = Snapshot.create(aggregate: self, event: evt, state: state)
        end
      end
      return "#{field}_added".to_sym
    end

    def many_removed_callback(field, event_name, options={})
      # the only way of being able to notify many relations
      # is to generate a callback method and return a symbol referencing this new method
      #
      # usage: has_many :field_name, after_remove => many_removed_callback :field_name, "EventName"
      
      # Create a default applier if not given
      if options[:applier].nil?
        # set the default applier for this field
        define_method("#{field}_removed_applier") do |state, event|
          if state[field.to_s].nil?
            state[field.to_s] = []
          end
          state[field.to_s].delete(event.data["id"])
        end
        options[:applier] = "#{field}_removed_applier".to_sym
      end

      # Define the method in the class
      define_method("#{field}_removed") do |obj|
        last_snap = Snapshot.last_from self
        if last_snap.nil?
          # We can only work with objects that have an initial state
          # If this has happened, it means that an initial "Create" event is missing
          return
        end
        # Send the Event and then update the snapshot
        event_data = {
          "id": obj.id
        }

        evt = self.class.new_event(self, event_name, event_data, timestamp=Time.now)
        if options[:applier].present?
          state= last_snap.state
          self.method(options[:applier]).call(state, evt)
          last_snap = Snapshot.create(aggregate: self, event: evt, state: state)
        end
      end
      return "#{field}_removed".to_sym
    end
  end

  module ClassMethods
    def new_event(obj, name, data, timestamp=nil)
      timestamp = timestamp or Time.now
      evt = Event.create(aggregate: obj, name: name, data: data, timestamp: timestamp, version: Event.last_version_from(obj) + 1)
    end
  end

  included do |klass|
    klass.send("cattr_accessor", :observed_fields)
    has_many :snapshots, as: :aggregate
    has_many :events, as: :aggregate
    after_save :send_change_events
    after_destroy :send_destroyed_event
    klass.extend(Hooks)
    klass.extend(ClassMethods)
  end

  def send_created_event()
    evt = self.class.new_event(
      self, "CREATED", self.as_json.transform_keys(&:to_sym), timestamp=self.created_at
    )
    
    snap_state = {}
    self.observed_fields.each do |field_data|
      snap_state[field_data[:field]] = self.send(field_data[:field])
    end
    Snapshot.create aggregate: self, event: evt, state: snap_state
    return evt
  end

  def send_destroyed_event()
    evt = self.class.new_event(
      self, "DELETED", {}, timestamp=Time.now
    )
    last_snap = Snapshot.last_from self
    if last_snap.present?
      state = last_snap.state
      state["deleted_at"] = evt.timestamp
      Snapshot.create aggregate: self, event: evt, state: state
    end
  end

  def send_change_events()
    if id_previously_changed?
      return self.send_created_event
    end
    t = Time.now
    last_snap = Snapshot.last_from self
    if last_snap.nil?
      # We can only work with objects that have an initial state
      # If this has happened, it means that an initial "Create" event is missing
      return
    end
    self.observed_fields.each do |field_data|
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
          state = last_snap.state
          self.method(field_data[:applier]).call(state, evt)
          last_snap = Snapshot.create(aggregate: self, event: evt, state: state)
        end
      end
    end
  end
end