const express = require('express');
let app = express();

const { MongoClient, ServerApiVersion } = require('mongodb');

// variables
let debug_mode = false;
let _db;
const uri = "mongodb+srv://rob:1qaz2wsx3edc@cluster0.mur1c.mongodb.net/pixel_game";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });







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
// app.use('/pixel', require('./pixel.js'));

function setup() {
    MongoClient.connect(uri, (err, database) => {
      if(err) {
        return console.log(err);
      }
      // db = database;
      // start the express web server listening on 8080
      getDb()
      // app.listen(8080, () => {
      //   console.log('listening on 8080');
      // });
    });
  }
  
  setup()
  
  
  
  // serve the homepage
  app.get('/pixel', (req, res) => {
    res.sendFile('/index.html');
  });
  
  
  // Get chats from database
  app.get('/chat', async (req, res) => {
    const client = new MongoClient(uri);
    try {
      // Connect to the MongoDB cluster
      await client.connect();
      const database = client.db("pixel_game");
      const chat = database.collection("chat");
      let result = await chat.find({}).toArray()
      res.send(result);
    } catch (e) {
      console.error(e);
    } finally {
      await client.close();
    }
  });
  
  // Update grid information
  app.post('/chat', async (req, res) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', async () => {
      let json = JSON.parse(data);
      let payload = {
        _id: Date.now(),
        time: new Date(),
        msg: json["msg"],
        uuid: json["uuid"]
      }
      logger(JSON.stringify(payload));
      logger("Updating database");
      const grid = await getDbCollection("chat");
      await updateDbCollection(grid, payload, req, res);
  
    });
  });
  
  
  // <------ GRID CODE ------>
  // Get grid information
  app.get('/grid', async (req, res) => {
    try {
      const grid = await getDbCollection("grid")
      let result = await grid.find({}).toArray()
      res.send(result);
    } catch (e) {
      console.error(e);
    } finally {
      await client.close();
    }
  });
  
  // Update grid information
  app.post('/grid', async (req, res) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', async () => {
      let json = JSON.parse(data);
      let payload = {
        _id: json["_id"],
        color: json["color"],
        time: new Date(),
        uuid: json["uuid"]
      }
      logger(JSON.stringify(payload));
      logger("Updating database");
      const grid = await getDbCollection("grid");
      await updateDbCollection(grid, payload, req, res);
  
    });
  });
  
  // <------- HELPER FUNCTIONS ------->
  // This function will return a collection database object
  
  async function getDb() {
    if (!_db)
    {
      const client = new MongoClient(uri);
      await client.connect();
      _db = await client.db("pixel_game");
      logger(_db)
    }
    return _db;
  }
  
  
  async function getDbCollection(collection){
  
    const database = await getDb();
    return database.collection(collection);
  }
  
  // This function will update or create a new entry in a collection
  async function updateDbCollection(collection, payload, req, res){
    await collection.findOneAndUpdate({_id: payload._id},
        {"$set" : payload},
        {upsert: true},
        function (err,result) {
          if (err) {
            console.log(err); return res.sendStatus(500);
          } else {
            res.sendStatus(201)
          }
        });
  }
  
  // This function will print text to console if debugging mode is true
  function logger(str){
    if (debug_mode) {
      console.log("DEBUG: " + str);
    }
  }
  


let server = app.listen(8079, function () {});
