import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dustan.hub',
  appName: 'Dustan Hub',
  webDir: 'dist',
  server: {
    url: 'https://dustan.lovable.app',
    cleartext: false
  },
  android: {
    allowMixedContent: false
  }
};

export default config;