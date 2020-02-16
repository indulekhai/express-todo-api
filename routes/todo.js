const express = require('express');
// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');
const Todos = require('../models/todos');
const jwt = require('jsonwebtoken');

// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/add', async (req, res) => {
  const token = req.header('X-Auth-Token');
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT);
      const todoList = await Todos.findById(decoded.todo);
      todoList.todolist.unshift({
        todo: req.body.new,
      });
      await todoList.save();
      res.send({
        todo: req.body.new,
        isCompleted: false,
      });
    } catch (err) {
      res.status(400).send('error');
    }
  } else {
    res.status.send('missing header');
  }
});

router.get('/get', async (req, res) => {
  const token = req.header('X-Auth-Token');
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT);
      const todoList = await Todos.findById(decoded.todo).select('-_id -__v');
      res.send(todoList);
    } catch (err) {
      res.status(400).send('error');
    }
  } else {
    res.status.send('missing header');
  }
});

router.put('/complete', async (req, res) => {
  const token = req.header('X-Auth-Token');
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT);
      const todoList = await Todos.findById(decoded.todo);
      todoList.todolist.id(req.query.todoid).isCompleted ^= true;
      await todoList.save();
      const result = todoList.todolist.id(req.query.todoid);
      res.send(result);
    } catch (err) {
      res.status(400).send('error');
    }
  } else {
    res.status.send('missing header');
  }
});

router.delete('/remove', async (req, res) => {
  const token = req.header('X-Auth-Token');
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT);
      const todoList = await Todos.findById(decoded.todo);
      await todoList.todolist.pull(req.query.todoid);
      await todoList.save();
      res.send('sucessfuly removed');
    } catch (err) {
      res.status(400).send('error');
    }
  } else {
    res.status.send('missing header');
  }
});

module.exports = router;
