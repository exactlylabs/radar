class JsonWebToken
    SECRET_KEY = ENV["JWT_SECRET_KEY"] || "dev"

    def self.encode(payload, exp = nil)
        if exp.present?
            payload[:exp] = exp.to_i
        end
        JWT.encode(payload, SECRET_KEY)
    end

    def self.decode(token)
        decoded = JWT.decode(token, SECRET_KEY, true)[0]
        HashWithIndifferentAccess.new decoded
    end
end