const express = require('express');
let app = express();

/* Use EJS for templates (in the "views" folder) */
app.set('view engine', 'ejs');

/* Enable session data for all connections to this site */
const session = require('express-session');
const MongoStore = require('connect-mongo');
const sess_uri = process.env.ATLAS_SESSION_URI;

app.use(session({ secret: 'fnord',
                  store: MongoStore.create({ mongoUrl: sess_uri }),
                  resave: false,
                  saveUninitialized: false,
                  cookie: { maxAge: 24*60*60*1000 }}))


/* Assuming all our pages are dynamically generated, this tells browsers not to cache anything.  */
app.use(function (req,res,next) {
    res.set('Cache-Control','no-store');
    next();
    });

/* Use body-parser for any input forms on the site */
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));

/* This allows static files in the "public" folder to be served when running this app via the command-line, rather than via Passenger */
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));


const makeHTMLPage = require('./makehtml.js').makeHTMLPage;

function homepage(req, res) {
    res.send(makeHTMLPage('<p>Hello World, from express</p>'));
    }
app.get('/', homepage);


/*
const rps = require('./rps.js');
app.get('/rps/:choice', rps.RPSChoice);

const miniblog = require('./miniblog.js');
app.get('/blog', miniblog.Blog);
app.post('/blogpost', miniblog.BlogPost);

app.use('/', require('./todo.js'));

app.use('/', require('./mymongo3.js'));

app.use('/', require('./cookies.js'));
*/
// app.use('/', require('./todolist.js'));
app.use('/', require('./social.js'));
app.use('/data', require('./data.js'));
app.use('/server', require('./ajaxserver.js'));
app.use('/pixel', require('./pixel.js'));

let server = app.listen(8079, function () {});
