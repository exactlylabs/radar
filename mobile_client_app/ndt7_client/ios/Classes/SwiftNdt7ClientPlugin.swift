import Flutter
import UIKit
import NDT7

public class SwiftNdt7ClientPlugin: NSObject, FlutterPlugin, FlutterStreamHandler {
    
    private var eventSink: FlutterEventSink?
    private var ndt7Test: NDT7Test?
    
    public override init() {
        super.init()
        let settings = NDT7Settings()
        ndt7Test = NDT7Test(settings: settings)
        ndt7Test?.delegate = self
    }
    
    public static func register(with registrar: FlutterPluginRegistrar) {
        let channel = FlutterMethodChannel(name: "method_ndt7_client", binaryMessenger: registrar.messenger())
        let eventChannel = FlutterEventChannel(name: "event_ndt7_client", binaryMessenger: registrar.messenger())
        let instance = SwiftNdt7ClientPlugin()
        eventChannel.setStreamHandler(instance)
        registrar.addMethodCallDelegate(instance, channel: channel)
    }
    
    public func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        switch(call.method) {
        case "startDownloadTest":
            result(startDownloadTest())
        case "startUploadTest":
            result(startUploadTest())
            break
        case "stopTest":
            result(stopTest())
            break
        default:
            break
        }
    }
    
    private func startDownloadTest() -> FlutterError? {
        var flutterError : FlutterError? = nil
        ndt7Test?.startTest(download: true, upload: false) { [weak self] (error) in
            guard self != nil else { return }
            if let error = error {
                print("NDT7 iOS Example app - Error during test: \(error.localizedDescription)")
                flutterError = FlutterError(code: "startUploadTest", message:error.localizedDescription, details: error)
            } else {
                print("NDT7 iOS Example app - Test finished.")
            }
        }
        return flutterError
    }
    
    private func startUploadTest()  -> FlutterError? {
        var flutterError : FlutterError? = nil
        ndt7Test?.startTest(download: false, upload: true) { [weak self] (error) in
            guard self != nil else { return }
            if let error = error {
                print("NDT7 iOS Example app - Error during test: \(error.localizedDescription)")
                flutterError = FlutterError(code: "startUploadTest", message:error.localizedDescription, details: error)
            } else {
                print("NDT7 iOS Example app - Test finished.")
            }
        }
        return flutterError
    }
    
    func stopTest()  -> FlutterError? {
        ndt7Test?.cancel()
        return nil
    }
    
    public func onListen(withArguments arguments: Any?, eventSink events: @escaping FlutterEventSink) -> FlutterError? {
        self.eventSink = events;
        return nil
    }
    
    public func onCancel(withArguments arguments: Any?) -> FlutterError? {
        self.eventSink = nil
        return nil
    }
}

extension SwiftNdt7ClientPlugin: NDT7TestInteraction {
    public func test(kind: NDT7TestConstants.Kind, running: Bool) {
        switch kind {
        case .download:
            print("downloadTestRunning = \(running.description)")
        case .upload:
            print("uploadTestRunning = \(running.description)")
            //            uploadTestRunning = running
            //            statusUpdate(downloadTestRunning: nil, uploadTestRunning: running)
        }
    }
    
    public func measurement(origin: NDT7TestConstants.Origin, kind: NDT7TestConstants.Kind, measurement: NDT7Measurement) {
        do {
            let data = try JSONEncoder().encode(measurement)
            // The JSON data is in bytes. Let's printit as a JSON string.
            if let jsonString = String(data: data, encoding: .utf8) {
                //                eventSink?(jsonString.replacingOccurrences(of: "\\", with: ""))
                print(jsonString)
                eventSink?(jsonString)
            }
            // Let's save the data to decode it back to Swift below.
        } catch var err {
            
        }
        //        if let server = ndt7Test?.settings.currentServer {
        //            //            serverLabel.text = server.machine
        //            print("\(origin.rawValue) serverLabel = \(server.machine)")
        //            if let serverCountry = server.location?.country,
        //               let serverCity = server.location?.city
        //            {
        //                //                serverLocationLabel.text = "\(serverCity), \(serverCountry)"
        //                print("\(origin.rawValue) serverLocationLabel = \(serverCity), \(serverCountry)")
        //            }
        //        }
        //
        //        if origin == .client,
        //           //           enableAppData,
        //           let elapsedTime = measurement.appInfo?.elapsedTime,
        //           let numBytes = measurement.appInfo?.numBytes,
        //           elapsedTime >= 1000000 {
        //            let seconds = elapsedTime / 1000000
        //            let mbit = numBytes / 125000
        //            let rounded = Double(Float64(mbit)/Float64(seconds)).rounded(toPlaces: 1)
        //            switch kind {
        //            case .download:
        //                print(".client downloadSpeed = \(rounded) Mbit/s")
        //                //                downloadSpeed = rounded
        //                //                DispatchQueue.main.async { [weak self] in
        //                //                    self?.downloadSpeedLabel.text = "\(rounded) Mbit/s"
        //                //                }
        //            case .upload:
        //                print(".client uploadSpeed = \(rounded) Mbit/s")
        //                //                uploadSpeed = rounded
        //                //                DispatchQueue.main.async { [weak self] in
        //                //                    self?.uploadSpeedLabel.text = "\(rounded) Mbit/s"
        //                //                }
        //            }
        //        } else if origin == .server,
        //                  let elapsedTime = measurement.tcpInfo?.elapsedTime,
        //                  elapsedTime >= 1000000 {
        //            let seconds = elapsedTime / 1000000
        //            switch kind {
        //            case .download:
        //                if let numBytes = measurement.tcpInfo?.bytesSent {
        //                    let mbit = numBytes / 125000
        //                    let rounded = Double(Float64(mbit)/Float64(seconds)).rounded(toPlaces: 1)
        //                    print(".server downloadSpeed = \(rounded) Mbit/s")
        //                    //                    downloadSpeed = rounded
        //                    //                    DispatchQueue.main.async { [weak self] in
        //                    //                        self?.downloadSpeedLabel.text = "\(rounded) Mbit/s"
        //                    //                    }
        //                }
        //            case .upload:
        //                if let numBytes = measurement.tcpInfo?.bytesReceived {
        //                    let mbit = numBytes / 125000
        //                    let rounded = Double(Float64(mbit)/Float64(seconds)).rounded(toPlaces: 1)
        //                    print(".server uploadSpeed = \(rounded) Mbit/s")
        //                    //                    uploadSpeed = rounded
        //                    //                    DispatchQueue.main.async { [weak self] in
        //                    //                        self?.uploadSpeedLabel.text = "\(rounded) Mbit/s"
        //                    //                    }
        //                }
        //            }
        //        }
    }
    
    public func error(kind: NDT7TestConstants.Kind, error: NSError) {
        stopTest()
    }
}

extension Double {
    func rounded(toPlaces places: Int) -> Double {
        let divisor = pow(10.0, Double(places))
        return (self * divisor).rounded() / divisor
    }
}
