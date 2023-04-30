const { withAndroidStyles, withPlugins } = require('@expo/config-plugins');

function withAndroidStyle(config, styles) {
    return withAndroidStyles(config, config => {
        config.modResults = buildStyles(
            config.modResults,
            styles
        );
        return config;
    });
}

const replaceAttribute = (items, attribute, color) => {
    let attributeHolder = items.find(item => item.$['name'] === attribute);
    if (attributeHolder) {
        attributeHolder['_'] = color;
    } else {
        attributeHolder = {
            $: { name: attribute },
            _: color
        };
        items.push(attributeHolder);
    }
}

function populateStyle(styles, stylesKey, {parent, ...stylesValues}) {
    let theme = styles.find(item => item.$['name'] === stylesKey);
    if (!theme) {
        theme = {
            $: {
                name: stylesKey,
                parent: parent ?? ''//: 'Theme.AppCompat.Light.NoActionBar'
            }
        };
        styles.push(theme);
    }

    let items = theme['item'];
    if (!Array.isArray(items)) {
        items = [];
        theme['item'] = items;
    }

    Object.entries(stylesValues)
        .forEach(([attributeKey, attributeValue]) => replaceAttribute(items, attributeKey, attributeValue))
}

function buildStyles(androidStyles, stylesHolder) {
    let resources = androidStyles['resources'];
    if (!resources) {
        resources = {
            $: { 'xmlns:tools': 'http://schemas.android.com/tools' }
        };
        androidStyles['resources'] = resources;
    }

    let styles = resources['style'];
    if (!Array.isArray(styles)) {
        styles = [];
        resources['style'] = styles;
    }

    Object.entries(stylesHolder)
        .forEach(([stylesKey, stylesValue]) => populateStyle(styles, stylesKey, stylesValue))

    return androidStyles;
}

module.exports = (config, props) =>
    withPlugins(config, [[withAndroidStyle, props]]);
