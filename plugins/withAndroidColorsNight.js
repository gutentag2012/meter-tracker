const {withAndroidColorsNight, withPlugins} = require('@expo/config-plugins')

function withAndroidAccentColor(config, colors) {
    return withAndroidColorsNight(config, config => {
        config.modResults = buildColors(
            config.modResults,
            colors,
        )
        return config
    })
}

function buildColors(androidStyles, colorHolder) {
    let resources = androidStyles.resources
    if (!resources) {
        resources = {
            $: {'xmlns:tools': 'http://schemas.android.com/tools'},
        }
        androidStyles.resources = resources
    }

    let colors = resources.color
    if (!Array.isArray(colors)) {
        colors = []
        resources.color = colors
    }

    Object.entries(colorHolder)
        .forEach(([colorKey, colorValue]) => {
            let colorHolder = colors.find(item => item.$['name'] === colorKey)
            if (!colorHolder) {
                colorHolder = {
                    $: {
                        name: colorKey,
                    },
                    _: colorValue,
                }
                colors.push(colorHolder)
            } else {
                colorHolder._ = colorValue
            }
        })

    return androidStyles
}

module.exports = (config, props) =>
    withPlugins(config, [[withAndroidAccentColor, props]])
