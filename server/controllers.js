const pool = require('./db.js')
require('dotenv').config()


exports.getQuestions = async (req, res)=>{
  var count = 5;
  if (req.query.count) {
    count = req.query.count
  }
  // check that the product_id is given and its a number
  if (req.query.product_id && Number(req.query.product_id)) {
    // grab all the questions for the given product
    const questionsResult = await pool.query(`SELECT id, body, date_written, asker_name, asker_email, reported, helpfulness FROM ${process.env.SCHEMA}.questions WHERE product_id = ${req.query.product_id} LIMIT ${count}`)
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
      const answersResult = await pool.query(`SELECT id, body, date_written, answerer_name, helpfulness FROM ${process.env.SCHEMA}.answers WHERE question_id = ${questionsResult.rows[i].id}`)
      // create a answers obj on each question
      questionsResult.rows[i].answers = {}
      // iterate over each answer returned
      for (var j = 0; j < answersResult.rows.length; j++) {
        // make the date readable
        answersResult.rows[j].date_written = new Date(parseInt(answersResult.rows[j].date_written)).toISOString();
        // create an object that will hold the answer
        questionsResult.rows[i].answers[answersResult.rows[j].id] = answersResult.rows[j]
        // grab all the photos for the current answer
        const answersPhotosResult = await pool.query(`SELECT id, url FROM ${process.env.SCHEMA}.answers_photos WHERE answer_id = ${answersResult.rows[j].id}`)
        // create a photos obj in the answer and place the photos in there
        questionsResult.rows[i].answers[answersResult.rows[j].id].photos = answersPhotosResult.rows
      }
    }
    const result = {'product_id': req.query.product_id, 'results': questionsResult.rows}
    res.send(result)
    res.status(200)
  } else {
    res.send('please include a product id')
  }
}

exports.getAnswers = async (req, res) => {
  var count = 5;
  if (req.query.count) {
    count = req.query.count
  }
  if (req.params.question_id && Number(req.params.question_id)) {
    const answersResult = await pool.query(`SELECT id, body, date_written, answerer_name, helpfulness FROM ${process.env.SCHEMA}.answers WHERE question_id = ${req.params.question_id} LIMIT ${count}`)
    for (var i = 0; i < answersResult.rows.length; i++) {
      const answersPhotosResult = await pool.query(`SELECT id, url FROM ${process.env.SCHEMA}.answers_photos WHERE answer_id = ${answersResult.rows[i].id}`)
      answersResult.rows[i].photos = answersPhotosResult.rows;
    }
    const result = {'question': req.params.question_id, 'page': 1, 'count': count, 'results': answersResult.rows}
    res.send(result)
  } else {
    res.send('please enter a valid question id').status(200)
  }
}
