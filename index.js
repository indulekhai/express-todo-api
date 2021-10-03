/* eslint-disable max-len */
if (process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const user = require('./routes/user');
const todo = require('./routes/todo');

mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
      console.log('connected to mongodb');
    })
    .catch((err) => {
      console.log(err);
    });

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({limit: '10mb', extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/user', user);
app.use('/api/todo', todo);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server up in port ${port}`);
});
