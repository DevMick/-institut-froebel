module.exports = {
  project: {
    ios: {},
    android: {
      sourceDir: './android',
      appName: 'RotaryClubMobile',
    },
  },
  assets: ['./src/assets/fonts/'],
  dependencies: {
    // Disable auto-linking for specific packages if needed
    // 'react-native-vector-icons': {
    //   platforms: {
    //     android: {
    //       sourceDir: '../node_modules/react-native-vector-icons/android',
    //       packageImportPath: 'import io.github.react_native_vector_icons.VectorIconsPackage;',
    //     },
    //   },
    // },
  },
};
