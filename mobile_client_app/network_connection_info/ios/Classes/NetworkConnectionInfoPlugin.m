#import "NetworkConnectionInfoPlugin.h"
#if __has_include(<network_connection_info/network_connection_info-Swift.h>)
#import <network_connection_info/network_connection_info-Swift.h>
#else
// Support project import fallback if the generated compatibility header
// is not copied when this plugin is created as a library.
// https://forums.swift.org/t/swift-static-libraries-dont-copy-generated-objective-c-header/19816
#import "network_connection_info-Swift.h"
#endif

@implementation NetworkConnectionInfoPlugin
+ (void)registerWithRegistrar:(NSObject<FlutterPluginRegistrar>*)registrar {
  [SwiftNetworkConnectionInfoPlugin registerWithRegistrar:registrar];
}
@end
