const gulp = require("gulp");
const plugins = require("gulp-load-plugins")();
const del = require('del');
const browserSync = require('browser-sync');
const px2rem = require('postcss-px2rem');
const pngquant = require('imagemin-pngquant');
const autoprefixer = require('autoprefixer');
const pxtorem = require('postcss-pxtorem');
const jsFile = 'src/skin/js/**/*.js'; //javascript代码存放路径
const jsOutPut = 'dist/skin/js'; //指定输出文件存放目录

// del dist
gulp.task('clean', function (cb) {
  del.sync(['dist/**'])
  cb()
});
//copy file
gulp.task('copy',function (cb) {
  gulp.src(['src/skin/**/*.*','!src/skin/css/**/*.*','!src/skin/js/**/*.*'])
   .pipe(plugins.cached('cb'))
   .pipe(gulp.dest('dist/skin/'))
})
//css
gulp.task('css', function (cb) {
 return  gulp.src('src/skin/css/**/*.*')
   .pipe(plugins.cached('less'))
   .pipe(plugins.less().on('error',plugins.util.log))
   .pipe(plugins.postcss([
     autoprefixer(),
     pxtorem({
       rootValue: 75,
       unitPrecision: 5,
       propWhiteList: ['*','!font-size'],
       propBlackList: [],
       exclude:false,
       selectorBlackList: [],
       ignoreIdentifier: false,
       replace: true,
       mediaQuery: false,
       minPixelValue: 0
     })
   ]))
  .pipe(gulp.dest('dev/skin/css'))
  .pipe(plugins.concat('main.css'))
  .pipe(plugins.cleanCss({keepSpecialComments: '*'}))
  .pipe(plugins.rename({suffix:'.min'}))
   .pipe(gulp.dest('dist/skin/css/'))
  //cb()
})
//js
gulp.task('js',function (cb) {
  const min =plugins.filter(['**','!src/skin/js/*.min.js','!src/skin/js/layer/**/*.*'], {restore: true})
  gulp.src('src/skin/js/**/*.js')
   .pipe(min)
   .pipe(plugins.babel({
     presets: ['@babel/preset-env']
   }))
   .pipe(plugins.order([
     'base.js',
     'app.js',
     '*.js',
     'a.js'
   ])) // 指定次序合并
   .pipe(plugins.concat('all.js'))
   .pipe(plugins.cached('uglify'))
   .pipe(plugins.uglify().on('error',plugins.util.log)) // 注意这里的报错事件
   .pipe(plugins.rename({
     dirname: "./",  // 文件存放目录
     basename: "all",         //  文件中部名称
     prefix: "index-",       //   文件头部名称
     suffix: ".min",         //    文件尾部名称
     extname: ".js"          //     文件扩展名
   }))
   .pipe(min.restore)
   .pipe(gulp.dest('./dist/skin/js'))
  cb()
})

//html file
gulp.task('file', function(cb) {
  gulp.src(['src/pages/**/*.html', '!src/pages/include/**.html'])
   .pipe(plugins.fileInclude({
     prefix: '@@',
     basepath: '@file'
   }))
   .pipe(gulp.dest('dist/'))
  cb()
});

gulp.task('html', gulp.series('file', function() {
  gulp.watch('src/**/*.html', gulp.series('file'));
}));


gulp.task('img', function() {
  return gulp.src('src/skin/images/**/*')
   .pipe(plugins.cache(plugins.imagemin({
     interlaced: true,
     progressive: true,
     svgoPlugins: [{removeViewBox: false}],
     use: [pngquant()]
   })))
   .pipe(gulp.dest('dist/skin/images/'));
});

// change 更改
gulp.task('change',function () {
  gulp.watch('src/skin/css/**/*.*',gulp.parallel('css'));
  gulp.watch('src/skin/js/**/*.js',gulp.parallel('js'));
  gulp.watch(['src/skin/**/*.*','!src/skin/css/**/*.*','!src/skin/js/**/*.*'],gulp.parallel('copy'));
} )
gulp.task('clear', function (callback) {
  return plugins.cache.clearAll();
})
//server
gulp.task('browser-sync', function() {
  browserSync({
    files: "./",
    server: {
      baseDir: "./dist/",
/*      proxy: {
        target: "",
        proxyReq: [
          function(proxyReq,proxyRes,req, res) {
            proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
            console.log(proxyRes.headers);
          }
        ]
      }*/
    },
    notify: false //关闭通知
  });
});
// 直接运用 gulp 执行默认任务
/*gulp.task('default', gulp.series(
 'clean',
 gulp.parallel('copy','css','js','html','change','browser-sync'),
 function (cb) {
   cb();
 }
 )
)*/

gulp.task('dev', gulp.parallel('copy','css','js','html','change','browser-sync'));

