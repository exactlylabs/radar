# syntax = docker/dockerfile:1

# Make sure RUBY_VERSION matches the Ruby version in .ruby-version and Gemfile
ARG RUBY_VERSION=3.0.6
FROM  registry.docker.com/library/ruby:$RUBY_VERSION-slim as base

ARG BUILDPLATFORM
ARG TARGETPLATFORM
RUN echo "I am running on ${BUILDPLATFORM}, building for ${TARGETPLATFORM}"

# Rails app lives here
WORKDIR /rails

# Set production environment
ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development"

# Install packages needed for deployment
RUN apt-get update -qq && \
apt-get install --no-install-recommends -y curl libpq-dev libvips wkhtmltopdf && \
rm -rf /var/lib/apt/lists /var/cache/apt/archives

RUN apt upgrade -y


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build gems
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git libpq-dev libvips pkg-config


RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

ENV NODE_VERSION=16.15.0

ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install $NODE_VERSION
RUN . "$NVM_DIR/nvm.sh" && nvm use v$NODE_VERSION
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v$NODE_VERSION
ENV PATH="/root/.nvm/versions/node/v$NODE_VERSION/bin/:${PATH}"
RUN node --version
RUN npm --version

RUN npm install --global yarn

# Install application gems
COPY Gemfile Gemfile.lock ./


RUN bundle install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \
    bundle exec bootsnap precompile --gemfile

# Copy application code
COPY . .

# Precompile bootsnap code for faster boot times
RUN bundle exec bootsnap precompile app/ lib/

# Precompiling assets for production without requiring secret RAILS_MASTER_KEY
RUN SECRET_KEY_BASE=1 ./bin/rails assets:precompile


# Final stage for app image
FROM base

RUN apt-get update && apt-get install unzip -y

# Copy built artifacts: gems, application
COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build /rails /rails

RUN --mount=type=secret,id=MAXMIND_KEY \
  MAXMIND_KEY=$(cat /run/secrets/MAXMIND_KEY) /rails/scripts/setup.sh

# Run and own only the runtime files as a non-root user for security
RUN useradd rails --create-home --shell /bin/bash && \
    chown -R rails:rails db log storage tmp

# wicked_pdf was throwing permission denied error when generating a PDF. This may be the cause.
RUN chmod -R 777 /rails/tmp
RUN chown -R rails:rails /usr/local/bundle/ruby/*/gems/

USER rails:rails

# Entrypoint prepares the database.
ENTRYPOINT ["/rails/bin/docker-entrypoint"]

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD ["./bin/rails", "server"]
