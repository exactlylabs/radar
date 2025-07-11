# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Add additional assets to the asset load path.
# Rails.application.config.assets.paths << Emoji.images_path
# Add Yarn node_modules folder to the asset load path.
Rails.application.config.assets.paths << Rails.root.join('node_modules')
Rails.application.config.assets.paths << Rails.root.join('app/assets/fonts')

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in the app/assets
# folder are already added.
# Rails.application.config.assets.precompile += %w( admin.js admin.css )

# Adding precompile action for pdf_label as this is required for gem to work correctly
Rails.application.config.assets.precompile += %w( pdf_label.scss )

# Adding SVG precompilation to the asset pipeline
Rails.application.config.assets.precompile += %w( '.svg' )

# Adding SASS as the default CSS compressor to allow for inline SVGs to work
Rails.application.config.assets.css_compressor = :sass