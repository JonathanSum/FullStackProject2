const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const expressValidator = require('express-validator');
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport');
const config = require('./config/database')


//init libraries
mongoose.Promise = global.Promise;
var promise = mongoose.connect((config.database), {
  useMongoClient: true,
});
let db = mongoose.connection;
// mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://10.7.0.3:27107/data/db');

//Check connection
db.once('open', function() {
  console.log('Connected to MongoDB')
})

//Check for DB errors
db.on('error', function(err) {
  console.log(err)
})

//init app
const app = express();

//Bring in Models
let Article = require('./models/article')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: true
}))


// parse application/json
app.use(bodyParser.json())


//Set Public Folder
app.use(express.static(path.join(__dirname, 'public')))

//Express Session MiddleWare
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: {}
}))

//EXpress Message Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

//Passport config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get('*',function(req,res,next){
  res.locals.user= req.user || null
  next();
})

// load View Engine
// let Article = require('../models/article')
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// Home Route
app.get('/', function(req, res) {
  Article.find({}, function(err, articles) {
    if (err) {
      console.log(err);
    } else {
      res.render('index', {
        title: "Blog",
        articles: articles
      })
    }
  })
})
//contact
app.get('/contact',function(req,res){
  res.render('contact',)
})





//Route Files
let articles = require('./routes/articles');
// let users = require('.routes/users');
let users = require('./routes/users');
app.use('/users', users)
app.use('/articles', articles)

// Start Server
app.listen(3000, function(req, res) {
  console.log("it is on 3000 now")

})
