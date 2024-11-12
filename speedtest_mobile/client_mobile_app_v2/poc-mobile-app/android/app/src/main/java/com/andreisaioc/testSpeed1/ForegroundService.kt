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
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.util.Log

import android.app.Service
import com.facebook.react.ReactApplication

class MyForegroundService : Service() {

    private val channelId = "MyForegroundServiceChannel"
    private val notificationId = 1 

    private val speedTestInterval = 3 * 1000L  // Speed test every 5 seconds
    private val cellTowerInterval = 5 * 1000L // Cell tower status every 10 seconds
    private val wifiScanInterval = 7 * 1000L  // Wi-Fi scan every 15 seconds

    private lateinit var handler: Handler
    private lateinit var handlerThread: HandlerThread
    private lateinit var periodicTask: Runnable

    private lateinit var speedTestTask: Runnable
    private lateinit var cellTowerTask: Runnable
    private lateinit var wifiScanTask: Runnable


    private lateinit var networkInfoHelper: NetworkInfoHelper



    private fun callJavaScriptFunction() {
        // Access the React Native host and instance manager
        val reactNativeHost = (application as? MainApplication)?.reactNativeHost
        val reactInstanceManager = reactNativeHost?.reactInstanceManager

        // Ensure the React context is initialized
        if (reactInstanceManager?.hasStartedCreatingInitialContext() == true) {
            val reactContext = reactInstanceManager.currentReactContext

            // Emit event if React context is available
            reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("triggerSpeedTest", null)
        } else {
            // Log or handle if the React context is not initialized
            Log.w("MyForegroundService", "React context not initialized")
        }
    }


    override fun onCreate() {
        super.onCreate()
        networkInfoHelper = NetworkInfoHelper(applicationContext)

        createNotificationChannel()
        startForeground(notificationId, createNotification())
        startPeriodicTasks()
    }


    private fun startPeriodicTasks() {
        handlerThread = HandlerThread("SpeedTestHandlerThread")
        handlerThread.start()
        handler = Handler(handlerThread.looper)
        
        periodicTask = Runnable {
            runSpeedTest()
            handler.postDelayed(periodicTask, speedTestInterval) // Schedule the next test
        }
        handler.post(periodicTask) // Start the initial test


        wifiScanTask = Runnable {
            scanWifiNetworks()
            handler.postDelayed(wifiScanTask, wifiScanInterval)  // Reschedule
        }
        handler.post(wifiScanTask)



        cellTowerTask = Runnable {
            fetchCellTowerStatus()
            handler.postDelayed(cellTowerTask, cellTowerInterval)  // Reschedule
        }
        handler.post(cellTowerTask)
    }



    private fun fetchCellTowerStatus() {
        // Simulate fetching cell tower status

        val myValue = networkInfoHelper.getCurrentCellularInfo();
        
        print("Discovered Cell towners: " + myValue.toString());
 

        val cellStatus = "Cell Towers: ${myValue}"
        updateNotification("Cell Tower Status", cellStatus)
       // sendEventToReactNative("onCellTowerStatus", cellStatus)
    }


    private fun scanWifiNetworks() {
        // Simulate Wi-Fi scan

        val myValue = networkInfoHelper.getWifiNetworkList();
        print("Discovered Wifi: " + myValue.toString());

 
        updateNotification("Wi-Fi Scan", "Found networks: ${Random.nextInt(1000, 5000)} ${myValue}")
        //sendEventToReactNative("onWifiScanResult", myValue)
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


        val reactContext = (application as ReactApplication).reactNativeHost.reactInstanceManager.currentReactContext
        reactContext?.getNativeModule(SpeedTestModule::class.java)?.triggerSpeedTestFromNative()

        


        // Generate random values for download speed, upload speed, and latency
        val downloadSpeed = Random.nextFloat() * (50 - 10) + 10 // Random download speed between 10 and 50 Mbps
        val uploadSpeed = Random.nextFloat() * (20 - 5) + 5 // Random upload speed between 5 and 20 Mbps
        val latency = Random.nextInt(10, 100) // Random latency between 10 and 100 ms
    
        println("Download Speed: $downloadSpeed Mbps")
        println("Upload Speed: $uploadSpeed Mbps")
        println("Latency: $latency ms")

        callJavaScriptFunction();
    
        // Update the notification with simulated results
        updateNotification("Speed Test1", "Download: $downloadSpeed Mbps, Upload: $uploadSpeed Mbps, Latency: $latency ms");
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_REDELIVER_INTENT
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(periodicTask)
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
