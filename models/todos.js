const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  todolist: {
    type: [new mongoose.Schema({
      todo: {
        type: String,
        required: true,
        minlength: 1,
      },
      isCompleted: {
        type: Boolean,
        required: true,
        default: false,
      },
    })],
    required: true,
    default: [],
  },
});

module.exports = mongoose.model('Todos', todoSchema);
