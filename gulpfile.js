const postcss = require('gulp-postcss')
const gulp = require('gulp')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const stylus = require('gulp-stylus')
const rename = require("gulp-rename")
const sourcemaps = require('gulp-sourcemaps')
// const pxtorem = require('postcss-pxtorem')
const fs = require('fs')
const path = require('path')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const uglify = require('uglify-js')
const zlib = require('zlib')
const json = require('rollup-plugin-json')
const header = require('gulp-header')
const version = require('./package').version

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

function resolve(p) {
  return path.resolve(__dirname, './', p)
}

const banner =
  '/*!\n' +
  ' * vue-range-slider v' + version + '\n' +
  ' * (c) 2016-' + new Date().getFullYear() + ' xwpongithub\n' +
  ' * Released under the MIT License.\n' +
  ' */\n'

const builds = [{
  input: resolve('src/index.js'),
  output: {
    name: 'VueRangeSlider',
    file: resolve('dist/vue-range-slider.js'),
    format: 'umd',
    banner
  },
  plugins: [
    json(),
    babel({
      exclude: 'node_modules/**'
    }),
  ]
}, {
  input: resolve('src/index.js'),
  output: {
    name: 'VueRangeSlider',
    file: resolve('dist/vue-range-slider.esm.js'),
    format: 'es',
    banner
  },
  plugins: [
    json(),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
  ],
}, {
  input: resolve('src/index.js'),
  output: {
    name: 'VueRangeSlider',
    file: resolve('dist/vue-range-slider.min.js'),
    format: 'umd',
    banner
  },
  plugins: [
    json(),
    babel({
      exclude: 'node_modules/**'
    })
  ]
}]

function build(builds) {
  return new Promise((resolve, reject) => {
    let built = 0
    const total = builds.length
    const next = () => {
      buildEntry(builds[built]).then(() => {
        built++
        if (built < total) {
          next()
        } else {
          resolve()
        }
      }).catch(e => {
        reject(e)
        logError(e)
      })
    }
    next()
  })
}

function buildEntry(config) {
  const isProd = /min\.js$/.test(config.output.file)
  return rollup.rollup(config).then((bundle) => {
    bundle.generate(config).then(gen => {
      let code = gen.code
      if (isProd) {
        let minified = (config.banner ? config.banner + '\n' : '') + uglify.minify(code, {
          output: {
            ascii_only: true,
            comments: /^!/
          },
          compress: {
            drop_debugger: true,
            drop_console: true
          }
        }).code
        return write(config.output.file, minified, true)
      } else {
        return write(config.output.file, code)
      }
    }).catch(logError)
  }).catch(logError)
}

function write(dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report(extra) {
      console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''))
      resolve()
    }

    fs.writeFile(dest, code, (err) => {
      if (err) {
        return reject(err)
      }
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err)
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report()
      }
    })
  })
}

function getSize(code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function blue(str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}

function logError(e) {
  console.log(e)
}

gulp.task('js', async () => await build(builds))


gulp.task('css', () => {
  return gulp.src('./src/styl/vue-range-slider.styl')
    .pipe(sourcemaps.init())
    .pipe(stylus())
    .pipe(postcss([
      // pxtorem({
      //   rootValue: 16,
      //   unitPrecision: 37.5,
      //   propList: ['*']
      // }),
      autoprefixer()
    ]))
    .pipe(header('/**\n' +
      ' * vue-range-slider v' + version + '\n' +
      ' * (c) 2016-' + new Date().getFullYear() + ' xwpongithub\n' +
      ' * Released under the MIT License.\n' +
      ' */\n'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist')).on('end', () => {
       gulp.src('./dist/vue-range-slider.css')
         .pipe(sourcemaps.init())
        .pipe(postcss([cssnano()]))
        .pipe(rename("vue-range-slider.min.css"))
         .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist')).on('end', () => {
          const now = new Date()
          console.log(`[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}] Compress css finished`)
        })
    })
})

gulp.task('default', ['js', 'css'])
