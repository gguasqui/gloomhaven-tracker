const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// En web, reemplazar react-native-sse con un módulo vacío
config.resolver = config.resolver || {};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-sse/eventsource') {
    return { type: 'empty' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
