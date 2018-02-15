var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    webpack = require('webpack'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean-css'),
    babel = require('babel-register'),
    path = require('path'),
    bump = require('gulp-bump');

const paths = {
  package: {
    file: 'package.json'
  },
  output: {
    dir: 'public',
  },
  sass: {
    entry: './test-project/test.scss',
    watch: [
      './test-project/*.scss'
    ],
    output: 'style.min.css'
  },
  js: {
    apps: [{
      entry: './test-project/App.jsx',
      output: 'app.min.js'
    }],
    watch: [
      './test-project/*.jsx'
    ],
    test: [
      './test-project/*-test.js'
    ],
    integration: []
  }
}

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
      if(bundleCount === paths.js.apps.length){
        callback();
      }
    }

    paths.js.apps.map(function(app){
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
        entry: path.resolve(__dirname, app.entry),
        output: {
          filename: app.output,
          path: path.resolve(__dirname, paths.output.dir)
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
    .pipe(concat(paths.sass.output))
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
