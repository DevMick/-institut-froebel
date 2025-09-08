export default {
  expo: {
    name: "Rotary Club Mobile",
    slug: "rotary-club-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.rotaryclub.mobile"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.rotaryclub.mobile"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    platforms: ["ios", "android", "web"],
    sdkVersion: "52.0.0"
  }
};
