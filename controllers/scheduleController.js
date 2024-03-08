const { User, Wallet, Address, Game,UserGame,Question,Transaction } = require('../db/models/User.model')

const request = require('request')
const _ = require('lodash')
const moment = require('moment')
const mongoose = require("mongoose");
const {io} = require('../index');


var gameIds=[];


// setInterval(async () =>{
//   const games = await Game.find({ isCompleted: false });
//   games.forEach(function (game) {
//     if(!gameIds.includes(game.id))
//     scheduleGame(game._id, game.schedule);
//     gameIds.push(game._id.toString());
//   });

// });



class scheduleController {

  async Scheduler(req, res, next) {
    try {
      console.log("+++++++++++++++++")
  //    const games=await Game.find({isCompleted:false});
      // games.forEach(function(game) {
      //   scheduleGame(game._id,game.schedule);
      //   gameIds.push(game._id.toString());
      // });
    } catch (err) {
      console.log(err);
    }
  }

}

module.exports = new scheduleController();


function scheduleGame(gameId, schedule) {
  const t = schedule - Date.now();
  setTimeout(() => {
    io.emit('send_question', { gameId });
  }, t)

}
