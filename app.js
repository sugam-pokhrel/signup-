const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
app.use(cors())

const mongoose = require('mongoose');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
var cors = require('cors')

require("dotenv").config();

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

//
//

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/", function (req, res) {
  const { firstName, lastName, email, confirmEmail } = req.body;

  if (email !== confirmEmail) {
    res.sendFile(__dirname + "/failuare.html");
  }

  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };

  const jsonData = JSON.stringify(data);
  const listId = "454a4bf446";
  const url = `https://us10.api.mailchimp.com/3.0/lists/${listId}`;
  const options = {
    method: "POST",
    auth: `YangSing:${process.env.api}`,
  };

  const request = https.request(url, options, function (response) {
    if (response.statusCode === 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failuare.html");
    }

    response.on("data", function (data) {});
  });

  request.write(jsonData);
  request.end();
});

app.post("/failuare", function (req, res) {
  res.redirect("/");
});


// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://sugamf7:yunisha123@pyauto.hkt89gc.mongodb.net/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});

// Define a mongoose schema for notices
const noticeSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
});
const Notice = mongoose.model('Notice', noticeSchema);

// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST endpoint to save a notice with image
app.post('/notices', async (req, res) => {
  try {
   
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    
    const formData = new FormData();
    formData.append('image', req.file.buffer.toString('base64'));
    const imgbbResponse = await axios.post('https://api.imgbb.com/1/upload?key=a411ad4e427132ef4f1c461965031b2c', formData, {
      headers: formData.getHeaders(),
    });
    const imageUrl = imgbbResponse.data.data.url;
    console.log('Image uploaded to imgbb:', imageUrl)

    // Create notice document
    const notice = new Notice({
      title: req.body.title,
      desc: req.body.description,
      imageUrl: req.body.image,
    });

    // Save notice to MongoDB
    await notice.save();
    console.log('Notice saved to MongoDB:', notice)

    res.status(201).json({ message: 'Notice saved successfully', notice });
  } catch (error) {
    console.error('Error saving notice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/golden', async (req, res) => {
  res.json({ message: 'Golden API' });
}
);


app.listen(process.env.PORT || 3000, function () {
  console.log("Listening at port 3000");
});
