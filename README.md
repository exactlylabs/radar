# Radar Toolkit

Open-sourced toolkit that allows you to analyze existing broadband data and collect unbiased information on Internet accessibility and affordability in your community.

## Project Structure

Each directory consists of a tool of our toolkit

1. Pods Agent:

    A Golang service that connects to Radar Pods and runs speed tests in the background, sending the measurements back to the server.

2. Pods Server:

    Ruby on Rails webservice for Radar Pods.

3. Broadband Mapping

    React application for the Frontend with a Golang Backend, that enables you to see how broadband speeds vary across the regions over time

4. Speedtest

    Speed Test while-label widget made with React, to embed a speed test in your website. It also includes a website that implements this widget.

5. Speedtest Mobile

    Flutter application, to test wi-fi and cellular connections.

6. Toolkit Website

    This toolkit's website, made with React.

7. Scripts

    This directory contains Miscellaneous scripts used by our CI, scripts to help generate and flash our self-managed pods image and scripts to setup and start our toolkit

8. Fips Geocoder

    Golang API that returns the county FIPS code that is located in the given latitude and longitude set.
    It's used by the Pods Server to locate study counties

9. M-lab Processor

    An ETL Tool written in GO. It process Measurement Labs Speed tests and store the processed data into a Bucket,
    for later usage by our Broadband Mapping Tool.



## Run

To run all projects, just call `make run` inside the root directory or, in case you want to run them separatedly, call make run inside each project's directory
