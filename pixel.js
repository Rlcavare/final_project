// Connection URI
const uri = "mongodb+srv://rob:1qaz2wsx3edc@cluster0.mur1c.mongodb.net/sample_mflix?retryWrites=true&w=majority"

console.log('Server-side code running');

const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const app = express();
app.use(express.static('public'));
let db;

MongoClient.connect(uri, (err, database) => {
  if(err) {
    return console.log(err);
  }
  db = database;
  // start the express web server listening on 8080
  app.listen(8080, () => {
    console.log('listening on 8080');
  });
});

// serve the homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
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


// Get chats from database
app.get('/grid', async (req, res) => {
  const client = new MongoClient(uri);
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    const database = client.db("pixel_game");
    const grid = database.collection("grid");
    let result = await grid.find({}).toArray()
    res.send(result);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
});

// Get chats from database
app.post('/grid', async (req, res) => {
  // req.on('data', chunk => {
  //   console.log(`Data chunk available: ${chunk}`);
  //   console.log(chunk["time"])
  //   console.log(chunk.time)
  //   let payload = {
  //     _id: chunk._id,
  //     color: chunk.color,
  //     time: new Date(),
  //     uuid: "NOUUID"
  //   }
  //
  //   console.log(payload)
  // });

  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    console.log(JSON.parse(data));
    res.end();
  });

  // console.log(res.body)
  // const client = new MongoClient(uri);
  // try {
  //   // Connect to the MongoDB cluster
  //   await client.connect();
  //   const database = client.db("pixel_game");
  //   const grid = database.collection("grid");
  //   grid.save({"dfd": "Sdfds"}, (err, result) => {
  //     if (err) {
  //       return console.log(err);
  //     }
  //     console.log('click added to db');
  //     res.sendStatus(201);
  //   });
  //   // let result = await grid.find({}).toArray()
  //   res.send(result);
  // } catch (e) {
  //   console.error(e);
  // } finally {
  //   await client.close();
  // }
});


// const click = {clickTime: new Date()};
// console.log(click);
// console.log(db);
//
// db.collection('clicks').save(click, (err, result) => {
//   if (err) {
//     return console.log(err);
//   }
//   console.log('click added to db');
//   res.sendStatus(201);
// });
// });



let router = express.Router();
module.exports = router;