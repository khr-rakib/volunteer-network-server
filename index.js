require("dotenv").config();
const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const { cloudinary } = require("./utils/cloudinary");
const { ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7clce.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const eventCollection = client.db(process.env.DB_NAME).collection("events");
  const volunteerCollection = client
    .db(process.env.DB_NAM)
    .collection("volunteers");
  console.log("database connected", process.env.DB_NAME);

  // register a new volunteer
  app.post("/registerVolunteer", async (req, res) => {
    await volunteerCollection
      .insertOne(req.body)
      .then((result) => res.send(result.insertedCount > 0));
  });

  // get loggedIn volunteer events
  app.get("/loggedInVolunteer", (req, res) => {
    volunteerCollection
      .find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  // delete loggedIn volunteer events
  app.delete("/loggedInVolunteer", (req, res) => {
    volunteerCollection
      .findOneAndDelete({ _id: ObjectId(req.body.id) })
      .then((result) => res.send({ msg: "deleted" }));
  });

  // add new event
  app.post("/addEvent", async (req, res) => {
    try {
      const fileStr = req.body.banner;
      const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
        upload_preset: "volunteer",
      });

      let bannerURL = uploadedResponse.url;

      let { name, date, description } = req.body.event;

      const newObj = {
        name,
        date,
        description,
        bannerURL,
      };

      await eventCollection.insertOne(newObj).then((result) => {
        res.send(result.insertedCount > 0);
      });
    } catch (error) {
      res.status(500).send({ err: "not uploaded" });
    }
  });

  // get single event
  app.get("/singleEvent/:_id", (req, res) => {
    eventCollection
      .find({ _id: ObjectId(req.params._id) })
      .toArray((err, document) => {
        res.send(document);
      });
  });

  // get all events
  app.get("/getAllEvents", (req, res) => {
    eventCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // get volunteers list
  app.get("/volunteersList", (req, res) => {
    volunteerCollection.find({}).toArray((err, documents) => {
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
