const { resolve } = require('path');
const { IgnorePlugin } = require('webpack');

module.exports = {
    entry: resolve(__dirname, 'lib', 'index.tsx'),
    output: {
        filename: 'react-multiselect.js',
        path: resolve(__dirname, 'dist'),
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader'
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader'
            }
        ]
    },
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM'
    },
    plugins: [
        new IgnorePlugin(/__tests__/)
    ]
}