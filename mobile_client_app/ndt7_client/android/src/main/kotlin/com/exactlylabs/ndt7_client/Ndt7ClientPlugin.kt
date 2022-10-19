package com.exactlylabs.ndt7client


import android.content.ContentValues.TAG
import android.util.Log
import androidx.annotation.NonNull
import com.exactlylabs.ndt7client.utils.MainThreadEventSink
import com.google.gson.*
import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.plugin.common.EventChannel
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import net.measurementlab.ndt7.android.NDTTest
import net.measurementlab.ndt7.android.models.ClientResponse
import net.measurementlab.ndt7.android.models.Measurement
import net.measurementlab.ndt7.android.utils.DataConverter
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import java.util.concurrent.TimeUnit


/** Ndt7ClientPlugin */
class Ndt7ClientPlugin : FlutterPlugin, MethodChannel.MethodCallHandler,
    EventChannel.StreamHandler {

    private lateinit var channel: MethodChannel
    private lateinit var ndt7Client: NDTTestImpl
    private lateinit var messageChannel: EventChannel
    private lateinit var gson: Gson
    private var eventSink: EventChannel.EventSink? = null


    override fun onAttachedToEngine(@NonNull flutterPluginBinding: FlutterPlugin.FlutterPluginBinding) {
        channel = MethodChannel(flutterPluginBinding.binaryMessenger, "method_ndt7_client")
        channel.setMethodCallHandler(this)

        messageChannel = EventChannel(flutterPluginBinding.binaryMessenger, "event_ndt7_client")
        messageChannel.setStreamHandler(this)

        ndt7Client = NDTTestImpl(createHttpClient())
        gson = GsonBuilder().setPrettyPrinting().create()
    }

    override fun onDetachedFromEngine(@NonNull binding: FlutterPlugin.FlutterPluginBinding) {
        channel.setMethodCallHandler(null)
        ndt7Client.stopTest()
    }

    override fun onMethodCall(@NonNull call: MethodCall, @NonNull result: MethodChannel.Result) {
        when (call.method) {
            "startDownloadTest" -> {
                startDownloadTest()
                result.success(true)
            }
            "startUploadTest" -> {
                startUploadTest()
                result.success(true)
            }
            "stopTest" -> {
                stopTest()
                result.success(true)
            }
            else -> {
                result.notImplemented()
            }
        }
    }

    override fun onListen(arguments: Any?, eventSink: EventChannel.EventSink?) {
        this.eventSink = MainThreadEventSink(eventSink)
    }

    override fun onCancel(arguments: Any?) {
        eventSink = null
    }

    private fun createHttpClient(
        connectTimeout: Long = 10,
        readTimeout: Long = 10,
        writeTimeout: Long = 10
    ): OkHttpClient {
        val interceptor = HttpLoggingInterceptor()
        interceptor.level = HttpLoggingInterceptor.Level.NONE
        return OkHttpClient.Builder()
            .connectTimeout(connectTimeout, TimeUnit.SECONDS)
            .readTimeout(readTimeout, TimeUnit.SECONDS)
            .writeTimeout(writeTimeout, TimeUnit.SECONDS)
            .addInterceptor(interceptor)
            .build()
    }

    private fun startDownloadTest() {
        ndt7Client.startTest(NDTTest.TestType.DOWNLOAD)
    }

    private fun startUploadTest() {
        ndt7Client.startTest(NDTTest.TestType.UPLOAD)
    }

    private fun stopTest() {
        ndt7Client.stopTest()
    }

    private inner class NDTTestImpl constructor(okHttpClient: OkHttpClient) :
        NDTTest(okHttpClient) {

        override fun onMeasurementDownloadProgress(measurement: Measurement) {
            super.onMeasurementDownloadProgress(measurement)
            var jsonMeasurement: String = gson.toJson(measurement)
            jsonMeasurement = addTestToJsonMeasurement(jsonMeasurement, "download")
            eventSink?.success(jsonMeasurement)
            Log.d(TAG, "measurement download progress: $measurement")
        }

        override fun onMeasurementUploadProgress(measurement: Measurement) {
            super.onMeasurementUploadProgress(measurement)
            var jsonMeasurement: String = gson.toJson(measurement)
            jsonMeasurement = addTestToJsonMeasurement(jsonMeasurement, "upload")
            eventSink?.success(jsonMeasurement)
            Log.d(TAG, "measurement upload progress: $measurement")
        }

        override fun onDownloadProgress(clientResponse: ClientResponse) {
            super.onDownloadProgress(clientResponse)
            Log.d(TAG, "download progress: $clientResponse")
            val speed = DataConverter.convertToMbps(clientResponse)
            var jsonClientResponse: String = gson.toJson(clientResponse)
            Log.d(TAG, "download speed: $speed")
            //TODO: Remove this when Issue opened in mlab-ndt7-client-Android is fixed (https://github.com/m-lab/ndt7-client-android/issues/17)
            jsonClientResponse = jsonClientResponse.replace(".0", "")
            eventSink?.success(jsonClientResponse)
        }

        override fun onUploadProgress(clientResponse: ClientResponse) {
            super.onUploadProgress(clientResponse)
            Log.d(TAG, "upload stuff: $clientResponse")
            var jsonClientResponse: String = gson.toJson(clientResponse)
            val speed = DataConverter.convertToMbps(clientResponse)
            Log.d(TAG, "upload speed: $speed")
            //TODO: Remove this when Issue opened in mlab-ndt7-client-Android is fixed
            jsonClientResponse = jsonClientResponse.replace(".0", "")
            eventSink?.success(jsonClientResponse)
        }

        override fun onFinished(
            clientResponse: ClientResponse?,
            error: Throwable?,
            testType: TestType
        ) {
            super.onFinished(clientResponse, error, testType)
            if (error != null) {
                eventSink?.error(
                    error.stackTraceToString(),
                    error.message ?: "",
                    error.cause ?: ""
                )
                return
            }
            val speed = clientResponse?.let { DataConverter.convertToMbps(it) }
            var jsonClientResponse: String = gson.toJson(clientResponse)
            //TODO: Remove this when Issue opened in mlab-ndt7-client-Android is fixed
            jsonClientResponse = jsonClientResponse.replace(".0", "")
            eventSink?.success(jsonClientResponse)
            Log.d(TAG, "ALL DONE: $speed")
        }

        private fun addTestToJsonMeasurement(jsonMeasurement: String, test: String): String {
            return jsonMeasurement.replace("}\n}", "},\n  \"Test\": \"$test\"\n}")
        }
    }
}
