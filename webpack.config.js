const path = require('path');

module.exports = {
    entry: './src/bfsTable.js',
    devtool: 'inline-source-map',
    devServer: {
      static: './dist',
      hot : true
    },
    mode : 'development',
    output: {
     filename: 'bfsTable-bundle.js',
      path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
          {
            test: /\.(scss)$/,
            use: [
              {
                loader: 'style-loader'
              },
              {
                loader: 'css-loader'
              },
              {
                loader: 'postcss-loader',
                options: {
                  postcssOptions: {
                    plugins: () => [
                      require('autoprefixer')
                    ]
                  }
                }
              },
              {
                loader: 'sass-loader'
              }
            ]
          }
        ]
    }
};