//var webpack = require("webpack");
module.exports = {
    entry: "./index.js",
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            //use: ['babel-loader']

        }]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    output: {
        filename: './lib/sand.js',
        libraryTarget: 'umd',
        library: 'sand',
    },
    optimization: {},
    plugins: [
    ]

}
