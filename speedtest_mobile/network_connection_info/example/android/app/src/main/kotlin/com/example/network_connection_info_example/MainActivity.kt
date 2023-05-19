package com.example.network_connection_info_example

import android.Manifest
import android.annotation.TargetApi
import android.app.Activity
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.annotation.RequiresApi
import io.flutter.embedding.android.FlutterActivity


class MainActivity : FlutterActivity() {
    private val sRequiredPermissions = arrayOf<String>(
        Manifest.permission.ACCESS_COARSE_LOCATION,
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.READ_PHONE_STATE,
        Manifest.permission.ACCESS_NETWORK_STATE,
        Manifest.permission.ACCESS_WIFI_STATE
    )


    @RequiresApi(Build.VERSION_CODES.M)
    private fun requestPermissions(activity: Activity, permissions: Array<String>) {
        activity.requestPermissions(permissions, 0)
    }

    @RequiresApi(Build.VERSION_CODES.M)
    override fun onResume() {
        super.onResume()
        if (!isPermitted(this, sRequiredPermissions)) {
            requestPermissions(this, sRequiredPermissions)
        }
    }

    private fun isPermitted(context: Context, permissions: Array<String>): Boolean {
        val ret: Boolean = if (Build.VERSION_CODES.M > Build.VERSION.SDK_INT) {
            //            AppLog.i("Unsupported runtime permissions.");
            true
        } else {
            val deniedPermission: MutableList<String> = ArrayList()
            for (permission in permissions) {
                if (PackageManager.PERMISSION_DENIED == context.checkSelfPermission(permission)) {
                    deniedPermission.add(permission)
                }
            }
            deniedPermission.isEmpty()
        }
        return ret
    }
}
