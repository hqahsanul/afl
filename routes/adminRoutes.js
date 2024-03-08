const express = require('express')
const router = express.Router()
const { verifyJWT } = require('../controllers/utils')

const AuthController = require('../controllers/admin/AuthController')
const UserController = require('../controllers/admin/UserController')

let multer = require("multer");
const GameController = require('../controllers/admin/GameController')
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    const suffix = file.mimetype.split('/');
    cb(null, `${file.fieldname}-${Date.now()}.${suffix[1]}`);
  },
});

const upload = multer({ storage });

router.post('/log-in', AuthController.logIn);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/update-password', AuthController.updatePassword);
router.get('/me', verifyJWT, AuthController.me)
router.post('/change-password', verifyJWT, AuthController.changeAdminPassword);
router.get('/log-out', verifyJWT, AuthController.logOut);


router.post('/admin-create', AuthController.adminCreate);



router.get('/get-profile', verifyJWT, UserController.getAdminProfile);
router.post('/edit-profile', verifyJWT, upload.single('profile-pic'), UserController.editAdminProfile)
router.get('/setting', verifyJWT, UserController.getSetting);
router.post('/setting', verifyJWT, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'ad1', maxCount: 1 }, { name: 'ad2', maxCount: 1 }, { name: 'ad3', maxCount: 1 }, { name: 'ad4', maxCount: 1 }, { name: 'playVideoLink', maxCount: 1 }, { name: 'playImageLink', maxCount: 1 }]), UserController.postSetting);

router.post('/addGame', verifyJWT, GameController.addGame);

// router.get('/get-slider',UserController.getSlider);
// router.get('/get-address',verifyJWT,UserController.getAddress);
// router.post('/save-address',verifyJWT,UserController.saveAddress);
// router.post('/delete-address',verifyJWT,UserController.deleteAddress);
// router.post('/edit-profile',verifyJWT,UserController.editProfile);
// router.get('/about-us',UserController.AboutUs);
// router.get('/privacy-policy',UserController.Privacy);
// // router.get('/user-profile',verifyJWT,UserController.Profile);
// router.post('/test',UserController.Test);
// router.post('/addWallet',verifyJWT,UserController.Balance);
// router.get('/getWallet',verifyJWT,UserController.myWallet);
// router.post('/addGame',verifyJWT,GameController.addGame);
// router.get('/gameList',verifyJWT,GameController.gameList);
// router.post('/create-profile',verifyJWT,UserController.createProfile);
// router.post('/addBank',verifyJWT,UserController.addBank);
// router.get('/getBank',verifyJWT,UserController.getBank);
// router.get('/getProfile',verifyJWT,UserController.getProfile);

//--------------------------------------------------------ADMIN--------------------------------------------------------











module.exports = router
