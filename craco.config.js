const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      if (env === 'production') {
        // Remove source maps from production build
        webpackConfig.devtool = false;

        // Optimize bundle splitting
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
              },
              i18next: {
                test: /[\\/]node_modules[\\/](i18next|react-i18next|i18next-http-backend|i18next-browser-languagedetector)[\\/]/,
                name: 'i18next',
                chunks: 'all',
                priority: 10,
              },
              antd: {
                test: /[\\/]node_modules[\\/]antd[\\/]/,
                name: 'antd',
                chunks: 'all',
              },
              react: {
                test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                name: 'react',
                chunks: 'all',
              },
            },
          },
        };
      }

      return webpackConfig;
    },
  },
  plugins: [
    {
      plugin: {
        overrideWebpackConfig: ({ webpackConfig }) => {
          // Optimize images
          const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

          webpackConfig.optimization.minimizer = [
            ...webpackConfig.optimization.minimizer,
            new ImageMinimizerPlugin({
              minimizer: {
                implementation: ImageMinimizerPlugin.imageminMinify,
                options: {
                  plugins: [
                    ['gifsicle', { interlaced: true }],
                    ['jpegtran', { progressive: true }],
                    ['optipng', { optimizationLevel: 5 }],
                    ['svgo', { name: 'preset-default' }],
                  ],
                },
              },
            }),
          ];

          return webpackConfig;
        },
      },
    },
  ],
};
