//
//  WebViewController.swift
//  ndt7_client
//
//  Created by Ignacio Grasso on 3/27/23.
//

import Foundation
import WebKit

class WebViewController: UIViewController {
    private var webView: WKWebView!
    let subdirectory: String
    
    init(dir: String) {
        self.subdirectory = dir
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        guard let cacheDir = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first else {
            fatalError("Could not find Cache directory")
        }
        let fileUrl = cacheDir.appendingPathComponent("client.html")
        
        if !FileManager.default.fileExists(atPath: fileUrl.path) {
            // handle error or create the file
        }
        
        let webView = WKWebView(frame: view.bounds)
        var request = URLRequest(url: fileUrl)
        print(webView.configuration.preferences.javaScriptCanOpenWindowsAutomatically)
        request.setValue("Origin", forHTTPHeaderField: "https://ndt7.radar.app")
        if #available(iOS 15.0, *) {
            webView.loadFileRequest(request, allowingReadAccessTo: fileUrl.deletingLastPathComponent())
        } else {
            // Fallback on earlier versions
        }
        //        webView.loadFileURL(fileUrl, allowingReadAccessTo: cacheDir)
        view.addSubview(webView)
    }
}
