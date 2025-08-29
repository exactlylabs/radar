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
            keyAlias = devKeystoreProperties.getProperty("keyAlias")
            keyPassword = devKeystoreProperties.getProperty("keyPassword")
            storeFile = devKeystoreProperties.getProperty("storeFile")?.let { path -> file(path) }
            storePassword = devKeystoreProperties.getProperty("storePassword")
        }

        create("staging") {
            keyAlias = stagingKeystoreProperties.getProperty("keyAlias")
            keyPassword = stagingKeystoreProperties.getProperty("keyPassword")
            storeFile = stagingKeystoreProperties.getProperty("storeFile")?.let { path -> file(path) }
            storePassword = stagingKeystoreProperties.getProperty("storePassword")
        }

        create("prod") {
            keyAlias = keystoreProperties.getProperty("keyAlias")
            keyPassword = keystoreProperties.getProperty("keyPassword")
            storeFile = keystoreProperties.getProperty("storeFile")?.let { path -> file(path) }
            storePassword = keystoreProperties.getProperty("storePassword")
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
            signingConfig = signingConfigs.getByName("prod")
            manifestPlaceholders["app_name"] = "Radar"
            manifestPlaceholders["icon"] = "@mipmap/ic_launcher"
        }
        create("dev") {
            dimension = "app"
            applicationId = "com.exactlylabs.radar"
            namespace = "com.exactlylabs.radar"
            applicationIdSuffix = ".dev"
            signingConfig = signingConfigs.getByName("dev")
            manifestPlaceholders["app_name"] = "Radar Dev"
            manifestPlaceholders["icon"] = "@mipmap/ic_launcher"
        }
        create("staging") {
            dimension = "app"
            applicationId = "com.exactlylabs.radar"
            namespace = "com.exactlylabs.radar"
            applicationIdSuffix = ".staging"
            signingConfig = signingConfigs.getByName("staging")
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

dependencies {
    val splashScreenVersion = "1.0.0"
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk7:2.1.0")
    implementation("androidx.core:core-splashscreen:$splashScreenVersion")
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.1.5")
}
