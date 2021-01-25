const path = require('path');
const AntDesignThemePlugin = require('antd-theme-webpack-plugin');
const { override, fixBabelImports, addLessLoader } = require('customize-cra')


const options = {
    stylesDir: path.join(__dirname, './src/styles'),
    antDir: path.join(__dirname, './node_modules/antd'),
    varFile: path.join(__dirname, './src/styles/variables.less'),
    mainLessFile: path.join(__dirname, './src/styles/wieldy.less'),
    themeVariables: [
        '@primary-color',
        '@secondary-color',
        '@text-color',
        '@heading-color',
        '@nav-dark-bg',
        '@header-text-color',
        '@layout-header-background',
        '@layout-footer-background',
        '@nav-dark-text-color',
        '@hor-nav-text-color',
        '@nav-header-selected-text-color'
    ],
    indexFileName: 'index.html',
    generateOnce: false // generate color.less on each compilation
};


const overrideProcessEnv = value => config => {
    config.resolve.modules = [
        path.join(__dirname, 'src')
    ].concat(config.resolve.modules);
    config.plugins.push(new AntDesignThemePlugin(options));
    return config;
};

module.exports = override(
    addLessLoader({
        javascriptEnabled: true,
        modifyVars: {
            "@primary-color": "#038fde",
            "@secondary-color": "#fa8c16",
            "@text-color": "#545454",
            "@heading-color": "#535353",
            "@nav-dark-bg": "#003366",
            "@nav-dark-text-color": "#038fdd",
            "@header-text-color": "#262626",
            "@layout-header-background": "#fefefe",
            "@layout-footer-background": "#fffffd",
            "@body-background": "#f5f5f5",
            "@hor-nav-text-color": "#fffffd"
        }
    }),
    overrideProcessEnv({
        VERSION: JSON.stringify(require('./package.json').version),
    })
);