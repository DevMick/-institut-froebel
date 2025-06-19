module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Plugin pour React Native Paper
      'react-native-paper/babel',
    ],
  };
};
