var winterGulp = require('./index'),
    chai = require('chai');

const should = chai.should();

describe('winter-gulp', function(){
  describe('path resolution', function(){

    describe('when root is missing', function(){
      it('throws an appropriate error', function(done){
        try{
          winterGulp({})
          done('Error expected, none thrown');
        } catch(err){
          err.toString().should.equal('Error: args.root is required');
          done();
        }
      })
    })

    describe('when all paths are provided', function(){
      it('correctly resolves all paths to absolute', function(){
        const root = 'c:\\a\\b';
        const config = {
          root: root,
          apps: [{
            entryPoint: 'client/js/App.jsx',
            destination: 'app.min.js'
          }],
          package: {
            file: 'a/b/c/package.json',
          },
          output: {
            dir: 'public',
            css: 'thestyleofthetimes.css'
          },
          sass: {
            entry: 'client/scss/main.scss',
            watch: ['client/scss/*.scss']
          },
          js: {
            watch: [
              'client/js/**/*.jsx',
              'client/js/**/*.js',
              'lib/**/*.js'
            ],
            test: [
              './test/components/*-spec.js',
              './test/client/*-spec.js',
              './test/server/*-spec.js'
            ],
            integration: ['./test/routes/*-spec.js']
          }
        };
        const expectedPaths = {
          apps: [{
            entryPoint: 'c:\\a\\b\\client\\js\\App.jsx',
            destination: 'c:\\a\\b\\app.min.js'
          }],
          package: {
            file: 'c:\\a\\b\\a\\b\\c\\package.json',
          },
          output: {
            dir: 'c:\\a\\b\\public',
            css: 'c:\\a\\b\\thestyleofthetimes.css'
          },
          sass: {
            entry: 'c:\\a\\b\\client\\scss\\main.scss',
            watch: ['c:\\a\\b\\client\\scss\\*.scss']
          },
          js: {
            watch: [
              'c:\\a\\b\\client\\js\\**\\*.jsx',
              'c:\\a\\b\\client\\js\\**\\*.js',
              'c:\\a\\b\\lib\\**\\*.js'
            ],
            test: [
              'c:\\a\\b\\test\\components\\*-spec.js',
              'c:\\a\\b\\test\\client\\*-spec.js',
              'c:\\a\\b\\test\\server\\*-spec.js'
            ],
            integration: ['c:\\a\\b\\test\\routes\\*-spec.js']
          }
        };

        winterGulp(config).paths.should.deep.equal(expectedPaths);
      })
    })
  })
})
