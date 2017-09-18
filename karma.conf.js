var webpack = require('webpack');
var path = require('path');

module.exports = function (config) {
    config.set({
        browsers: ['Chrome'],
        singleRun: true,
        frameworks: ['mocha'],
        files: [
            'tests/e2e/auth.e2e.js'
        ],
        preprocessors: {
            'e2e/auth.e2e.js': ['webpack']
        },
        reporters: ['dots'],
        webpack: {
            module: {
                loaders: [
                    {
                        test: /\.(jsx|js)?$/, exclude: /node_modules/, loader: 'babel-loader', include: [
                        path.join(__dirname, 'e2e')
                    ],
                        query: {
                            presets: ['react', 'es2015']
                        }
                    }
                ]
            },
            watch: true
        },
        webpackServer: {
            noInfo: true
        }
    });
};