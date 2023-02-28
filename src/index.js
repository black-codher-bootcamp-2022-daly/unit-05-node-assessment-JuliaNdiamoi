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

const findElementById = (id, res) => { 

  const element =  profile.find((el) => el.id === id) 

  if (!element){

    res.status(404).send("Invalid ID");
  } else
  {

    return element;
  }
}

const checkIfUpdateSuccessful = (res, badStatusCode, goodStatusCode) => {

  fs.writeFile((path.join(__dirname, "models/todos.json")), JSON.stringify(profile), (err) => {

    if (err) {

      res.status(badStatusCode).send("Unsuccessful request");

    } else {

      res.status(goodStatusCode).send("Successful request");
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

  res.send(findElementById(req.params.id, res));

  checkIfUpdateSuccessful(res, 404, 200);

});

app.post("/todos", (_, res) => {

  const body = _.body;

  profile.splice(0, 0, body);
  
  checkIfUpdateSuccessful(res, 404, 201);

});

app.patch("/todos/:id", (req, res) =>{
  

  const element = findElementById(req.params.id, res)
  
  if(req.body.name){
    element.name = req.body.name;
  }

  if(req.body.due){
    element.due = req.body.due;
  }

  checkIfUpdateSuccessful(res);

})


app.post("/todos/:id/complete", (req, res) => {

  findElementById(req.params.id, res).completed = true;

  checkIfUpdateSuccessful(res, 404, 200);

});

app.post("/todos/:id/undo", (req, res) => {

  findElementById(req.params.id, res).completed = false;

  checkIfUpdateSuccessful(res, 404, 200);

});

app.delete("/todos/:id", (req, res) => {

  const item = findElementById(req.params.id, res);

  profile.splice(item, 1);
  
  checkIfUpdateSuccessful(res, 404, 200);


});

module.exports = app;
