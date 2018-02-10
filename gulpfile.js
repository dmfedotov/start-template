const gulp         = require('gulp');
const del          = require('del');
const browserSync  = require('browser-sync').create();
const pug          = require('gulp-pug');
const autoprefixer = require('gulp-autoprefixer');
const svgSprite    = require('gulp-svg-sprites');
const svgmin       = require('gulp-svgmin');
const cheerio      = require('gulp-cheerio');
const replace      = require('gulp-replace');
const plumber      = require("gulp-plumber");
const notify       = require("gulp-notify")
const spritesmith  = require("gulp.spritesmith")
const sass         = require('gulp-sass');
const rename       = require('gulp-rename');
const sourcemaps   = require('gulp-sourcemaps');

// Пути
const paths = {
  root: './docs',
  styles: {
    src: 'src/styles/**/*.scss',
    dest: 'docs/assets/styles/'
  },
  scripts: {
    src: 'src/scripts/**/*.js',
    dest: 'docs/assets/scripts/'
  },
  templates: {
    src: 'src/templates/',
    dest: 'docs/assets/'
  },
  images: {
    src: 'src/images/**/*.{jpg,svg,png}',
    dest: 'docs/assets/images/'
  },
  icons: {
    src: 'src/images/icons/*.png',
    dest: 'src/images/icons/'
  },
  fonts: {
    src: 'src/fonts/**/*.*',
    dest: 'docs/assets/fonts/'
  }
};

// PUG-HTML
function html() {
  return gulp.src(paths.templates.src + "pages/*.pug")
    .pipe(plumber({
      errorHandler: notify.onError(function (err) {
        return {title: "Html", message: err.message}
      })
    }))
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest(paths.root));
}

// Styles
function styles() {
  return gulp.src('./src/styles/app.scss')
    .pipe(plumber({
      errorHandler: notify.onError(function (err) {
        return {title: "Style", message: err.message}
      })
    }))
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    // .pipe(sourcemaps.write({includeContent: false}))
    // .pipe(sourcemaps.init({loadMaps: true}))
    // .pipe(autoprefixer({
    //   browsers: ['last 2 versions'],
    //   cascade: false
    // }))
    .pipe(sourcemaps.write())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.styles.dest))
}

// Перенос картинок
function images() {
  return gulp.src(paths.images.src)
    .pipe(gulp.dest(paths.images.dest));
}

// Перенос шрифтов
function fonts() {
  return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dest));
}

// Перенос скриптов
function scripts() {
  return gulp.src(paths.scripts.src)
    .pipe(gulp.dest(paths.scripts.dest));
}

// Очистка папки docs
function clean() {
  return del(paths.root);
}

// Следим за src и запускаем нужные таски
function watch() {
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.templates.src, html);
  gulp.watch(paths.images.src, images);
  gulp.watch(paths.fonts.src, fonts);
}

// BrowserSync
function server() {
  browserSync.init({
    server: paths.root,
    reloadDelay: 200
  });
  browserSync.watch(paths.root + '/**/*.{html,css}', browserSync.reload);
}

// SVG спрайт
function sprite() {
  return gulp.src(paths.icons.src)
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      },
      parserOptions: {
        xmlMode: true
      }
    }))
    .pipe(replace('&gt;', '>'))
    .pipe(svgSprite({
      mode: "symbols",
      svg: {
        symbols: 'sprite.svg'
      }
    }))
    .pipe(gulp.dest(paths.icons.dest));
}

// PNG спрайт
function pngSprite() {
  return gulp.src(paths.icons.src)
    .pipe(spritesmith({
      imgName: 'sprite.png',
      cssName: 'sprite.css',
      padding: 2,
      algorithm: 'top-down'
    }))
    .pipe(gulp.dest(paths.icons.dest));
}

// экспорт функций для доступа из терминала
exports.clean     = clean;
exports.styles    = styles;
exports.scripts   = scripts;
exports.html      = html;
exports.images    = images;
exports.watch     = watch;
exports.server    = server;
exports.fonts     = fonts;
exports.sprite    = sprite;
exports.pngSprite = pngSprite;

// Сборка проекта и слежка
gulp.task('default', gulp.series(
  clean,
  gulp.parallel(styles, html, images, fonts, scripts),
  gulp.parallel(watch, server)
));