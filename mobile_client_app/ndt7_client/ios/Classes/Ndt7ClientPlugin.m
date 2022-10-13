#import "Ndt7ClientPlugin.h"
#if __has_include(<ndt7_client/ndt7_client-Swift.h>)
#import <ndt7_client/ndt7_client-Swift.h>
#else
// Support project import fallback if the generated compatibility header
// is not copied when this plugin is created as a library.
// https://forums.swift.org/t/swift-static-libraries-dont-copy-generated-objective-c-header/19816
#import "ndt7_client-Swift.h"
#endif

@implementation Ndt7ClientPlugin
+ (void)registerWithRegistrar:(NSObject<FlutterPluginRegistrar>*)registrar {
  [SwiftNdt7ClientPlugin registerWithRegistrar:registrar];
}
@end
