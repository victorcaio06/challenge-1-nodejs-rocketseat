const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

const users = [];

function checkValidAccount(req, res, next) {
  const { username } = req.body;
  const searchUsername = users.some((users) => users.username === username);
  if (searchUsername)
    return res.status(400).send({ message: 'Username exists' });

  return next();
}

function checkExistsUserAccount(req, res, next) {
  const { username } = req.headers;
  const searchUsername = users.find((users) => users.username === username);
  if (!searchUsername) {
    return res.status(404).send({ error: 'Account not found' });
  }
  req.searchUsername = searchUsername;
  return next();
}

function verifyTodoId(req, res, next) {
  const { username } = req.headers;
  const { id } = req.params;

  const searchUsername = users.find((users) => users.username === username);
  const searchTodosId = searchUsername.todos.find(
    (searchTodosId) => searchTodosId.id === id
  );
  if (!searchTodosId)
    return res.status(404).json({ error: 'Todo list not found' });

  req.searchTodosId = searchTodosId;
  return next();
}

app.use(cors());
app.use(express.json());

app.get('/getAll', (req, res) => {
  return res.json(users);
});

app.post('/users', checkValidAccount, (req, res) => {
  const { name, username } = req.body;
  users.push({ _id: uuidv4(), name, username, pro: false, todos: [] });
  return res.status(201).send();
});

app.get('/todos', checkExistsUserAccount, (req, res) => {
  const { searchUsername } = req;
  return res.send(searchUsername.todos);
});

app.post('/todos', checkExistsUserAccount, (req, res) => {
  const { searchUsername } = req;
  const { title, deadline } = req.body;
  searchUsername.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    create_at: new Date(),
  });

  return res.status(200).json(searchUsername.todos);
});

app.put('/todos/:id', checkExistsUserAccount, verifyTodoId, (req, res) => {
  let { searchTodosId } = req;
  const { title, deadline } = req.body;
  // searchTodosId.title = title;
  // searchTodosId.deadline = new Date(deadline);

  searchTodosId = {
    ...searchTodosId,
    title: title,
    deadline: new Date(deadline),
  };
  return res.status(200).json(searchTodosId);
});

app.patch(
  '/todos/:id/done',
  checkExistsUserAccount,
  verifyTodoId,
  (req, res) => {
    const { searchTodosId } = req;
    searchTodosId.done = !searchTodosId.done;

    return res.status(204).send();
  }
);

app.delete('/todos/:id', checkExistsUserAccount, (req, res) => {
  const { searchUsername } = req;
  users.splice(searchUsername, 1);

  return res.status(204).send();
});

app.patch('/users/pro/:id', checkExistsUserAccount, (req, res) => {
  const { searchUsername } = req;
  searchUsername.pro = !searchUsername.pro;
  return res.status(204).send();
});

module.exports = app;
