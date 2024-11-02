module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['inline-import', { extensions: ['.sql'] }],
      ['module:@preact/signals-react-transform'],
      ['react-native-reanimated/plugin'],
    ],
  }
}
