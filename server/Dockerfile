#clock_monitor.rb
# FROM ruby:3.0.6-slim

# WORKDIR /app

# RUN apt update && apt install -y ruby-dev build-essential
# RUN gem install discordrb sentry-ruby rufus-scheduler
# RUN gem install redis -v '~> 4.0'

# COPY ./lib/events_notifier /app/lib/events_notifier
# COPY ./clock_monitor.rb /app/clock_monitor.rb

# CMD ["ruby", "clock_monitor.rb"]

#clock.rb
# FROM ruby:3.0.6-slim

# WORKDIR /app

# RUN apt update && apt install -y ruby-dev build-essential
# RUN gem install rufus-scheduler

# COPY ./clock.rb /app/clock.rb

# CMD ["ruby", "clock.rb"]

#server
FROM ruby:3.0.6-slim
LABEL maintainer="Ignacio Grasso <ignacio@exactlylabs.com>"

WORKDIR /app

RUN apt update && apt install -y ruby-dev build-essential nodejs yarn libpq-dev

# COPY Gemfile Gemfile.lock .ruby-gemset .ruby-version ./
# RUN bundle lock --add-platform x86_64-linux
COPY . .
RUN bundle install


EXPOSE 3000

RUN chmod +x ./entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]
# Configure the main process to run when running the image
CMD ["rails", "server"]


