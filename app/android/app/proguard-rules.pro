-keepattributes *Annotation*, JavascriptInterface
-keepattributes SourceFile,LineNumberTable

-keep class com.healthybite.app.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keep class * extends com.getcapacitor.NativePlugin { *; }
-keep class com.getcapacitor.** { *; }
-keep class com.google.android.gms.** { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class * extends android.app.Activity { *; }
-keep class * extends android.webkit.WebView { *; }
-keep class * extends android.webkit.WebViewClient { *; }
-keep class * extends android.webkit.WebChromeClient { *; }
-dontwarn com.google.android.gms.**
-dontwarn com.google.firebase.**
-dontwarn com.getcapacitor.**
