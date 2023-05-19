module SecretsHelper

  def self.create_human_readable_secret(secret_length)
    create_secret(secret_length, [0, 1, "o", "l", "I", "O"])
  end

  def self.create_secret(secret_length, characters_to_avoid = [])
    all_characters = [('a'..'z'), ('A'..'Z'), (0..9)].map(&:to_a).flatten - characters_to_avoid
    (0...secret_length).map { all_characters[rand(all_characters.length)] }.join
  end
end