# ============================================================================
# TRESNO - INDONESIAN 1-ON-1 VIDEO MATCH APP
# PRODUCTION PROGUARD & R8 OBFUSCATION RULES
# ============================================================================

# ----------------------------------------------------------------------------
# 1. OPTIMIZATION & DEBUGGING METADATA
# ----------------------------------------------------------------------------
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-dontpreverify
-verbose

# Pertahankan SourceFile dan LineNumberTable agar stack trace crash report
# (Firebase Crashlytics / Sentry) dapat di-deobfuscate menggunakan mapping.txt
-keepattributes SourceFile,LineNumberTable,EnclosingMethod,InnerClasses,Signature,Exceptions,*Annotation*
-renamesourcefileattribute SourceFile

# ----------------------------------------------------------------------------
# 2. LOG STRIPPING (PEMBERSIHAN LOG SENSITIF PADA RELEASE)
# ----------------------------------------------------------------------------
# Hapus semua panggilan android.util.Log pada build rilis untuk mencegah kebocoran data
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int d(...);
    public static int i(...);
    public static int w(...);
    public static int e(...);
}

# ----------------------------------------------------------------------------
# 3. REACT NATIVE CORE & JNI NATIVE BINDINGS
# ----------------------------------------------------------------------------
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }
-keep interface com.facebook.react.bridge.** { *; }
-keep @interface com.facebook.react.common.annotations.** { *; }
-keep @interface com.facebook.react.uimanager.annotations.** { *; }

# Pertahankan method yang menggunakan anotasi @DoNotStrip
-keep @interface com.facebook.proguard.annotations.DoNotStrip
-keep @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class * { *; }
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
    @com.facebook.proguard.annotations.KeepGettersAndSetters *;
}

# React Native TurboModules & Fabric C++ Native JNI
-keepclassmembers class * extends com.facebook.react.bridge.JavaScriptModule {
    public <methods>;
}
-keepclassmembers class * extends com.facebook.react.bridge.NativeModule {
    public <methods>;
}

# ----------------------------------------------------------------------------
# 4. HERMES JAVASCRIPT ENGINE
# ----------------------------------------------------------------------------
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.hermes.** { *; }
-keepclassmembers class com.facebook.hermes.** { *; }

# ----------------------------------------------------------------------------
# 5. AGORA RTC VIDEO CALL SDK (1-ON-1 STREAMING & AUDIO/VIDEO)
# ----------------------------------------------------------------------------
# Agora SDK sangat bergantung pada library C/C++ native (libagora-rtc-sdk.so)
-keep class io.agora.** { *; }
-keep interface io.agora.** { *; }
-keep class io.agora.rtc.** { *; }
-keep class io.agora.base.** { *; }
-keep class io.agora.rtc2.** { *; }
-dontwarn io.agora.**

# WebRTC native audio/video layer yang digunakan oleh Agora
-keep class org.webrtc.** { *; }
-dontwarn org.webrtc.**

# ----------------------------------------------------------------------------
# 6. REACT NATIVE REANIMATED
# ----------------------------------------------------------------------------
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-dontwarn com.swmansion.reanimated.**

# ----------------------------------------------------------------------------
# 7. REACT NATIVE SCREENS & SAFE AREA CONTEXT
# ----------------------------------------------------------------------------
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.th3rdwave.safeareacontext.** { *; }
-dontwarn com.swmansion.rnscreens.**
-dontwarn com.th3rdwave.safeareacontext.**

# ----------------------------------------------------------------------------
# 8. REACT NATIVE SVG
# ----------------------------------------------------------------------------
-keep class com.horcrux.svg.** { *; }
-dontwarn com.horcrux.svg.**

# ----------------------------------------------------------------------------
# 9. OKHTTP, OKIO & WEBSOCKET NETWORKING
# ----------------------------------------------------------------------------
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase
-keepclassmembers class * extends okhttp3.WebSocketListener {
    public <methods>;
}

# ----------------------------------------------------------------------------
# 10. CHUCKER NETWORK INSPECTOR (ON-DEVICE DEBUGGER)
# ----------------------------------------------------------------------------
-keep class com.chuckerteam.chucker.** { *; }
-dontwarn com.chuckerteam.chucker.**

# ----------------------------------------------------------------------------
# 11. SERIALIZATION & GENERAL DATA MODELS
# ----------------------------------------------------------------------------
-dontwarn kotlin.**
-dontwarn kotlinx.**
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    !private <fields>;
    !private <methods>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# ----------------------------------------------------------------------------
# 12. GOOGLE PLAY INTEGRITY API (HARDWARE-BACKED ATTESTATION)
# ----------------------------------------------------------------------------
-keep class com.google.android.play.core.integrity.** { *; }
-dontwarn com.google.android.play.core.integrity.**
-keep interface com.google.android.play.core.integrity.** { *; }

# ----------------------------------------------------------------------------
# 13. FIREBASE APP CHECK (DEVICECHECK & RECAPTCHA ENTERPRISE)
# ----------------------------------------------------------------------------
-keep class com.google.firebase.appcheck.** { *; }
-dontwarn com.google.firebase.appcheck.**
-keep class com.google.firebase.appcheck.playintegrity.** { *; }
-keep interface com.google.firebase.appcheck.** { *; }

# ----------------------------------------------------------------------------
# 14. ANTI-ROOT & INTEGRITY HEURISTIC LIBRARIES (ROOTBEER)
# ----------------------------------------------------------------------------
-keep class com.scottyab.rootbeer.** { *; }
-dontwarn com.scottyab.rootbeer.**
-keepclassmembers class com.scottyab.rootbeer.RootBeer {
    public boolean isRooted();
    public boolean isRootedWithoutBusyBoxCheck();
}

