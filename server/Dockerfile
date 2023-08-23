# Start with a base image
FROM ruby:3.0.6-slim as base

WORKDIR /app

# For clock_monitor
FROM base as clock_monitor
RUN echo "Building clock_monitor..."

RUN apt update && apt install -y ruby-dev build-essential
RUN gem install discordrb sentry-ruby rufus-scheduler
RUN gem install redis -v '~> 4.0'

COPY ./lib/events_notifier /app/lib/events_notifier
COPY ./clock_monitor.rb /app/clock_monitor.rb

CMD ["ruby", "clock_monitor.rb"]

# For clock 
FROM base as clock
RUN echo "Building clock..."

RUN apt update && apt install -y ruby-dev build-essential
RUN gem install rufus-scheduler

COPY ./clock.rb /app/clock.rb

CMD ["ruby", "clock.rb"]

# For server
FROM base as server
RUN echo "Building server..."

RUN bash -c "apt-get update \
  && apt-get install -y --no-install-recommends build-essential curl libpq-dev \
  && curl -sSL https://deb.nodesource.com/setup_18.x | bash - \
  && curl -sSL https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
  && echo 'deb https://dl.yarnpkg.com/debian/ stable main' | tee /etc/apt/sources.list.d/yarn.list \
  && apt-get update && apt-get install -y --no-install-recommends nodejs yarn \
  && rm -rf /var/lib/apt/lists/* /usr/share/doc /usr/share/man \
  && apt-get clean"

COPY Gemfile* ./
RUN bundle install

COPY package.json *yarn* ./
RUN yarn install

COPY . .

EXPOSE 3000

RUN chmod +x ./entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]

CMD ["rails", "server", "-b", "0.0.0.0"]

# For sidekiq
FROM base as sidekiq
RUN echo "Building sidekiq..."

RUN bash -c "apt-get update \
  && apt-get install -y --no-install-recommends build-essential curl libpq-dev \
  && curl -sSL https://deb.nodesource.com/setup_18.x | bash - \
  && curl -sSL https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
  && echo 'deb https://dl.yarnpkg.com/debian/ stable main' | tee /etc/apt/sources.list.d/yarn.list \
  && apt-get update && apt-get install -y --no-install-recommends nodejs yarn \
  && rm -rf /var/lib/apt/lists/* /usr/share/doc /usr/share/man \
  && apt-get clean"

COPY Gemfile* ./
RUN bundle install

COPY package.json *yarn* ./
RUN yarn install

COPY . .

# EXPOSE 3000

RUN chmod +x ./entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]

CMD ["bundle", "exec", "sidekiq"]


# Should be build like this:
# DOCKER_BUILDKIT=1 docker build --no-cache -f Dockerfile --target [clock_monitor | clock | server | sidekiq] .

