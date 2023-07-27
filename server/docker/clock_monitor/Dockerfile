FROM ruby:3.0.6-slim

WORKDIR /app

RUN apt update && apt install -y ruby-dev build-essential
RUN gem install discordrb sentry-ruby rufus-scheduler
RUN gem install redis -v '~> 4.0'

COPY ./lib/events_notifier /app/lib/events_notifier
COPY ./clock_monitor.rb /app/clock_monitor.rb

CMD ["ruby", "clock_monitor.rb"]
