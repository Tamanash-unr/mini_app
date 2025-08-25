const webpack = require("webpack");

module.exports = function override(config, env){
        //do stuff with the webpack config...
        config.resolve.fallback = {
            ...config.resolve.fallback,
            buffer: require.resolve("buffer"),
        }
        config.resolve.extensions = [...config.resolve.extensions, ".ts", ".js"]
        
        // Ensure proper module resolution for ES modules
        config.resolve.mainFields = ['browser', 'module', 'main']
        
        // Add specific handling for ES modules and CommonJS
        config.module.rules.push({
            test: /\.m?js$/,
            resolve: {
                fullySpecified: false,
            },
        });

        // Add specific handling for problematic packages
        config.module.rules.push({
            test: /node_modules\/(@erc7824\/nitrolite|zod|viem|abitype)/,
            type: 'javascript/auto',
        });
        
        // Ensure proper handling of node modules
        config.resolve.modules = ['node_modules', ...config.resolve.modules];

        // Add externals to prevent bundling issues
        config.externals = config.externals || {};
        
        config.plugins = [
            ...config.plugins,
            new webpack.ProvidePlugin({
                Buffer: ["buffer", "Buffer"],
            }),
            // Add DefinePlugin to ensure proper module resolution
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(env),
            }),
        ]

        // Ensure proper module resolution for packages with ES modules
        config.resolve.conditionNames = ['import', 'module', 'browser', 'default'];
    
        return config
}