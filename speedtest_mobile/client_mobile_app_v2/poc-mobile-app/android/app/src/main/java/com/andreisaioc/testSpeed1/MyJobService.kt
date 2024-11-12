package com.andreisaioc.testSpeed1

import android.app.job.JobParameters
import android.app.job.JobService
import android.content.Intent


class MyJobService : JobService() {

    override fun onStartJob(params: JobParameters?): Boolean {
        startService(Intent(this, MyForegroundService::class.java))
        jobFinished(params, false)
        return true
    }

    override fun onStopJob(params: JobParameters?): Boolean {
        return true
    }
}
