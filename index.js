require("dotenv").config();
const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const cors = require("cors");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7clce.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const eventCollection = client.db(process.env.DB_NAME).collection("events");
  console.log("database connected", process.env.DB_NAME);

  app.post("/addEvent", (req, res) => {
    const event = req.body;
    eventCollection.insertOne(event).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/addEvents", (req, res) => {
    eventCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.use("/", (req, res) => {
    res.send("App is running");
  });

  app.listen(PORT, () => {
    console.log("server is running");
  });
});
