const express = require("express");
const https = require("https");
const path = require('path');
const dotenv = require("dotenv");
const { json, urlencoded } = require("express");

dotenv.config();

const app = express();
const publicPath = path.join(__dirname, 'public');

app.use(urlencoded({ extended: true }));
app.use(express.static(publicPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});



app.post("/failure", (req, res) => {
  res.redirect("/");
});

const handleSubscription = (req, res) => {
  console.log(req.body);
  const { firstName, lastName, email, confirmEmail } = req.body;

  if (email !== confirmEmail) {
    return res.sendFile(path.join(publicPath, 'failuare.html'));
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

  const request = https.request(url, options, (response) => {
    if (response.statusCode === 200) {
      res.sendFile(path.join(__dirname, "/success.html"));
    } else {
      res.sendFile(path.join(__dirname, "/failure.html"));
    }

    response.on("data", () => {});
  });

  request.write(jsonData);
  request.end();
};

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}`);
});
app.post("/", (req,res)=>handleSubscription(req,res));