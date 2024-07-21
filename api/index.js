var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const cors = require('cors')

var usersRouter = require('../routes/user');

var app = express();

require('../helpers/dbConnect')()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())

app.use('/user-log', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use((error, req, res, next) => {
  if (typeof error.handle === 'function') {
    error.handle();
  }

  if (error.printMsg === undefined) {
    error.stack += ` [Path: ${req.path}]`;
    console.error(error);
  }

  res.status(error.statusCode || 500).json({
    code: error.statusCode || 500,
    msg: error.printMsg || 'Something went wrong!',
    errorCode: error.errorCode,
  });
});



module.exports = app;
