const mongoose = require('mongoose');
require('./config/db');

const express = require('express');
const routes = require('./routes/index');
const exphbs = require('express-handlebars');
const path = require('path');
const cookieParse = require('cookie-parser');
const expSession = require('express-session');
const MongoStore = require('connect-mongo')(expSession);
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const createError = require('http-errors');
const flash = require('connect-flash');
const passport = require('./config/passport');


require('dotenv').config({ path: 'variables.env' });

const host = '0.0.0.0';
const port = process.env.PORT  || process.env.MY_PORT;
/* const port = process.env.PORT  || process.env.MY_PORT; */

const app = express();

/* habilitar body parser */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* validación de campos */
app.use(expressValidator());

/* habilitar handlebars como view engine */
app.engine('handlebars',
    exphbs({
        defaultLayout: 'layout',
        helpers: require('./helpers/handlebars')

    })
);

app.set('view engine', 'handlebars');

/* static files */
app.use(express.static(path.join(__dirname + '/public')));

/* trix static files*/
app.use('/trix', express.static(__dirname + '/node_modules/trix/dist/'));

/* sessions & cookies */
app.use(cookieParse());

app.use(expSession({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

/* inicializar passport */
app.use(passport.initialize());
app.use(passport.session());

/* alertas  y flash messages */
app.use(flash());

/* crear nuestro middleware */
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

app.use('/', routes());

/* 404 not found */
app.use((req, res, next) => {
    next(createError(404, 'Página no encontrada'));
});

/* admin errors */
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    const status = err.status || 500;
    res.locals.status = status;
    res.status(status);
    res.render('error');
});

app.listen(port, host, () => {
    console.log('Server works at port: ', port);
});