const path = require('path');

module.exports = {
    entry: './src/index.ts',
    target: 'node',
    experiments: {
        outputModule: true
    },
    output: {
        module: true
    },
    output: {
        filename: 'bundle.mjs',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        extensionAlias: {
            '.js': ['.ts', '.js']
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    optimization: {
        minimize: false
    }
};
