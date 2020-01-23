module.exports = {
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-export-default-from',
    [
      'module-resolver',
      {
        alias: {
          '#root': './src',
          '#events': './src/Events',
          '#services': './src/Services',
          '#hassEvents': './src/Events/HassEvents',
          '#timeEvents': './src/Events/TimeEvents',
          '#tasks': './src/Tasks',
        },
      },
    ],
  ],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
};
