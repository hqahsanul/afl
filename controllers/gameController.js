const { User, Wallet, Address, Game,UserGame,Question,Transaction } = require('../db/models/User.model')
// const { Category, Slider1, Slider2, Product } = require('../db/models/product.model')
const { uploadImageAPI } = require('../lib/util')
const multiparty = require('multiparty')
const request = require('request')
const _ = require('lodash')
const moment = require('moment')
const mongoose = require("mongoose");
const { SANDBOX_HOST, API_KEY, VERSION } = process.env;

class GameController {


  async addGame(req, res, next) {
    try {
      let { gameName, startedAt, endedAt, amount, entrance } = req.body;

      const game = new Game({
        gameName,
        startedAt,
        endedAt,
        amount,
        entrance
      })

      await game.save();

      return res.success({ game }, 'game added successfully');

    } catch (err) {
      console.error(err);
      return next(err);

    }
  }

  async gameList(req, res, next) {
    try {
      let gameList = await Game.find({  })
      if (gameList.length>0) {
        return res.success({ gameList }, "game list")
      } else {
        return res.warn({}, "List not found")
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async myExam(req, res, next) {
    try {
      const { name, businessDate,type}=req.query;

      let query={}

      if (type=='LIVE') {
        query={
          userId: new mongoose.Types.ObjectId(req._id),
          // schedule:{ $gt:Date.now()}
        }
      }else if(type=='COMPLETED'){

        query={
          userId: new mongoose.Types.ObjectId(req._id),
          // endedAt:{ $lt:Date.now()}
        }

      }

      if(name){
        const searchValue = new RegExp(
          name
            .split(' ')
            .filter(val => val)
            .map(value => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
            .join('|'),
          'i'
        );
        query.$or=[{gameNameInHindi:searchValue},{gameNameInEnglish:searchValue}];
      }

      if(businessDate){
        query.businessDate=businessDate;
      }


      let userGameList = await UserGame.aggregate([
        { 
          $match:query
        },
        { 
  
            $lookup: {
              from: 'games',
              localField: 'gameId',
              foreignField: '_id',
              as: 'Game'
    
          }
        }
      ]);
      console.log(userGameList)
      if (userGameList.length>0) {
        return res.success({ userGameList }, "My Exam List")
      } else {
        return res.warn({}, "List not found")
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async HomePage(req, res, next) {
    try {

      const { name, businessDate}=req.query;
      let userGameList = await UserGame.aggregate([
        { 
          $match:{
            userId: req.user._id,
          }
        },
        { 
            $lookup: {
              from: 'games',
              localField: 'gameId',
              foreignField: '_id',
              as: 'Game'
    
          }
        },
        { 
          $lookup: {
            from: 'usergames',
            localField: 'gameId',
            foreignField: 'gameId',
            as: 'UserGame'
        }
      }
      ]);


      let query={
        isCompleted: false,
        // schedule:{ $gt:Date.now()}
      }

      if(name){


        const searchValue = new RegExp(
          name
            .split(' ')
            .filter(val => val)
            .map(value => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
            .join('|'),
          'i'
        );
        query.$or=[{gameNameInHindi:searchValue},{gameNameInEnglish:searchValue}];
      }

      if(businessDate){
        query.businessDate=businessDate;
      }


      let upcomingGames = await Game.aggregate([
        {
          $match: query
        },
        {
          $lookup: {
            from: 'usergames',
            localField: '_id',
            foreignField: 'gameId',
            as: 'UserGame'
          }
        },
        {
          $addFields: {
            isJoined: {
              $cond: [{ $in: [req.user._id, '$UserGame.userId'] }, true, false]
            }
          }
        },
      ]);

      return res.success({ userGameList,upcomingGames }, 'Home page');
      
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async JoinPage(req, res, next) {
    const { _id}=req.query;
    try {
      
      let joingGame=await Game.aggregate([
        {
          $match:{
            _id:new mongoose.Types.ObjectId(_id)
          }
        },
        {
          $lookup: {
              from: 'usergames',
              let: {
                gameId: '$_id',
            },
              pipeline: [
                  {
                      $match: {
                          $expr: {
                              $and: [{ $eq: ['$gameId', "$$gameId"] }],
                          },
                      },
                  },
                
                  { 
                    $lookup: {
                      from: 'users',
                      localField: 'userId',
                      foreignField: '_id',
                      as: 'User'
                   }
                  },
              ],
              as: 'UserGame',
          },
       },
        // { 
  
        //   $lookup: {
        //     from: 'usergames',
        //     localField: '_id',
        //     foreignField: 'gameId',
        //     as: 'UserGame'
        //  }
        // },
        // {
        //   $unwind:"$UserGame"
        // },
        // { 
        //   $lookup: {
        //     from: 'users',
        //     localField: 'UserGame.userId',
        //     foreignField: '_id',
        //     as: 'User'
        //  }
        // },
        { 
  
          $lookup: {
            from: 'pools',
            localField: '_id',
            foreignField: 'gameId',
            as: 'GamePool'
         }
        },
        {
          $addFields: {
            isJoined: {
              $cond: [{ $eq: [req.user._id, '$UserGame.userId'] }, true, false]
            }
          }
        },
      ]);

      return res.success({ joingGame }, 'Join page');
      
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async addQuiz(req, res, next) {
    try {

      let { gameId, question, options, createdAt, isCompleted } = req.body;

      let questions = new Question({
        gameId,
        question,
        options,
        createdAt,
        isCompleted

      })

      await questions.save();

      return res.success({ questions }, 'questions added successfully');


    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  // async joinGame(req, res, next) {
  //   try {

  //     let { _id ,amount,schedule} = req.body;


  //     let _txn=new Transaction({
  //       gameId:_id,
  //       userId:req._id,
  //       amount,
  //       msg:'',
  //       type:1,
  //       status:true
  //     });

  //     const txn=await _txn.save();

  //     let userGames = new UserGame({
  //       gameId:_id,
  //       userId:req._id,
  //       amount,
  //       schedule,
  //       businessDate:moment(schedule).format('YYYYMMDD'),
  //       transactionId:txn._id
  //     });

  //     await userGames.save();
  //     return res.success({ userGames }, 'User joined successfully');

  //   } catch (err) {
  //     console.log(err);
  //     return next(err);
  //   }
  // }


  async  joinGame(req, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      let { _id, amount, schedule } = req.body;

      if(!_id||!amount||!schedule){
        return res.status(400).json({ success: false, message: 'Data missing' });
      }
      console.log(req.body,")))))))))))))))))))))00000000000000000000000000000000")
  
      let _txn = new Transaction({
        gameId: _id,
        userId: req._id,
        amount,
        msg: '',
        type: 1,
        status: true
      });
  
      const txn = await _txn.save({ session });
  
      let userGames = new UserGame({
        gameId: _id,
        userId: req._id,
        amount,
        schedule,
        businessDate: moment(schedule).format('YYYYMMDD'),
        transactionId: txn._id
      });
  
      await userGames.save({ session });
  
      await session.commitTransaction();
      session.endSession();
  
      return res.success({ userGames }, 'User joined successfully');
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.log(err);
      return next(err);
    }
  }


  async quizList(req, res, next) {
    try {

      let quizLists = await Question.find({ isCompleted: true });
      if (quizLists) {
        return res.success({ quizLists }, "Quiz List");
      } else {
        return res.warn({}, "Quiz List not found");
      }

    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async countQuestions(req, res, next) {
    const gameId = req.params.gameId;

    console.log(gameId);

    try {
      const aggregationPipeline = [
        {
          $match: { gameId: new mongoose.Types.ObjectId(gameId) }
        },
        {
          $group: {
            _id: '$gameId',
            totalQuestions: { $sum: 1 },
            questions: { $push: '$$ROOT' }
          }
        },
        {
          $lookup: {
            from: 'games',
            localField: '_id',
            foreignField: '_id',
            as: 'gameInfo'
          }
        },
        {
          $unwind: '$gameInfo'
        },
        {
          $project: {
            _id: 0,
            gameId: '$_id',
            totalQuestions: 1,
            questions: 1,
            gameInfo: {
              _id: 1,
              gameName: 1,
              startedAt: 1,
              endedAt: 1,
              isCompleted: 1,
              amount: 1,
              entrance: 1

            }
          }
        }
      ];

      const result = await Question.aggregate(aggregationPipeline);

      if (result.length > 0) {
        return res.json({ result });
      } else {
        return res.status(404).json({ message: 'No questions found for the given gameId' });
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async quizResult(req, res, next) {
    const { gameId,q_no}=req.query;
    try {
      
      let gameQuestion=await Question.aggregate([
        {
          $match: {
            gameId: new mongoose.Types.ObjectId(gameId),
            q_no
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
                      { $eq: ['$questionId', "$$questionId"] },
                      { $eq: ['$userId', new mongoose.Types.ObjectId(req._id)] }
                    ],
                  },
                },
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'userId',
                  foreignField: '_id',
                  as: 'User'
                }
              },
            ],
            as: 'UserQuestion',
          },
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
            as: 'AllQuestions',
          },
        },
        {
          $addFields: {
            ContestMembers: {
              $function: {
                body: 
                `function (AllQuestions) {
                  
                  return {A:12,B:45,C:5,D:37};
                }`
                ,
                args: ['$AllQuestions'],
                lang: 'js',
              },
            },
          },
        },
      ]);

      return res.success({ gameQuestion }, 'Quiz result page');
      
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

 

  async quizLeadership(req, res, next) {
    const { gameId}=req.query;
    try {
      
      let gameLeadership=await Question.aggregate([
        {
          $match: {
            gameId: new mongoose.Types.ObjectId(gameId)
          }
        },
        {
          $lookup: {
              from: 'usergames',
              let: {
                gameId: '$_id',
            },
              pipeline: [
                  {
                      $match: {
                          $expr: {
                              $and: [{ $eq: ['$gameId', "$$gameId"] }],
                          },
                      },
                  },
                
                  { 
                    $lookup: {
                      from: 'users',
                      localField: 'userId',
                      foreignField: '_id',
                      as: 'User'
                   }
                  },
              ],
              as: 'UserGame',
          },
        }
      ]);

      return res.success({ gameLeadership }, 'Quiz Leadership page');
      
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async winnersList(req, res, next) {
    try {

      let joingGame=await Game.aggregate([
        {
          $match:{
            isCompleted:true
          }
        },
        {
          $lookup: {
            from: 'usergames',
            let: {
              gameId: '$_id',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$gameId', "$$gameId"] },
                      { $eq: ['$userId', new mongoose.Types.ObjectId(req._id)] }
                    ],
                  },
                },
              }
            ],
            as: 'UserGame',
          },
        }
      ]);

      return res.success({ joingGame }, 'Join page');

    } catch (err) {
      console.log(err);
      return next(err);
    }
  }








}

module.exports = new GameController()
