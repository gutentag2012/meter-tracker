module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.tsx', '.ts', '.js', '.json'],
          alias: {
            '@': './modules',
            '@ui': './ui',
            '@utils': './utils',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  }
}
