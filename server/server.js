#!/usr/bin/env node
var port = process.env.PORT || 3000

// dependencies
var express = require('express')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var expressSession = require('express-session')
var mongoose = require('mongoose')
var hash = require('bcrypt-nodejs')
var path = require('path')
var passport = require('passport')
var passportConfig = require('./config/passport.js')
var dotenv = require('dotenv').load({silent: true})


// mongoose
var mongoConnectionString = process.env.MONGO_URL

mongoose.connect(process.env.MONGO_URL, function(err){
  	if(err) return console.log('Cannot connect to Mongo')
  	console.log('Connected to MongoDB. Hell Yeah!')
})

// user schema/model
var User = require('./models/User.js')

// create instance of express
var app = express()

// require routes
var routes = require('./routes/api.js')
var userRoutes = require('./routes/users.js')

// define middleware
app.use(express.static(path.join(__dirname, '../client')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static(path.join(__dirname, 'public')))

// //this will add a currentUser to be available in every view
// app.use(function(req,res,next){
//   if(req.user) req.app.locals.currentUser = req.user
//   req.app.locals.loggedIn = !!req.user
//   next()
// })

// routes
app.use('/user/', routes)
app.use('/api', userRoutes)

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../client', 'index.html'))
})

// error hndlers
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use(function(err, req, res) {
  res.status(err.status || 500)
  res.end(JSON.stringify({
    message: err.message,
    error: {}
  }))
})

app.listen(port, function() {
  console.log("Listening for requests on port:", port)
})
