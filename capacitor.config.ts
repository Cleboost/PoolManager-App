import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cleboost.poolmanager',
  appName: 'PoolManager',
  webDir: 'dist',
  server: {
    androidScheme: 'http'
  }
};

export default config;
