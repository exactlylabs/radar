module ClientApi
  module V1
    class Suggestion
      attr_reader :city, :street, :state, :postal_code, :house_number, :address, :coordinates

      def initialize(city, street, state, postal_code, house_number, coordinates)
        @city, @street, @state, @postal_code, @house_number, @coordinates = city, street, state, postal_code, house_number, coordinates
        # We now want these fields to be optional, so the address string has to be created progressively
        @address = ""
        if house_number.present? && street.present?
          @address += "#{house_number} #{street},"
        elsif street.present?
          @address += "#{street},"
        end

        if city.present?
          @address += " #{city},"
        end

        if state.present?
          @address += " #{state}"
        end

        if postal_code.present?
          @address += " #{postal_code}"
        end
      end

      def ==(other)
        self.address == other.address
      end

      def eql?(other)
        self == other
      end

      def hash
        self.address.hash
      end
    end
  end
  end