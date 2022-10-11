import UIKit
import Flutter

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        GeneratedPluginRegistrant.register(with: self)
        try! FileManager.default.removeItem(atPath: NSHomeDirectory()+"/Library/SplashBoard")
        
        do {
            sleep(2)
        }
        return super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }
}
