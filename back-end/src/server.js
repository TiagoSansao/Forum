// IMPORTS AND CONFIGS

import express from 'express';
import cors from 'cors';
import {} from 'dotenv/config.js';
import mongoose from 'mongoose';

const port = process.env.PORT || 3000;
const app = express();

// DATABASE

mongoose.connect(process.env.MONGOOSE_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const topicSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, reqired: true },
  author: { type: String, required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  replies: [
    {
      author: { type: String },
      content: { type: String },
      date: { type: Date },
    },
  ],
});

const Topic = mongoose.model('Topic', topicSchema);

// MIDDLEWARES

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// API CALLS

app.get('/topics', (req, res) => {
  Topic.find()
    .limit(10)
    .exec((err, results) => {
      if (err) return res.status(400).json({ status: 'failed' });
      res.status(200).json(results);
    });
});

app.get('/topics/:topic', (req, res) => {
  Topic.findById(req.params.topic, (err, result) => {
    if (err) return res.status(400).json({ status: 'failed' });
    res.status(200).json(result);
  });
});

app.post('/reply', (req, res) => {
  const { content, topic } = req.body;
  const author = 'Seu Madruga'; // temporary
  const data = { author: author, content: content, date: new Date() };
  Topic.findById(topic, (err, result) => {
    if (err) return res.status(400).json({ status: 'Invalid topic ID.' });
    result.replies.push(data);
    result.save((err) => {
      if (err) console.log(err);
    });
  });
});

app.post('/topic', (req, res) => {
  const { title, content, author, category } = req.body;
  const date = new Date();
  const topicData = {
    title: title,
    content: content,
    author: author,
    date: date,
    category: category,
  };
  const newTopic = new Topic(topicData);
  newTopic.save((err) => {
    if (err) return res.status(400).json({ status: 'failed' });
    res.status(200).json({ status: 'success' });
  });
});

// TURNING THE SERVER ON

app.listen(port, () => {
  console.log('Server is running on PORT: ' + port);
});
