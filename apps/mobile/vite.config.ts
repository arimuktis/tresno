import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const extensions = [
  '.web.tsx',
  '.web.ts',
  '.web.jsx',
  '.web.js',
  '.tsx',
  '.ts',
  '.jsx',
  '.js',
];

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  return {
    plugins: [react()],
    define: {
      global: 'window',
      __DEV__: isDev,
      'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
    },
    resolve: {
      alias: [
        { find: '@tresno/shared', replacement: path.resolve(__dirname, '../../packages/shared/src/index.ts') },
        { find: /^react-native$/, replacement: 'react-native-web' },
        { find: /^react-native-agora$/, replacement: 'react-native-web' },
        { find: /^react-native\/Libraries\/Utilities\/codegenNativeComponent/, replacement: path.resolve(__dirname, 'src/shims/codegenNativeComponent.ts') },
        { find: /^react-native\/(.*)/, replacement: 'react-native-web/dist/$1' },
        { find: /^lucide-react-native$/, replacement: 'lucide-react' },
      ],
      extensions,
    },
    optimizeDeps: {
      include: ['react-native-web'],
      exclude: ['react-native', 'react-native-safe-area-context'],
      esbuildOptions: {
        resolveExtensions: extensions,
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
  };
});

