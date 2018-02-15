var winterGulp = require('./index');

winterGulp({
  root: __dirname,
  apps: [{
    entryPoint: './test-project/App.jsx',
    destination: 'app.min.js'
  }],
  output: {
    dir: 'public'
  }
})
