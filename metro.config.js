const { getDefaultConfig } = require('@expo/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = exclusionList([
  /.*[\\\/]eas-inspect[\\\/]archive[\\\/].*$/,
  /__tests__\/.*/,
]);

// Metro older configs may use blacklistRE, so keep it for compatibility.
config.resolver.blacklistRE = config.resolver.blockList;

module.exports = config;
