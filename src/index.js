const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

const users = [];

function checkValidAccount(req, res, next) {
  const { username } = req.body;
  const searchUsername = users.find((users) => users.username === username);
  if (searchUsername)
    return res.status(400).send({ message: 'Username exists' });

  next();
}

function checkExistsUserAccount(req, res, next) {}

app.use(cors());
app.use(express.json());

app.get('/getAll', (req, res) => {
  return res.json(users);
});

app.post('/users', checkValidAccount, (req, res) => {
  const { name, username } = req.body;
  users.push({ _id: uuidv4(), name, username, todos: [] });
  res.status(201).send();
});

module.exports = app;
