export default {
  entry: './src/content-script.js',
  output: {
    filename: 'content-script.js',
    path: new URL('./dist', import.meta.url).pathname,
  },
  mode: 'production',
};