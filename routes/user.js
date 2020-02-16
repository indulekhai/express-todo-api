/* eslint-disable max-len */
const express = require('express');
const mongoose = require('mongoose');
const Users = require('../models/users');
const Todos = require('../models/todos');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');
// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/signup', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);
    const todo = new Todos({
      todolist: [],
    });
    await todo.save();
    const user = new Users({
      name: req.body.name,
      password: hash,
      todoData: todo._id,
      email: req.body.email,
    });
    await user.save();
    const token = jwt.sign({id: user._id, todo: todo._id}, process.env.JWT);
    session.commitTransaction();
    res.header('X-Auth-Token', token).status(200).send('signed up successfuly');
  } catch (err) {
    console.log(err);
    session.abortTransaction();
  }
  session.endSession();
});

router.get('/signin', async (req, res) => {
  try {
    const user = await Users.findOne({email: req.body.email});
    const pwrd = await bcrypt.compare(req.body.password, user.password);
    if (pwrd) {
      const token = jwt.sign({id: user._id, todo: user.todoData}, process.env.JWT);
      res.header('X-Auth-Token', token).status(200).send('sucessfuly loged in');
    } else {
      res.status(400).send('incorrect email or password');
    }
  } catch (err) {
    res.status(400).send('try agail');
  }
});

router.delete('/delete', authenticate, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const user = await Users.findById(req.user._id);
  const todo = await Todos.findById(req.user.todoData);
  const pwrd = await bcrypt.compare(req.body.password, user.password);
  try {
    if (pwrd) {
      await user.delete();
      await todo.delete();
      session.commitTransaction();
      res.send({
        name: req.user.name,
        email: req.user.email,
      });
    } else {
      session.abortTransaction();
      res.status(400).send('invalid password');
    }
    session.endSession();
  } catch (err) {
    res.status(400).send('internal error');
  }
});

router.put('/update', authenticate, async (req, res) => {
  try {
    const user = await Users.findById(req.user._id);
    if (req.body.name) {
      user.name = req.body.name;
    }
    if (req.body.email) {
      user.email = req.body.email;
    }
    if (req.body.oldpasswd && req.body.newpasswd) {
      const pwd = await bcrypt.compare(req.body.oldpasswd, user.password);
      if (pwd) {
        const slt = await bcrypt.genSalt(10);
        const pwrd = await bcrypt.hash(req.body.newpasswd, slt);
        user.password = pwrd;
      } else {
        res.send('invalid password');
      }
    }
    await user.save();
    res.send(user);
  } catch (err) {
    res.send('error');
  }
});

module.exports = router;
