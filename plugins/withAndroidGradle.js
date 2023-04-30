const {withAppBuildGradle, withPlugins} = require('@expo/config-plugins')

function withAndroidAccentColor(config) {
    return withAppBuildGradle(config, config => {
        config.modResults = buildGradle(
            config.modResults,
        )
        return config
    })
}

function buildGradle(androidGradle) {
    const splitter = "dependencies {"
    const [start, end] = androidGradle.contents.split(splitter)
    androidGradle.contents = `${start}${splitter}\n    implementation 'com.google.android.material:material:1.6.1'\n${end}`

    return androidGradle
}

module.exports = (config, props) =>
    withPlugins(config, [[withAndroidAccentColor, props]])
