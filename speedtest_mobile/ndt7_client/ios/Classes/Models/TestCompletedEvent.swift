//
//  EventSuccess.swift
//  omron_plugin
//
//  Created by Ignacio Grasso on 11/10/22.
//

import Foundation
struct TestCompletedEvent {
   var test: String
    init(test: String) {
        self.test = test;
   }
    
    public func toJson() -> String {
        var dic: [String:String] = [:];
        dic["test"] = self.test;
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: dic, options: .prettyPrinted);
            return String(data: jsonData, encoding: .ascii)!
        } catch {
            print(error.localizedDescription)
        }
        return "{}";
    }
}
