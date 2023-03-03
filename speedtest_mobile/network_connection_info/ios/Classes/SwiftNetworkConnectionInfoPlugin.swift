import Flutter
import UIKit

public class SwiftNetworkConnectionInfoPlugin: NSObject, FlutterPlugin {
  public static func register(with registrar: FlutterPluginRegistrar) {
    let channel = FlutterMethodChannel(name: "network_connection_info", binaryMessenger: registrar.messenger())
    let instance = SwiftNetworkConnectionInfoPlugin()
    registrar.addMethodCallDelegate(instance, channel: channel)
  }

  public func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
    result("iOS " + UIDevice.current.systemVersion)
  }
}
