const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

module.exports = (env= {}) => {

    const isProduction = Boolean(env.production); // Check if the build is for production
    const publicPathProd = './';

    return{
        mode: isProduction ? 'production' : 'development',
        entry: path.resolve(__dirname, 'src' , 'index.js'),
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'bundle.js',
            publicPath: isProduction ? publicPathProd : '/', // Use relative path in production for SW to work correctly
            clean : true // Clean the output directory before emitting
        },        
        plugins:[
            new Dotenv({
                path: isProduction ? './.env.production' : './.env.development', // Load the correct .env file based on the environment
            }),
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, 'public' , 'index.html'), //Correct path to the index.html file
                inject: 'body'
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: path.resolve(__dirname, 'public' , 'manifest.json'), to: 'manifest.json' }, // Copy manifest.json
                    { from: path.resolve(__dirname, 'public','service-worker.js'), to: 'service-worker.js' }, // Copy service-worker.js
                    { from: path.resolve(__dirname, 'public','images'), to: 'images', noErrorOnMissing: true }, // Copy images folder
                    { from: path.resolve(__dirname, 'public','icons'), to: 'icons', noErrorOnMissing: true } // Copy icons folder
                ]
            }),
            new webpack.DefinePlugin({
                'process.env.PUBLIC_URL': JSON.stringify(isProduction ? publicPathProd : '/') // Define PUBLIC_URL for use in the app
            })
        ],
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: 'babel-loader'
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                }
            ]
        },
        devServer: {
            static: {
                directory: path.resolve(__dirname, 'public'), // Updated property for serving static files
                publicPath: '/', // Ensure static files are served from the root
            },
            devMiddleware: {
                publicPath: '/', // Ensure bundled files are served from the root
            },
            compress: true,
            port: process.env.PORT || 'auto',
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