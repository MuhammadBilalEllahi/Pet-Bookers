/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  // resolver: {
  //   alias: {
  //     'debugger-ui': path.resolve(
  //       __dirname,
  //       'node_modules/@react-native-community/cli-debugger-ui/build/ui',
  //     ),
  //   },
  // },
};
