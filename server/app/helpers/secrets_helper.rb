module SecretsHelper
  def create_secret(secret_length, characters_to_avoid = [])
    all_characters = [('a'..'z'), ('A'..'Z'), (0..9)].map(&:to_a).flatten - characters_to_avoid
    (0...secret_length).map { all_characters[rand(all_characters.length)] }.join
  end
end