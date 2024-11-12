package com.andreisaioc.testSpeed1

import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

class NdtServerService {

    private val baseUrl = "https://locate.measurementlab.net/v2/nearest/ndt/ndt7"

    /**
     * Gets the nearest NDT server based on the provided IP.
     * @param ip The IP address used to locate the nearest server.
     * @return The server URL in JSON format or null if request fails.
     */
    fun getNearestNdtServer(ip: String): String? {
        val queryParams = mapOf("ip" to ip)
        val queryString = queryParams.entries.joinToString("&") {
            "${it.key}=${URLEncoder.encode(it.value, "UTF-8")}"
        }
        val fullUrl = "$baseUrl?$queryString"

        try {
            val url = URL(fullUrl)
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "GET"
            connection.connect()

            return if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                val inputStream = connection.inputStream
                val reader = BufferedReader(InputStreamReader(inputStream))
                val response = reader.readText()
                reader.close()
                response
            } else {
                null
            }
        } catch (e: Exception) {
            e.printStackTrace()
            return null
        }
    }

    /**
     * Simulate a download speed test.
     * In a real scenario, you would measure the time it takes to download a file.
     * @param serverUrl The server URL to test download speed.
     * @return The download speed in Mbps or null if the test fails.
     */
    fun testDownloadSpeed(serverUrl: String): Double? {
        try {
            val startTime = System.currentTimeMillis()

            // Simulate download request
            val url = URL(serverUrl)
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "GET"
            connection.connect()

            val inputStream = connection.inputStream
            inputStream.bufferedReader().use { reader ->
                reader.readText() // Read the content
            }
            val endTime = System.currentTimeMillis()

            // Calculate download speed (Dummy example: 1MB file took x milliseconds)
            val durationInSeconds = (endTime - startTime) / 1000.0
            val fileSizeInMB = 10 // Assuming the downloaded file size is 10MB

            return fileSizeInMB / durationInSeconds // Mbps
        } catch (e: Exception) {
            e.printStackTrace()
            return null
        }
    }

    /**
     * Simulate an upload speed test.
     * @param serverUrl The server URL to test upload speed.
     * @return The upload speed in Mbps or null if the test fails.
     */
    fun testUploadSpeed(serverUrl: String): Double? {
        try {
            val startTime = System.currentTimeMillis()

            // Simulate upload request (you might want to use actual data to upload)
            val url = URL(serverUrl)
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "POST"
            connection.doOutput = true
            connection.connect()

            val outputStream = connection.outputStream
            outputStream.write("test data".toByteArray()) // Simulate upload data
            outputStream.flush()

            val endTime = System.currentTimeMillis()

            // Calculate upload speed (Dummy example: uploaded 10MB in x seconds)
            val durationInSeconds = (endTime - startTime) / 1000.0
            val fileSizeInMB = 10 // Assuming 10MB uploaded

            return fileSizeInMB / durationInSeconds // Mbps
        } catch (e: Exception) {
            e.printStackTrace()
            return null
        }
    }
}
