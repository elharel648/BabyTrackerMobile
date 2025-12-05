module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 🔥 חובה שזה יהיה הפלאגין האחרון ברשימה! 🔥
      'react-native-reanimated/plugin',
    ],
  };
};