import express from 'express'
import path from 'path'
import logger from 'morgan'
import sassMiddleware from 'node-sass-middleware'
import cookieParser from 'cookie-parser'

import publicIndexRouter from './routes/public.index'
import securedIndexRouter from './routes/secured.index'

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(cookieParser());

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(sassMiddleware({
  src: path.join(__dirname, '_public'),
  dest: path.join(__dirname, '_public'),
  indentedSyntax: true, // true = .sass and false = .scss
}))

app.use(express.static(path.join(__dirname, '_public')))

app.get('/robots.txt', function (req, res) {
  res.type('text/plain')
  res.send("User-agent: *\nDisallow: /")
})

app.use('/', publicIndexRouter)
app.use('/', securedIndexRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404)
  res.locals.error = {}
  res.render('pages/error', { status: "404", message: "The page was not found :(" })
})

// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('pages/error')
})

export default app
