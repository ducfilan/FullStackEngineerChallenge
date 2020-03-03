import {
  src,
  dest,
  watch,
  series
} from 'gulp'
import browserify from 'browserify'
import path from 'path'
import del from 'del'
import gulpLoadPlugins from 'gulp-load-plugins'

const plugins = gulpLoadPlugins()

const toCamel = s => {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
}

function js() {
  return src([
    'src/content-scripts/app.js'
  ], {
    read: false,
    base: 'src/content-scripts'
  })
    .pipe(plugins.cached('js'))
    .pipe(plugins.tap(function (file) {
      file.contents = browserify(file.path, {
        debug: true
      })
        .transform('babelify', {
          presets: ['@babel/preset-env']
        })
        .bundle()
    }))
    .pipe(plugins.buffer())
    .pipe(dest('src/_public/javascripts'))
}

function dynamicInjectTemplates() {
  return src([
    'src/views/_global/components/**/*.pug'
  ], {
    base: 'src/views/_global/components'
  })
    .pipe(plugins.plumber())
    .pipe(plugins.flatmap(function (stream, file) {
      var fileName = path.basename(file.path);
      fileName = toCamel(fileName.split('.')[0])

      return stream
        .pipe(plugins.pug({
          client: true,
          name: fileName,
          compileDebug: false,
          verbose: false
        }))
        .pipe(plugins.footer(`export default ${fileName};`));
    }))
    .pipe(dest('src/content-scripts/_generated-components'))
}

function cleanDynamicInjectTemplates() {
  return del([
    'src/content-scripts/_generated-components/**/*.js',
  ]);
}

function watchFiles() {
  watch([
    'src/content-scripts/**/*.js',
    'src/views/_global/components/**/*.pug',
    '!src/content-scripts/_generated-components/**/*.js',
  ], series(dynamicInjectTemplates, js, cleanDynamicInjectTemplates))
}

exports.watch = watchFiles
exports.default = series(dynamicInjectTemplates, js, cleanDynamicInjectTemplates)
