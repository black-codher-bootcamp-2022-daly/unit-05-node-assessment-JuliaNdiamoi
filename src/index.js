require("dotenv").config();
const fs = require("fs");
const express = require("express");
const app = express();
const path = require("path");
const port = 8080;
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const { json } = require("express");
const todoFilePath = process.env.BASE_JSON_PATH;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.raw());
app.use(bodyParser.json());

app.use("/content", express.static(path.join(__dirname, "public")));

app.get("/", (_, res) => {
  res.sendFile("./public/index.html", { root: __dirname });
});

app.get("/todos", (_, res) => {
  res.header("Content-Type", "application/json");
  res.sendFile(todoFilePath, { root: __dirname });
});

app.get("/todos/completed", (_, res) => {
  res.header("Content-Type", "application/json");

  const profile = JSON.parse(
    fs.readFileSync(path.join(__dirname, "models/todos.json"))
  );

  const completedItems = profile.filter((el) => el.completed == true);

  res.send(completedItems);
});

app.get("/todos/overdue", (_, res) => {
  res.header("Content-Type", "application/json");

  const currentDate = Date.now();

  const profile = JSON.parse(
    fs.readFileSync(path.join(__dirname, "models/todos.json"))
  );

  const overdueItems = profile.filter((el) => new Date(el.due) < currentDate);

  res.send(overdueItems);
});

app.get("/todos/:id", (_, res) => {
  res.header("Content-Type", "application/json");

  const profile = JSON.parse(
    fs.readFileSync(path.join(__dirname, "models/todos.json"))
  );

  const id = _.params.id;

  const item = profile.find((el) => el.id === id);

  res.send(item);
});

app.post("/todos", (_, res) => {

  const profile = JSON.parse(fs.readFileSync(path.join(__dirname, "models/todos.json")));

  const body = _.body;

  profile.splice(0, 0, body);
  
  fs.writeFile((path.join(__dirname, "models/todos.json")), JSON.stringify(profile), (err) => {

    if (err) {

      const message = "Unable to update. Couldn't write to file";
      res.status(500).send(message);

    } else {

      const message = "Profile updated";
      res.status(200).send(message);
    }

  });

});

app.patch("/todos/:id", (req, res) =>{

  
  const profile = JSON.parse(fs.readFileSync(path.join(__dirname, "models/todos.json")));
  
  const id = req.params.id;

  const item = profile.find((el) => el.id === id);

  item.due = req.body.due;
  item.name = req.body.name;

  fs.writeFile((path.join(__dirname, "models/todos.json")), JSON.stringify(profile), (err) => {

    if (err) {

      const message = "Unable to update. Couldn't write to file";
      res.status(500).send(message);

    } else {

      const message = "Profile updated";
      res.status(200).send(message);
    }

  });

})



//Add GET request with path '/todos/overdue'

//Add GET request with path '/todos/completed'

//Add POST request with path '/todos'

//Add PATCH request with path '/todos/:id

//Add POST request with path '/todos/:id/complete

//Add POST request with path '/todos/:id/undo

//Add DELETE request with path '/todos/:id

module.exports = app;
