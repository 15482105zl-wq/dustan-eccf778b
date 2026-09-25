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
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      showSpinner: false
    }
  }
};

export default config;