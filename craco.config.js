module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Find the source-map-loader rule and modify it
      const sourceMapRule = webpackConfig.module.rules.find(
        rule => rule.use && rule.use.find && rule.use.find(use => 
          use.loader && use.loader.includes('source-map-loader')
        )
      );
      
      if (sourceMapRule) {
        // Add exclusions for problematic packages
        sourceMapRule.exclude = [
          ...(sourceMapRule.exclude || []),
          /node_modules\/@solana/,
          /node_modules\/superstruct/,
          /node_modules\/buffer-layout/
        ];
      }
      
      return webpackConfig;
    }
  }
};
