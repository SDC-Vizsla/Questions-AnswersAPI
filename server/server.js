const express = require('express');
require('dotenv').config()
const controllers = require('./controllers.js')
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('all good')
})

app.get('/qa/questions/', controllers.getQuestions)

app.get('/qa/questions/:question_id/answers', controllers.getAnswers)

// app.post('/qa/questions', (req, res) => {
//   res.send('add a question')
// })

// app.post('/qa/questions/:questions_id/answers', (req, res) => {
//   console.log(req.params)
//   res.send('add an answer to this question')
// })

app.put('/qa/questions/:question_id/helpful', (req, res) => {
  console.log(req.params)
  res.status(204)
})

app.put('/qa/questions/:question_id/report', (req, res) => {
  console.log(req.params)
  res.status(204)
})

app.put('/qa/answers/:answer_id/helpful', (req, res) => {
  console.log(req.params)
  res.status(204)
})

app.put('/qa/answers/:answer_id/report', (req, res) => {
  console.log(req.params)
  res.status(204)
})


app.listen(process.env.HOSTPORT, ()=>{console.log('listening on port:', process.env.HOSTPORT)})