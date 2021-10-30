const path = require('path');
const miniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: {
        index: "./src/index.js"
    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, 'public'),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.s?css$/i,
                use: [miniCssExtractPlugin.loader, "css-loader", "sass-loader", "postcss-loader"]
            }
        ]
    },
    plugins: [new miniCssExtractPlugin()],

    devtool: 'source-map'
}