import Topic from '../models/Topic.js';

const getTopicsFromUser = (req, res) => {
  Topic.find({ author: req.params.userId })
    .limit(30)
    .exec((err, result) => {
      if (err) console.log(err);
      res.status(200).json(result);
    });
};

const getRecentTopics = (req, res) => {
  Topic.find()
    .limit(30)
    .populate('author', { password: 0, email: 0, __v: 0 })
    .exec((err, results) => {
      if (err) return console.log(err);
      res.status(200).json(results);
    });
};

const getSpecificTopic = (req, res) => {
  Topic.findById(req.params.topic)
    .populate('author', { password: 0, email: 0, __v: 0 })
    .populate('replies.author', { password: 0, email: 0, __v: 0 })
    .exec((err, result) => {
      if (err) return res.status(400).json({ status: err });
      res.status(200).json(result);
    });
};

const getTopicsWithFilters = (req, res) => {
  let { title, category, page } = req.body;
  let regEx;
  if (!page) page = 1;
  page -= 1;
  if (category === 'all') category = '';
  if (title) {
    regEx = new RegExp('.*' + title + '.*');
  }
  if (category === 'C  /C/C') category = 'C++/C/C#';
  Topic.find(
    !title && !category
      ? {}
      : !title || !category
      ? !title
        ? { category: category }
        : { title: regEx }
      : { title: regEx, category: category }
  )
    .limit(30)
    .skip(page * 30)
    .populate('author', { password: 0, email: 0, __v: 0 })
    .exec((err, result) => {
      if (err) console.log(err);
      res.status(200).send(result);
    });
};

const reply = (req, res) => {
  const { content, topic } = req.body;
  if (content.length > 2048) return res.status(404);
  const data = { author: req.user._id, content: content, date: new Date() };
  Topic.findById(topic, (err, result) => {
    if (err) return console.log(err);
    result.replies.push(data);
    result.save((err) => {
      if (err) console.log(err);
      res.status(200).json({ status: 'success' });
    });
  });
};

const createTopic = (req, res) => {
  const { title, content, category } = req.body;
  if (title.length > 50 || content.length > 2048) return res.status(404);
  const date = new Date();
  const topicData = {
    title: title,
    content: content,
    author: req.user._id,
    date: date,
    category: category,
  };
  const newTopic = new Topic(topicData);
  newTopic.save((err, result) => {
    if (err) return console.log(err);
    res.status(200).send(result._id);
  });
};

export {
  getTopicsFromUser,
  getRecentTopics,
  getSpecificTopic,
  reply,
  createTopic,
  getTopicsWithFilters,
};
