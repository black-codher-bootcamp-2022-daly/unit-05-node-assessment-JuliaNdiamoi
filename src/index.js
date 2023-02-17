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
const profile = JSON.parse(fs.readFileSync(path.join(__dirname, "models/todos.json")));

const findElementById = (id) => { return profile.find((el) => el.id === id) }

const checkIfUpdateSuccessful = (res) => {

  fs.writeFile((path.join(__dirname, "models/todos.json")), JSON.stringify(profile), (err) => {

    if (err) {

      const message = "Unable to update. Couldn't write to file";
      res.status(500).send(message);

    } else {

      const message = "Profile updated";
      res.status(200).send(message);
    }

  });
}


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

  const completedItems = profile.filter((el) => el.completed == true);

  res.send(completedItems);
});

app.get("/todos/overdue", (_, res) => {
  res.header("Content-Type", "application/json");

  const currentDate = Date.now();

  const overdueItems = profile.filter((el) => new Date(el.due) < currentDate);

  res.send(overdueItems);
});

app.get("/todos/:id", (req, res) => {
  res.header("Content-Type", "application/json");

  res.send(findElementById(req.params.id));

});

app.post("/todos", (_, res) => {

  const body = _.body;

  profile.splice(0, 0, body);
  
  checkIfUpdateSuccessful(res);

});

app.patch("/todos/:id", (req, res) =>{
  

  findElementById(req.params.id).name = req.body.name;

  if(req.body.due){
    item.due = req.body.due;
  }

  checkIfUpdateSuccessful(res);

})


app.post("/todos/:id/complete", (req, res) => {

  findElementById(req.params.id).completed = true;

  checkIfUpdateSuccessful(res);

});

app.post("/todos/:id/undo", (req, res) => {

  findElementById(req.params.id).completed = false;

  checkIfUpdateSuccessful(res);

});

app.delete("/todos/:id", (req, res) => {

  const item = findElementById(req.params.id);

  profile.splice(item, 1);
  
  checkIfUpdateSuccessful(res);


});

module.exports = app;
