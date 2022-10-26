# Mapping Ingestor

## Setup

The only requirements is to have docker installed and then run `./scripts/start_db.sh` script.

## Run Ingestor

You can run the ingestor by calling: 

```sh
./scripts/dev.sh -start=2022-10-01 -end=2022-10-02
```

The script is going to start a docker container with clickhouse database, run migrations and then call

`go run cmd/ingest/main.go -start=2022-10-01 -end=2022-10-02`

## Available CMD CLIs

We currently have available the following CLIs

### Fillgeospaces

This executable requires you to download some shape files prior to running it, these shape files are going to be transformed into GeoJSON files and then the program will load them and import all into the database's `geospaces` table. By doing this, things such as name, parent_id and centroid are going to be filled.

To setup the files, call `./scripts/download_shapes.sh`

Then, call `go run cmd/fillgeospaces/main.go` and it will import everything for you


### Ingest

This executable runs the ingestion of a specific date range and finishes the process.
Call it by executing `go run cmd/ingest/main.go -start=2022-10-01 -end=2022-10-02`. Modify the date range as you see fit or use `-h` option to see the other options


### Ingestor Service

This is the executable that should run in production. It runs the ingestion continuously, triggering every hour and starting an ingestion of new data since the latest timestamp stored in the DB.

Call it by executing `go run cmd/ingestor_service/main.go`.


## Code Architecture

This project was designed by following the [Hexagonal Architecture](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)) pattern, so you will see terms like `Ports` and `Adapters` as packages in the project.

In short, we have our `Core`, which is the business logic of the project, that whenever it needs to work with something outside the scope of the business logic, communicate through `Ports`, which is the package where our core service stores the interfaces it will work with. When calling our core, we must provide it with `Adapters`, that are the actual implementations of those interfaces, fitting the behavior required by the ports into some specific technology/protocol.

As an example, we have the `ports.MeasurementsStorage` port, which requires an adapter that speaks to some sort of Database to store `Measurements`, `Geospaces` and `ASNs`. The actual implementation of this port that we have is stored in `adapters.clickhousestorage.clickhouseStorage` structure. As you can see, it implements the `MeasurementsStorage` using Clickhouse Database as the storage system.

## Troubleshooting

Bellow are the common problems you might run into and how to possibly solve them.


#### **MEMORY_LIMIT_EXCEEDED**

If you run through an error like the following:

```
Code: 241. DB::Exception: Received from localhost:9000. DB::Exception: Memory limit (for query) exceeded: would use 9.32 GiB (attempt to allocate chunk of 4962739 bytes), maximum: 9.31 GiB: While executing JoiningTransform. (MEMORY_LIMIT_EXCEEDED)
```

Make sure you have configured the following settings:

> Note that these commands are session-wise

```sql
set max_memory_usage=16000000000;
set max_bytes_before_external_group_by = 5000000000;
set join_algorithm = 'partial_merge';
```

