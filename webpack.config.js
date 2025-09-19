const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/'
    },
    plugins:[
        new HtmlWebpackPlugin({
            template: './public/index.html', //Correct path to the index.html file
            filename: 'index.html'
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: './public/manifest.json', to: 'manifest.json' }, // Copy manifest.json
                { from: './public/service-worker.js', to: 'service-worker.js' } // Copy service-worker.js
            ]
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'), // Updated property for serving static files
        },
        compress: true,
        port: 9000,
        historyApiFallback: true
    },
    resolve: {
        extensions: ['.js']
    }
};