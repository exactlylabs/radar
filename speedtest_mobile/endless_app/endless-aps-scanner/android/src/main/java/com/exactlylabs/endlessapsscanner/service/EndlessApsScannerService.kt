package com.exactlylabs.endlessapsscanner.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

import com.facebook.react.HeadlessJsTaskService


//const val ACTION_ALARM = "com.exactlylabs.endless_service.ACTION_ALARM"
//const val setAlarmIntentAction = "setAlarmIntentAction"

class EndlessApsScannerService : EndlessService() {
//    override var ACTION_ALARM = "com.exactlylabs.endless_service.ACTION_ALARM"
//    override var setAlarmIntentAction = "setAlarmIntentAction"

    override var receiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            // Send data to Headless JS task
            val data = "Periodic task data"
            setHeadlessTask("data", data)

            // Schedule next alarm
            handler?.postDelayed({
                Intent(setAlarmIntentAction).also { intent ->
                    intent.action = ACTION_ALARM
                    intent.`package` = packageName
                    sendBroadcast(intent)
                }
            }, frequency)
        }

    }

    override fun setHeadlessTask(name: String, value: String) {
        val headlessIntent = Intent(applicationContext, EndlessApsScannerHeadlessJSTaskService::class.java)
        headlessIntent.putExtra(name, value)
        applicationContext.startService(headlessIntent)
        HeadlessJsTaskService.acquireWakeLockNow(applicationContext)
    }

    override fun createNotification(): Notification {
        val channelId = "EAS::notifications"
        val channelName = "EndlessApsScanner"
        val channelPriority = NotificationManager.IMPORTANCE_HIGH
        val channelDescription = "Notification channel for EndlessApsScanner service"
        val notificationTitle = "Endless Aps Scanner"
        val notificationText = "THIS IS RUNNING!"
        val notificationVisibility = Notification.VISIBILITY_PUBLIC

        val notificationChannel = NotificationChannel(channelId, channelName, channelPriority)
        notificationChannel.description = channelDescription
        notificationChannel.setSound(null, null)
        notificationChannel.setShowBadge(true)
        notificationManager.createNotificationChannel(notificationChannel)

        val notificationBuilder = Notification.Builder(applicationContext, channelId)
        notificationBuilder.setOngoing(true)
        notificationBuilder.setShowWhen(false)
        notificationBuilder.setContentText(notificationTitle)
        notificationBuilder.setContentText(notificationText)
        notificationBuilder.setVisibility(notificationVisibility)
        notificationBuilder.setContentIntent(getPendingIntent())
        notificationBuilder.setSmallIcon(android.R.drawable.ic_dialog_info)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            notificationBuilder.setForegroundServiceBehavior(Notification.FOREGROUND_SERVICE_IMMEDIATE)
        }

        return notificationBuilder.build()
    }

}