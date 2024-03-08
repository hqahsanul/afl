const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const engine = require('ejs-locals')
const bodyParser = require('body-parser');
const morgan = require('morgan');
require('dotenv').config();
app.use(cors());
const mongoose = require('mongoose');
mongoose.set('debug', process.env.NODE_ENV === 'development');

app.use(express.json());
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'static')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.set('views', path.join(__dirname, 'views'))
app.engine('ejs', engine)
app.set('view engine', 'ejs')

app.use((req, res, next) => {
  res.success = (data, message) => {
    // console.log(data)
    res.status(200).json({
      success: true,
      data,
      message,
    })
  }
  res.error = (data, message) => {
    // console.log(data)
    res.status(200).json({
      success: false,
      data,
      message,
    })
  }
  res.warn = (data, message) => {
    // console.log(data)
    res.status(200).json({
      success: false,
      data,
      message,
    })
  }
  next()
});

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customfavIcon: '/fav32.png',
    customSiteTitle: 'Quiz',
    authorizeBtn: false,
    swaggerOptions: {
      filter: true,
      displayRequestDuration: true,
    },
  }),
);

const port = process.env.PORT
const connectDB = require('./db/db');
app.use('/api', require('./routes/apiRoutes'));
app.use('/admin', require('./routes/adminRoutes'));

const http = require('http');
server = http.createServer(app);
server.listen(port, () => console.log(`Server running on port ${port}`));
const io = require("socket.io")(server, {allowEIO3: true});
module.exports={io};

const ScheduleController = require('./controllers/scheduleController');
ScheduleController.Scheduler();



//-----------------------SOCKET IO------------------------------------------------




const { User ,Game ,UserGame ,UserQuestion,Question } = require('./db/models/User.model');






io.on('connection', socket => {



  io.to(socket.id).emit('message', 'socket is connected');

  socket.on('joinGame', async (data, callback) => {
      let gameId = data.gameId;
      socket.join(gameId);
  });

  socket.on('send_question', async (data, callback) => {
      try {

          let gameId = data.gameId;
          let q_no=0;
        
          const game=await Game.aggregate([
            {
              $match:{
                _id: new mongoose.Types.ObjectId(gameId)
              }
            },
            {
              $lookup: {
                from: 'questions',
                let: {
                  gameId: '$_id',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$gameId', "$$gameId"] }
                        ],
                      },
                    },
                  }
                ],
                as: 'Questions',
              },
            }
          ]);

          const { duration,noOfQuestion,Questions}=game[0];
          const t=(duration/noOfQuestion);
          const question=Questions[q_no];

        const ID = setInterval(() => {
          io.to(gameId).emit('get-question', { question });
          q_no++;
          if (q_no > noOfQuestion - 1) {
            io.to(gameId).emit('get-question', {  });
            clearInterval(ID);
          }
        }, t);

      } catch (err) {
          console.log(err);
      }
  });

  socket.on('get_result', async (data, callback) => {
      try {

          let questionId = ObjectId(data.questionId);

          const question=await Question.aggregate([
            {
              $match: {
                _id:new mongoose.Types.ObjectId(questionId)
              }
            },
            {
              $lookup: {
                from: 'userquestions',
                let: {
                  questionId: '$_id',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$questionId', "$$questionId"] }
                        ],
                      },
                    },
                  }
                ],
                as: 'UserQuestion',
              },
            }
          ])
          
          return callback({ data: question });

      } catch (err) {
          console.log(err);
      }
  });


  socket.on('give_answer', async (data, callback) => {
    try {

        const { questionId,gameId,question,timeToken,answer,mainPoints,rawPoints}=data;

        const _question=await Question.find({_id:new mongoose.Types.ObjectId(questionId)});
        const userQuestion=new UserQuestion({
          gameId,
          question,
          timeToken,
          answer,
          mainPoints,
          rawPoints,
          isCorrect:_question.answer==answer?true:false
        });

        await userQuestion.save();
        return callback({ data: true });

    } catch (err) {
        console.log(err);
    }
});


});




