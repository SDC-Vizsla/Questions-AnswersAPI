const pool = require('./db.js')
require('dotenv').config()


exports.getQuestions = async (req, res)=>{
  var startTime = performance.now();
  var count = 5;
  if (req.query.count) {
    count = req.query.count
  }
  // check that the product_id is given and its a number
  if (req.query.product_id && Number(req.query.product_id)) {
    // grab all the questions for the given product
    const questionsResult = await pool.query(`SELECT question_id, body, date_written, asker_name, asker_email, reported, helpfulness FROM ${process.env.SCHEMA}.questions WHERE product_id = ${req.query.product_id} LIMIT ${count}`)
    // iterate over the list of answers returned
    for (var i = 0; i < questionsResult.rows.length; i++) {
      // change the date to be readable
      questionsResult.rows[i].date_written = new Date(parseInt(questionsResult.rows[i].date_written)).toISOString();
      // change reported to a boolean
      switch(questionsResult.rows[i].reported) {
        case 0:
          questionsResult.rows[i].reported = false;
          break;
        case 1:
          questionsResult.rows[i].reported = true;
          break;
      }
      // grab all the answers for the given questions
      const answersResult = await pool.query(`SELECT answer_id, body, date_written, answerer_name, helpfulness FROM ${process.env.SCHEMA}.answers WHERE question_id = ${questionsResult.rows[i].question_id}`)
      // create a answers obj on each question
      questionsResult.rows[i].answers = {}
      // iterate over each answer returned
      for (var j = 0; j < answersResult.rows.length; j++) {
        // make the date readable
        answersResult.rows[j].date_written = new Date(parseInt(answersResult.rows[j].date_written)).toISOString();
        // create an object that will hold the answer
        questionsResult.rows[i].answers[answersResult.rows[j].answer_id] = answersResult.rows[j]
        // grab all the photos for the current answer
        const answersPhotosResult = await pool.query(`SELECT photo_id, url FROM ${process.env.SCHEMA}.answers_photos WHERE answer_id = ${answersResult.rows[j].answer_id}`)
        // create a photos obj in the answer and place the photos in there
        questionsResult.rows[i].answers[answersResult.rows[j].answer_id].photos = answersPhotosResult.rows
      }
    }
    const result = {'product_id': req.query.product_id, 'results': questionsResult.rows}

    var endTime = performance.now();
    var time = ((endTime - startTime) / 1000).toFixed(3);
    console.log(`Data loaded to questions_list, time used: ${time} seconds`);

    res.send(result)
    res.status(200)
  } else {
    res.send('please include a product id')
  }
}

exports.getAnswers = async (req, res) => {
  var startTime = performance.now();
  var count = 5;
  if (req.query.count) {
    count = req.query.count
  }
  if (req.params.question_id && Number(req.params.question_id)) {
    const answersResult = await pool.query(`SELECT answer_id, body, date_written, answerer_name, helpfulness FROM ${process.env.SCHEMA}.answers WHERE question_id = ${req.params.question_id} LIMIT ${count}`)
    for (var i = 0; i < answersResult.rows.length; i++) {
      const answersPhotosResult = await pool.query(`SELECT photo_id, url FROM ${process.env.SCHEMA}.answers_photos WHERE answer_id = ${answersResult.rows[i].answer_id}`)
      answersResult.rows[i].photos = answersPhotosResult.rows;
    }
    const result = {'question': req.params.question_id, 'page': 1, 'count': count, 'results': answersResult.rows}

    var endTime = performance.now();
    var time = ((endTime - startTime) / 1000).toFixed(3);
    console.log(`Data loaded to questions_list, time used: ${time} seconds`);

    res.send(result)
    res.status(200)
  } else {
    res.send('please enter a valid question id').status(200)
  }
}

exports.addQuestion = async (req, res) => {
  console.log(req.body)
  var d = new Date();
  var date = (d.getTime() - d.getMilliseconds()) / 1000;

  // ! ^^ THIS DATE IS INCORRECT

  const lastQuestionID = await pool.query(`SELECT question_id FROM ${process.env.SCHEMA}.questions ORDER BY question_id DESC LIMIT 1`);
  const questionID = lastQuestionID.rows[0].question_id + 1;

// ^^ THIS IS A DUMB WAY TO DO THIS, BUT I NEED A UNIQUE QUESTION_ID ^^

  await pool.query(`INSERT INTO ${process.env.SCHEMA}.questions (question_id, product_id, body, date_written, asker_name, asker_email, reported, helpfulness) VALUES (${questionID}, '${req.body.product_id}', '${req.body.body}', ${date}, '${req.body.name}', '${req.body.email}', 0, 0)`)
  res.send('question works')
}

exports.addAnswer = async (req, res) => {
  console.log(req.params)
  res.send('answer works')
}

exports.makeQuestionHelpful = async (req, res) => {
  console.log(req.params)
  res.send('question works')
}

exports.reportQuestion = async (req, res) => {
  res.send('answer works')
}

exports.makeAnswerHelpful = async (req, res) => {
  console.log(req.params)
  res.send('question works')
}

exports.reportAnswer = async (req, res) => {
  res.send('answer works')
}
