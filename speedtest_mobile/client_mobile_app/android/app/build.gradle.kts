import java.util.Properties

plugins {
    id("com.android.application")
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

val localProperties = Properties()
val localPropertiesFile = rootProject.file("local.properties")
if (localPropertiesFile.exists()) {
    localPropertiesFile.inputStream().use { localProperties.load(it) }
}

val flutterRoot: String = localProperties.getProperty("flutter.sdk")
    ?: throw GradleException("Flutter SDK not found. Define location with flutter.sdk in the local.properties file.")

val flutterVersionCode = localProperties.getProperty("flutter.versionCode") ?: "1"
val flutterVersionName = localProperties.getProperty("flutter.versionName") ?: "1.0"

val keystoreProperties = Properties()
val keystorePropertiesFile = rootProject.file("key.properties")
if (keystorePropertiesFile.exists()) {
    keystorePropertiesFile.inputStream().use { keystoreProperties.load(it) }
}

val devKeystoreProperties = Properties()
val devKeystorePropertiesFile = rootProject.file("key.dev.properties")
if (devKeystorePropertiesFile.exists()) {
    devKeystorePropertiesFile.inputStream().use { devKeystoreProperties.load(it) }
}

val stagingKeystoreProperties = Properties()
val stagingKeystorePropertiesFile = rootProject.file("key.staging.properties")
if (stagingKeystorePropertiesFile.exists()) {
    stagingKeystorePropertiesFile.inputStream().use { stagingKeystoreProperties.load(it) }
}

android {
    namespace = "com.exactlylabs.radar"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        isCoreLibraryDesugaringEnabled = true
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }

    kotlinOptions {
        jvmTarget = "1.8"
    }

    sourceSets {
        getByName("main").java.srcDirs("src/main/kotlin")
    }

    defaultConfig {
        minSdk = 25
        applicationId = "com.exactlylabs.radar"
        targetSdk = flutter.targetSdkVersion
        versionCode = flutterVersionCode.toInt()
        versionName = flutterVersionName
    }

    signingConfigs {
        create("dev") {
            val devStoreFile = devKeystoreProperties.getProperty("storeFile")
            if (devStoreFile != null && file(devStoreFile).exists()) {
                keyAlias = devKeystoreProperties.getProperty("keyAlias")
                keyPassword = devKeystoreProperties.getProperty("keyPassword")
                storeFile = file(devStoreFile)
                storePassword = devKeystoreProperties.getProperty("storePassword")
            } else {
                // Use debug signing when keystore is not available
                println("Warning: Dev keystore not found, using debug signing")
            }
        }

        create("staging") {
            val stagingStoreFile = stagingKeystoreProperties.getProperty("storeFile")
            if (stagingStoreFile != null && file(stagingStoreFile).exists()) {
                keyAlias = stagingKeystoreProperties.getProperty("keyAlias")
                keyPassword = stagingKeystoreProperties.getProperty("keyPassword")
                storeFile = file(stagingStoreFile)
                storePassword = stagingKeystoreProperties.getProperty("storePassword")
            } else {
                // Use debug signing when keystore is not available
                println("Warning: Staging keystore not found, using debug signing")
            }
        }

        create("prod") {
            val prodStoreFile = keystoreProperties.getProperty("storeFile")
            if (prodStoreFile != null && file(prodStoreFile).exists()) {
                keyAlias = keystoreProperties.getProperty("keyAlias")
                keyPassword = keystoreProperties.getProperty("keyPassword")
                storeFile = file(prodStoreFile)
                storePassword = keystoreProperties.getProperty("storePassword")
            } else {
                // Use debug signing when keystore is not available
                println("Warning: Production keystore not found, using debug signing")
            }
        }
    }

    lint {
        checkReleaseBuilds = false
    }

    flavorDimensions += "app"
    productFlavors {
        create("prod") {
            dimension = "app"
            applicationId = "org.anthc.radar"
            namespace = "org.anthc.radar"
            // Use debug signing if prod keystore is not available
            val prodStoreFile = keystoreProperties.getProperty("storeFile")
            signingConfig = if (prodStoreFile != null && file(prodStoreFile).exists()) {
                signingConfigs.getByName("prod")
            } else {
                signingConfigs.getByName("debug")
            }
            manifestPlaceholders["app_name"] = "Radar"
            manifestPlaceholders["icon"] = "@mipmap/ic_launcher"
        }
        create("dev") {
            dimension = "app"
            applicationId = "com.exactlylabs.radar"
            namespace = "com.exactlylabs.radar"
            applicationIdSuffix = ".dev"
            // Use debug signing if dev keystore is not available
            val devStoreFile = devKeystoreProperties.getProperty("storeFile")
            signingConfig = if (devStoreFile != null && file(devStoreFile).exists()) {
                signingConfigs.getByName("dev")
            } else {
                signingConfigs.getByName("debug")
            }
            manifestPlaceholders["app_name"] = "Radar Dev"
            manifestPlaceholders["icon"] = "@mipmap/ic_launcher"
        }
        create("staging") {
            dimension = "app"
            applicationId = "com.exactlylabs.radar"
            namespace = "com.exactlylabs.radar"
            applicationIdSuffix = ".staging"
            // Use debug signing if staging keystore is not available
            val stagingStoreFile = stagingKeystoreProperties.getProperty("storeFile")
            signingConfig = if (stagingStoreFile != null && file(stagingStoreFile).exists()) {
                signingConfigs.getByName("staging")
            } else {
                signingConfigs.getByName("debug")
            }
            manifestPlaceholders["app_name"] = "Radar Staging"
            manifestPlaceholders["icon"] = "@mipmap/ic_launcher"
        }
    }

    configurations {
        implementation {
            exclude(group = "org.jetbrains", module = "annotations")
        }
    }

    buildTypes {
        release {
            isShrinkResources = false
            isMinifyEnabled = false
            ndk {
                abiFilters += listOf("arm64-v8a", "armeabi-v7a", "x86_64")
            }
        }
    }
}

flutter {
    source = "../.."
}

// Fix APK output path for Flutter compatibility
tasks.register("copyApksToFlutterLocation") {
    doLast {
        val androidBuildDir = File(project.buildDir, "outputs/apk")
        val flutterApkDir = File(project.rootDir.parent, "build/app/outputs/flutter-apk")
        flutterApkDir.mkdirs()
        
        if (androidBuildDir.exists()) {
            androidBuildDir.walkTopDown().forEach { file ->
                if (file.name.endsWith(".apk")) {
                    val targetFile = File(flutterApkDir, file.name)
                    file.copyTo(targetFile, overwrite = true)
                    println("Copied APK to Flutter location: ${targetFile.absolutePath}")
                }
            }
        }
        
        // Also copy from flutter-apk directory if it exists
        val flutterApkSourceDir = File(project.buildDir, "outputs/flutter-apk")
        if (flutterApkSourceDir.exists()) {
            flutterApkSourceDir.walkTopDown().forEach { file ->
                if (file.name.endsWith(".apk")) {
                    val targetFile = File(flutterApkDir, file.name)
                    file.copyTo(targetFile, overwrite = true)
                    println("Copied APK to Flutter location: ${targetFile.absolutePath}")
                }
            }
        }
    }
}

// Run the copy task after any assemble task
tasks.matching { it.name.startsWith("assemble") }.configureEach {
    finalizedBy("copyApksToFlutterLocation")
}

dependencies {
    val splashScreenVersion = "1.0.0"
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk7:2.1.0")
    implementation("androidx.core:core-splashscreen:$splashScreenVersion")
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.1.5")
}
