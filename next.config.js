const nextBuildId = require('next-build-id');
module.exports = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    });

    return config;
  },
  generateBuildId: async () => nextBuildId({ dir: __dirname,  description : true })
};