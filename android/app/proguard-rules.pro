# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Keep React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep React Native modules
-keep class com.facebook.react.modules.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.uimanager.** { *; }

# Keep SQLite classes
-keep class io.github.react_native_sqlite_storage.** { *; }
-keep class org.sqlite.** { *; }

# Keep Firebase classes
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Keep Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# Keep QR Code libraries
-keep class com.github.react_native_qrcode_svg.** { *; }
-keep class com.google.zxing.** { *; }

# Keep Permissions
-keep class com.zoontek.rnpermissions.** { *; }

# Keep Share
-keep class cl.json.** { *; }

# Keep NetInfo
-keep class com.reactnativecommunity.netinfo.** { *; }

# Keep Crypto
-keep class org.spongycastle.** { *; }
-keep class javax.crypto.** { *; }

# Keep application classes
-keep class com.rotaryclubmobile.** { *; }

# Keep annotations
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod
-keepattributes SourceFile,LineNumberTable

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep enum classes
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Remove logging in release
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}

# Optimization settings
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification
-dontpreverify

# Don't warn about missing classes
-dontwarn com.facebook.react.**
-dontwarn com.facebook.hermes.**
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**

# Performance: remove debug code
-assumenosideeffects class * {
    boolean __DEV__;
}
