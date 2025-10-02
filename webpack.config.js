const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

module.exports = (env) => {

    const isProduction = env.production; // Check if the build is for production
    const publicPath = env.production ? '/pwa_app/' : '/';

    return{
        mode: isProduction ? 'production' : 'development',
        entry: './src/index.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'bundle.js',
            publicPath: publicPath
        },
        plugins:[
            new Dotenv({
                path: isProduction ? './.env.production' : './.env.development', // Load the correct .env file based on the environment
            }),
            new HtmlWebpackPlugin({
                template: './public/index.html', //Correct path to the index.html file
                filename: 'index.html'
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: './public/manifest.json', to: 'manifest.json' }, // Copy manifest.json
                    { from: './public/service-worker.js', to: 'service-worker.js' }, // Copy service-worker.js
                    { from: './public/images', to: 'images' } // Copy images folder
                ]
            }),
            new webpack.DefinePlugin({
                'process.env.PUBLIC_URL': JSON.stringify(publicPath) // Define PUBLIC_URL for use in the app
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
            historyApiFallback: true,
            open: true,
            headers:{
                'Access-Control-Allow-Origin': '*', //Add CORS headers
            }
        },
        resolve: {
            extensions: ['.js']
        },
        // Other Webpack configuration...
        devtool: false, // Disable source maps
        // ...
    }

    
};