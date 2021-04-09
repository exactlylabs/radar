package main

import (
	"database/sql"
	"encoding/json"
	"io/ioutil"
	"math"
	"net/http"
	"time"

	"github.com/ClickHouse/clickhouse-go"
	"github.com/gorilla/mux"
	"github.com/rs/cors"

	"fmt"
	"log"
)

type MapRequest struct {
	BoundingBox string `json:"boundingBox"`
}

type MetricsRequest struct {
	Direction string  `json:"direction"`
	StartDate string  `json:"startDate"`
	EndDate   string  `json:"endDate"`
	Median    float64 `json:"median"`
}

type Metric struct {
	ID      string  `json:"id"`
	Rate    float64 `json:"rate"`
	Samples int     `json:"samples"`
}

var conn *sql.DB

func MapHandler(w http.ResponseWriter, r *http.Request) {
	var mapRequestParams MapRequest

	w.Header().Set("Content-Type", "application/json")
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&mapRequestParams); err != nil {
		fmt.Println((err))
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid request payload"))
		return
	}
	defer r.Body.Close()

	// response, _ := json.Marshal(payload)

	dat, err := ioutil.ReadFile("./output.json")
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Unable to open file"))
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(dat)
}

func MetricsHandler(w http.ResponseWriter, r *http.Request) {
	var metricsRequestParams MetricsRequest

	metrics := map[string]Metric{}

	w.Header().Set("Content-Type", "application/json")
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&metricsRequestParams); err != nil {
		fmt.Println((err))
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid request payload"))
		return
	}
	defer r.Body.Close()

	queryUpload := 0
	if metricsRequestParams.Direction == "up" {
		queryUpload = 1
	}

	dateLayout := "2006-01-02"
	endedAt, tErr := time.Parse(dateLayout, metricsRequestParams.EndDate)
	if tErr != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid start time"))
		return
	}

	endedAtString := endedAt.Add(time.Hour * 24).Format(dateLayout)

	rows, err := conn.Query(`
	SELECT geoid, quantileExact(0.5)(r) AS rate, count(*) AS samples
	FROM (
		SELECT geoid, ip, upload, toDate(started_at) as sa, quantileExact(0.5)(rate) as r
		FROM tests
		GROUP BY geoid, ip, upload, toDate(started_at)
	)
	WHERE upload = ?
	AND sa >= ?
	AND sa <= ?
	GROUP BY geoid
	ORDER BY geoid;`, queryUpload, metricsRequestParams.StartDate, endedAtString)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	for rows.Next() {
		var (
			geoid   string
			rate    float64
			samples int
		)
		if err := rows.Scan(&geoid, &rate, &samples); err != nil {
			log.Fatal(err)
		}

		if math.IsNaN(rate) {
			fmt.Println(geoid, rate, samples)
		}

		metrics[geoid] = Metric{
			ID:      geoid,
			Rate:    rate,
			Samples: samples,
		}
	}

	response, err := json.Marshal(metrics)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(fmt.Sprintf("Unable to serialize data: %s", err)))
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(response)
}

func main() {
	var err error
	conn, err = sql.Open("clickhouse", "tcp://127.0.0.1:9000?debug=true")
	if err != nil {
		log.Fatal(err)
	}
	if err := conn.Ping(); err != nil {
		if exception, ok := err.(*clickhouse.Exception); ok {
			fmt.Printf("[%d] %s \n%s\n", exception.Code, exception.Message, exception.StackTrace)
		} else {
			fmt.Println(err)
		}
		return
	}

	r := mux.NewRouter()
	r.HandleFunc("/map", MapHandler).Methods("POST")
	r.HandleFunc("/metrics", MetricsHandler).Methods("POST")
	http.Handle("/", r)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:8080", "http://experiment-01:8080", "http://experiment-01.exactlylabs.com:8080"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	http.ListenAndServe(":8081", handler)
}
