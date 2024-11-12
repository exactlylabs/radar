package com.andreisaioc.testSpeed1

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.HandlerThread
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import kotlin.random.Random
import android.content.BroadcastReceiver
import android.app.job.JobInfo
import android.app.job.JobScheduler
import android.content.ComponentName



import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.ReactInstanceManager
import com.facebook.react.bridge.ReactContext

import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactApplication

class MyForegroundService_new : Service() {

    private lateinit var networkInfoHelper: NetworkInfoHelper

    private val channelId = "MyForegroundServiceChannel"
    private val notificationId = 1
    private val interval: Long = 1 * 5 * 1000 

    private val speedTestInterval: Long = 7 * 1000  // Speed test every 5 seconds
    private val cellTowerInterval: Long = 5 * 1000 // Cell tower status every 10 seconds
    private val wifiScanInterval: Long = 3 * 1000  // Wi-Fi scan every 15 seconds

    private lateinit var handler: Handler
    private lateinit var handlerThread: HandlerThread
    private lateinit var periodicTask: Runnable

    private lateinit var speedTestTask: Runnable
    private lateinit var cellTowerTask: Runnable
    private lateinit var wifiScanTask: Runnable

    override fun onCreate() {
        super.onCreate()

        networkInfoHelper = NetworkInfoHelper(applicationContext)

        createNotificationChannel()
        startForeground(notificationId, createNotification())
        startMyPeriodicTasks()   
    }


    private fun startMyPeriodicTasks()
    {
        handlerThread = HandlerThread("SpeedTestHandlerThread")
        handlerThread.start()
        handler = Handler(handlerThread.looper)


       
        startCellTowerTask()
        startWifiScanTask()
        startSpeedTestTask()
    }


    private fun startSpeedTestTask() {
        speedTestTask = Runnable {
            runSpeedTest()
            handler.postDelayed(speedTestTask, speedTestInterval)  // Reschedule
        }
        handler.post(speedTestTask)
    }


    private fun startCellTowerTask() {
        cellTowerTask = Runnable {
            fetchCellTowerStatus()
            handler.postDelayed(cellTowerTask, cellTowerInterval)  // Reschedule
        }
        handler.post(cellTowerTask)
    }


    private fun startWifiScanTask() {
        wifiScanTask = Runnable {
            scanWifiNetworks()
            handler.postDelayed(wifiScanTask, wifiScanInterval)  // Reschedule
        }
        handler.post(wifiScanTask)
    }


    private fun scanWifiNetworks() {
        // Simulate Wi-Fi scan

        val myValue = networkInfoHelper.getWifiNetworkList();
        print("Discovered Wifi: " + myValue.toString());

 
        updateNotification("Wi-Fi Scan", "Found networks: ${Random.nextInt(1000, 5000)} ${myValue}")
        sendEventToReactNative("onWifiScanResult", myValue)
    }


    private fun fetchCellTowerStatus() {
        // Simulate fetching cell tower status
        val cellStatus = "Connected to Cell Tower ID: ${Random.nextInt(1000, 5000)}"
        updateNotification("Cell Tower Status", cellStatus)
        sendEventToReactNative("onCellTowerStatus", cellStatus)
    }


 

    //----------------


    private fun startPeriodicTasks() {
        handlerThread = HandlerThread("SpeedTestHandlerThread")
        handlerThread.start()
        handler = Handler(handlerThread.looper)
        
        periodicTask = Runnable {
            runSpeedTest()
            handler.postDelayed(periodicTask, interval) // Schedule the next test
        }
        handler.post(periodicTask) // Start the initial test
    }


    private fun createNotificationChannel() {
        val serviceChannel = NotificationChannel(
            channelId,
            "Foreground Service Channel",
            NotificationManager.IMPORTANCE_LOW
        )
        val manager = getSystemService(NotificationManager::class.java)
        manager?.createNotificationChannel(serviceChannel)
    }

    private fun createNotification(): Notification {
        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent, PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("Wi-Fi & Cell Tower Data Monitoring")
            .setContentText("This service is running in the background")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .build()
    }

    private fun runSpeedTest() {
        // Simulated speed test results
        val downloadSpeed = Random.nextFloat() * (50 - 10) + 10
        val uploadSpeed = Random.nextFloat() * (20 - 5) + 5
        val latency = Random.nextInt(10, 100)

        // Update notification or send event to React Native
        updateNotification("Speed Test1", "Download: $downloadSpeed Mbps, Upload: $uploadSpeed Mbps, Latency: $latency ms")
        sendEventToReactNative("onSpeedTestResult", downloadSpeed, uploadSpeed, latency)
    }


    private fun runSpeedTest_old() {
        // Simulate the progress of a speed test using a Handler
        val handler = Handler(Looper.getMainLooper())
        var progress = 0
    
        // Simulate progress updates every 500ms
        val progressRunnable = object : Runnable {
            override fun run() {
                if (progress < 100) {
                    progress += 10
                    println("Speed test in progress: $progress%")
                    handler.postDelayed(this, 500)
                } else {
                    // Simulate speed test results once progress reaches 100%
                    simulateSpeedTestResults()
                }
            }
        }
    
        // Start the simulated progress
        handler.post(progressRunnable)
    }
    
    private fun simulateSpeedTestResults() {
        // Generate random values for download speed, upload speed, and latency
        val downloadSpeed = Random.nextFloat() * (50 - 10) + 10 // Random download speed between 10 and 50 Mbps
        val uploadSpeed = Random.nextFloat() * (20 - 5) + 5 // Random upload speed between 5 and 20 Mbps
        val latency = Random.nextInt(10, 100) // Random latency between 10 and 100 ms
    
        println("Download Speed: $downloadSpeed Mbps")
        println("Upload Speed: $uploadSpeed Mbps")
        println("Latency: $latency ms")
    
        // Update the notification with simulated results
        //updateNotification(downloadSpeed, uploadSpeed, latency)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_REDELIVER_INTENT
    }



    private fun getReactApplicationContext(): ReactApplicationContext? {
        val reactNativeHost = (applicationContext as ReactApplication).reactNativeHost
        return reactNativeHost.reactInstanceManager.currentReactContext as? ReactApplicationContext
    }

    private fun sendEventToReactNative(eventName: String, vararg data: Any) {
        val reactContext = getReactApplicationContext()
 /*
        // Check if the ReactApplicationContext is available and the activity is running
        if (reactContext != null && reactContext.hasActiveCatalystInstance()) {
            // Emit the event
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, data.toList())  // convert vararg to List
        }*/
    }

    

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(periodicTask)
        handler.removeCallbacks(speedTestTask)
        handler.removeCallbacks(cellTowerTask)
        handler.removeCallbacks(wifiScanTask)
        handlerThread.quitSafely()
        
        // Schedule JobService to restart
        val componentName = ComponentName(this, MyJobService::class.java)
        val jobInfo = JobInfo.Builder(123, componentName)
            .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
            .setPersisted(true)  // Ensure it persists across reboots
            .build()
        
        val jobScheduler = getSystemService(JOB_SCHEDULER_SERVICE) as JobScheduler
        jobScheduler.schedule(jobInfo)
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    private fun updateNotification2(title: String, contentText: String) {
        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle(title)
            .setContentText(contentText)
            .setSmallIcon(R.mipmap.ic_launcher)
            .build()
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(notificationId, notification)
    }


    private fun updateNotification(title: String, contentText: String) {
        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent, PendingIntent.FLAG_UPDATE_CURRENT
        )
    
        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle(title)
            .setContentText(contentText)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .setOngoing(true) // Makes the notification non-dismissable
            .build()
    
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(notificationId, notification)
    }


    private fun updateNotification_old(downloadSpeed: Float, uploadSpeed: Float, latency: Int) {
        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent, PendingIntent.FLAG_UPDATE_CURRENT
        )
    
        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("Wi-Fi & Cell Tower Data Monitoring")
            .setContentText("Download: $downloadSpeed Mbps, Upload: $uploadSpeed Mbps, Latency: $latency ms")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .setOngoing(true) // Makes the notification non-dismissable
            .build()
    
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(notificationId, notification)
    }



    class ServiceRestartReceiver : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            context?.startService(Intent(context, MyForegroundService::class.java))
        }
    }
}
