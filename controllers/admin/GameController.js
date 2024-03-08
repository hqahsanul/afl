const { Game, Question } = require('../../db/models/User.model')

class GameController {

  async addGame(req, res, next) {
    try {
      let { quizNameInEnglish, quizNameInHindi, entranceAmount, startDateTime, endDateTime, noOfQuestion, noOfParticipation, noOfPrice, pricePool, questionArray } = req.body;
     
      const game = new Game({
        gameNameInHindi: quizNameInHindi,
        gameNameInEnglish: quizNameInEnglish,
        startedAt: new Date(startDateTime),
        endedAt: new Date(endDateTime),
        entranceAmount,
        noOfQuestion,
        noOfParticipation,
        noOfPrice,
        pricePool,
        isCompleted: true
      })

      const gameDetail = await game.save();

      for (let i = 0; i < questionArray.length; i++) {
        const item = questionArray[i]
        const question = new Question({
          gameId: gameDetail?._id,
          questionInEnglish: item.questionInEnglish,
          questionInHindi: item.questionInHindi,
          optionsInEnglish: [
            { id: 1, answer: item.option1Eng },
            { id: 2, answer: item.option2Eng },
            { id: 3, answer: item.option3Eng },
            { id: 4, answer: item.option4Eng }
          ],
          optionsInHindi: [
            { id: 1, answer: item.option1Hin },
            { id: 2, answer: item.option2Hin },
            { id: 3, answer: item.option3Hin },
            { id: 4, answer: item.option4Hin }
          ],
          answer: item.answer
        })
        
        await question.save();
      }


      return res.success({ game }, 'Quiz added successfully');

    } catch (err) {
      console.error(err);
      return next(err);

    }
  }

}

module.exports = new GameController()
