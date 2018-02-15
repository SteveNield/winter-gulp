var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    webpack = require('webpack'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean-css'),
    babel = require('babel-register'),
    Path = require('path'),
    bump = require('gulp-bump');

var paths = {
  apps: [],
  package: {
    file: 'package.json'
  },
  output: {
    dir: 'static',
    css: 'style.min.css'
  },
  sass: {
    entry: '',
    watch: []
  },
  js: {
    watch: [],
    test: [],
    integration: []
  }
}

function populatePaths(args){

  if(!args.root){
    throw new Error('args.root is required');
  }

  function resolvePaths(obj){
    // iterates through the object tree and resolves any strings it finds.
    if(Array.isArray(obj)){
      return obj.map(resolvePaths);
    } else if (typeof obj === 'object'){
      Object.keys(obj).map(function(key){
        obj[key] = resolvePaths(obj[key])
      });
      return obj;
    } else {
      return Path.resolve(args.root, obj);
    }
  }

  paths.apps = args.apps || paths.apps;
  if(args.package){
    paths.package.file = args.package.file || paths.package.file;
  }
  if(args.output){
    paths.output.dir = args.output.dir || paths.output.dir;
    paths.output.css = args.output.css || paths.output.css;
  }
  if(args.sass){
    paths.sass.entry = args.sass.entry || paths.sass.entry;
    paths.sass.watch = args.sass.watch || paths.sass.watch;
  }
  if(args.js){
    paths.js.watch = args.js.watch || paths.js.watch;
    paths.js.test = args.js.test || paths.js.test;
    paths.js.integration = args.js.integration || paths.js.integration;
  }

  paths = resolvePaths(paths);
}

module.exports = function(args){
  populatePaths(args);

  function build (watch, isProduction, callback) {
      var plugins = [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development')
        })
      ];

      if (isProduction) {
        plugins.push(new webpack.optimize.UglifyJsPlugin());
      }

      var bundleCount = 0;

      function finalise(){
        bundleCount ++;
        if(bundleCount === paths.apps.length){
          callback();
        }
      }

      paths.apps.map(function(app){
        webpack({
          plugins: plugins,
          cache: true,
          watch: watch,
          module: {
            loaders: [{
              test: /\.jsx?$/,
              exclude: /node_modules/,
              loader: 'babel-loader'
            }]
          },
          devtool: "#source-map",
          entry: app.entryPoint,
          output: {
            filename: Path.basename(app.destination),
            path: paths.output.dir
          }
        }, function (err, res) {
          if(err){
            console.log(err);
          }
          res.compilation.errors.map(console.log)
          finalise();
        });
      })

  }

  gulp.task('bump', function(){
    gulp.src(paths.package.file)
      .pipe(bump())
      .pipe(gulp.dest('./'));
  })

  gulp.task('bundle-all-production', ['bundle-js-production', 'bundle-css']);

  gulp.task('bundle-js-production', ['bump'], function (callback) {
    build(false, true, callback);
  });

  gulp.task('bundle-js-dev', function(callback){
    build(false, false, callback);
  })

  gulp.task('watch', function(){
    build(true, false);
  });

  gulp.task('bundle-css', function () {
    gulp
      .src(paths.sass.entry)
      .pipe(sass())
      .pipe(clean())
      .pipe(concat(paths.output.css))
      .pipe(gulp.dest(paths.output.dir));
  });

  gulp.task('watch-css', ['bundle-css'], function(){
    gulp.watch(paths.sass.watch, ['bundle-css']);
  });

  gulp.task('watch-client', ['bundle-js-dev'], function(){
    gulp.watch(paths.js.watch, ['bundle-js-dev']);
  })

  gulp.task('test-unit', function(){
    return gulp
      .src(paths.js.test, { read: false })
      .pipe(mocha({
        reporter: 'spec',
        timeout: 1000,
        compilers: {
          js: babel
        }
      }));
  })

  gulp.task('test-integration', function () {
    return gulp
      .src(paths.js.integration, { read: false })
      .pipe(mocha({
        reporter: 'spec',
        timeout: 2000,
        compilers: {
          js: babel
        }
      }));
  });

  return {
    paths: paths
  }
}
