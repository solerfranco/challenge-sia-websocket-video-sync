const path = require('path');

module.exports = {
    mode: 'production', 
    entry: './public/app.js',
    target: ['web', 'es5'], 
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', { targets: "ie 11" }] 
                        ]
                    }
                }
            }
        ]
    }
};