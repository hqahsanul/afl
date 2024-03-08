const express = require('express')
const router = express.Router()
const { verifyJWT } = require('../controllers/utils')

const AuthController = require('../controllers/authController')
const UserController = require('../controllers/userController')
const GameController = require('../controllers/gameController')

router.get('/generate-token/:_id',AuthController.generateToken);
router.post('/log-in',AuthController.logIn);
router.get('/log-out',verifyJWT,AuthController.logOut);
router.post('/verify-otp',AuthController.verifyOtp)
router.post('/resend-otp',AuthController.resendOtp)
router.post('/send-otp',AuthController.sendOtp)
router.post('/signup',AuthController.signup)
router.post('/forgot-password',AuthController.forgotPassword)
router.post('/reset-password',AuthController.resetPassword);
router.get('/get-ref',AuthController.getRef);



// router.get('/slide-list',verifyJWT,UserController.slideList);
// router.post('/create-profile',verifyJWT,UserController.createProfile);
// router.post('/edit-profile',verifyJWT,UserController.editProfile);
// router.get('/getProfile',verifyJWT,UserController.getProfile);
// router.post('/upload-kyc',verifyJWT,UserController.uploadKYC);
// router.get('/about-us',UserController.AboutUs);
// router.get('/privacy-policy',UserController.Privacy);
// router.get('/faq',UserController.Faq);
// router.post('/test',UserController.Test);
// router.post('/addWallet',verifyJWT,UserController.Balance);

// router.get('/getWallet',verifyJWT,UserController.myWallet);
// router.post('/addGame',verifyJWT,GameController.addGame);
// router.get('/gameList',verifyJWT,GameController.gameList);

// router.post('/addBank',verifyJWT,UserController.addBank);
// router.get('/getBank',verifyJWT,UserController.getBank);
// router.get('/home-page',verifyJWT,GameController.HomePage);
// router.get('/my-exam',verifyJWT,GameController.myExam);
// router.get('/join-page',verifyJWT,GameController.JoinPage);
// router.post('/join-game',verifyJWT,GameController.joinGame);
// router.get('/winners-list',verifyJWT,GameController.winnersList);

// // router.get('/pay-page',verifyJWT,GameController.PayPage);
// router.post('/addQuiz',verifyJWT,GameController.addQuiz);

// router.get('/quizList',verifyJWT,GameController.quizList);
// router.get('/quiz-result',verifyJWT,GameController.quizResult);
// router.get('/quiz-leadership',verifyJWT,GameController.quizLeadership);
// router.get('/countQuestions/:gameId',verifyJWT,GameController.countQuestions);



router.post('/create-task',verifyJWT,UserController.createTask);
router.get('/task-list',verifyJWT,UserController.taskList);
router.post('/update-task',verifyJWT,UserController.updateTask);
router.post('/update-user-task',verifyJWT,UserController.updateUserTask);
router.get('/user-task-list',verifyJWT,UserController.userTaskList);
router.post('/approve-user-task',verifyJWT,UserController.approveUserTask);

router.get('/document-list',verifyJWT,UserController.documentList);
router.post('/create-document',verifyJWT,UserController.createDocument);


router.get('/project-list',verifyJWT,UserController.projectList);
router.post('/create-project',verifyJWT,UserController.createProject);
router.get('/user-project-list',verifyJWT,UserController.userProjectList);


router.get('/my-income',verifyJWT,UserController.myIncome);
router.get('/my-ref-income',verifyJWT,UserController.myrefIncome);
router.get('/user-referral-list',verifyJWT,UserController.userreferralList);
router.get('/conv-project',verifyJWT,UserController.convProject);
router.get('/admin-transaction',verifyJWT,UserController.AdminTransaction);
router.get('/admin-all-income',verifyJWT,UserController.AdminAllIncome);
router.post('/admin-approve-kyc',verifyJWT,UserController.AdminApproveKyc);

router.post('/create-linkedin-acc',verifyJWT,UserController.createLinkedIn);
router.get('/linkedin-acc-list',verifyJWT,UserController.accLinkedIn);


router.post('/create-webinar',verifyJWT,UserController.createWebinar);
router.get('/webinar-list',verifyJWT,UserController.webinarList);
























//--------------------------------------------------------ADMIN--------------------------------------------------------











module.exports = router
