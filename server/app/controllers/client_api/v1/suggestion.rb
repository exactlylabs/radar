module ClientApi
  module V1
    class Suggestion
      attr_reader :city, :street, :state, :postal_code, :house_number, :address, :coordinates

      def initialize(city, street, state, postal_code, house_number, coordinates)
        @city, @street, @state, @postal_code, @house_number, @coordinates = city, street, state, postal_code, house_number, coordinates
        @address = "#{house_number} #{street}, #{city}, #{state} #{postal_code}"
      end

      def ==(other)
        self.address == other.address
      end

      def eql?(other)
        self == other
      end

      def hash
        @address.hash
      end
    end
  end
  end