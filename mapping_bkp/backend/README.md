# Mapping API

## Setup

You need to have [Docker and Docker Compose](https://docs.docker.com/engine/install/), [GDAL's `ogr2ogr`](https://gdal.org/index.html), and [Tippecanoe](https://github.com/mapbox/tippecanoe) installed and then run `./scripts/start_db.sh` script.

After the DB is started and migrations were done, you just have to call: `go run cmd/setup_shapes/main`. This command will download all necessary shape files as well as import the geospaces information into the DB. It is important to run this, because the ingestor will skip all measurements that doesn't have an known geospace.

## Run Ingestor

You can run the ingestor by calling: 

```sh
./scripts/dev.sh -start=2022-10-01 -end=2022-10-02
```

The script is going to start a docker container with clickhouse database, run migrations and then call

`go run cmd/ingest/main.go -start=2022-10-01 -end=2022-10-02`

## Run the API

To run the API, you just have to call `./scripts/run_api.sh`. This API is going to use the data ingested from the ingestor, so make sure you have setup the shapes and also ingested some data before running this.


## Available CMD CLIs

We currently have available the following CLIs

### Setup Shapes

Downloads all required shape files and transform them into GeoJSON and MBTiles files. It also imports those shapes as geospaces into the DB and adds to the GeoJSON/MBTiles the DB information for that shape.

`go run cmd/setup_shapes/main.go`

### Ingest

This executable runs the ingestion of a specific date range and finishes the process.
Call it by executing `go run cmd/ingest/main.go -start=2022-10-01 -end=2022-10-02`. Modify the date range as you see fit or use `-h` option to see the other options


### Ingestor Service

This is the ingestor executable that should run in production. It runs the ingestion continuously, triggering every hour and starting an ingestion of new data since the latest timestamp stored in the DB.

Call it by executing `go run cmd/ingestor_service/main.go`.

### REST API Service

This is the REST API server. It exposes summarized data about the measurements, grouped by geospaces and optionally by ISPs.
It allows the users to list/search through geospaces and ASNs and to filter the summaries by time aggregates such as yearly, monthly, quarterly and others.

Call it by executing `go run cmd/server/main.go`.


## Code Architecture

This project was designed by following the [Hexagonal Architecture](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)) pattern, so you will see terms like `Ports` and `Adapters` as packages in the project.

In short, we have our `Core` app, which is the business logic of the project, that whenever it needs to work with something outside the scope of the business logic, communicate through `Ports`, which is the package where our core service stores the interfaces it will work with. When calling our core, we must provide it with `Adapters`, which are the actual implementations of those interfaces, fitting the behavior required by the ports into some specific technology/protocol.

As an example, we have the `ports/storages.MeasurementStorage` port, which requires an adapter that speaks to some sort of Database to store `Measurements`. The actual implementation of this port is stored in `adapters/clickhousestorages.measurementStorage` structure. As you can see, it implements the `MeasurementStorage` interface using Clickhouse Database as the storage system.

## Troubleshooting

Bellow are the common problems you might run into and how to possibly solve them.


#### **MEMORY_LIMIT_EXCEEDED**

If you run through an error like the following:

```
Code: 241. DB::Exception: Received from localhost:9000. DB::Exception: Memory limit (for query) exceeded: would use 9.32 GiB (attempt to allocate chunk of 4962739 bytes), maximum: 9.31 GiB: While executing JoiningTransform. (MEMORY_LIMIT_EXCEEDED)
```

Make sure you have configured the following settings:

> Note that if you use our start_db.sh script, you can change this value by editing `./scripts/files/clickhouse-users.xml`


To enable this by default, you need to go to clickhouse's user configuration XML file located at `/etc/clickhouse-server/users.xml` and add the following inside the <default> element of <profiles>

```xml
<allow_experimental_live_view>1</allow_experimental_live_view>
<max_bytes_before_external_group_by>10000000000</max_bytes_before_external_group_by>
```
