const jwt = require('jsonwebtoken')
const { signJWT, verifyJWT } = require('../utils')
const { generateOtp, randomString, utcDateTime } = require('../../lib/util')
const mongoose = require('mongoose')
const Admin = require('../../db/models/admin.model')
const Setting = require('../../db/models/setting.model')
var request = require('request');
const bcrypt = require('bcryptjs');
const { User } = require('../../db/models/User.model')

class UserController {

    async getAdminProfile(req, res, next) {

        try {
            const user = await Admin.findOne({
                _id: req.user._id,
                status: true
            }, { password: 0, createdAt: 0, updatedAt: 0, __v: 0 }).lean()
            if (!user) {
                return res.status(404).json({ msg: 'Not found' });
            }

            if (!user.status) {
                return res.status(404).json({ msg: 'Not verified' });
            }

            user.avatar = process.env.BASE_URL + user.avatar;

            return res.success({ admin: user }, 'Get Details');
        } catch (err) {
            console.error(err);
            return next(err);
        }
    }

    async editAdminProfile(req, res, next) {
        try {
            const { name, email, mobile } = req.body;
            const payload = {}
            const userDetail = await Admin.findOne({ _id: req.user._id });

            if (name) payload.name = name;
            if (email) payload.email = email;
            if (mobile) payload.mobile = mobile;
            if (req.file)
                payload.avatar = req.file.filename

            if (!userDetail)
                return res.error({}, "User not found.")

            await Admin.updateOne({ _id: req.user._id }, { $set: payload })

            return res.success({}, "Profile Update Successfully.")
        } catch (err) {
            return next(err);
        }
    }

    async getSetting(req, res, next) {
        try {
            const setting = await Setting.findOne({}).lean()

            return res.success({ setting: setting }, "Get setting.")
        } catch (err) {
            return next(err);
        }
    }

    async postSetting(req, res, next) {
        try {
            const { whatsappLink, telegramLink, youtubeLink, email, playText, aboutUs, termsAndCondition, privacyPolicy, refundCancellation, quizTiming,
                questionTiming, nextQuestionTiming, rightQuestionMarks, wrongQuestionMarks, quizInstruction, referralPoints, minimumWithdraw, withdrawCommission }
                = req.body;
            const payload = {}
            const settingDetail = await Setting.findOne({});

            if (whatsappLink) payload.whatsappLink = whatsappLink;
            if (telegramLink) payload.telegramLink = telegramLink;
            if (youtubeLink) payload.youtubeLink = youtubeLink;
            if (email) payload.email = email;
            if (playText) payload.playText = playText;
            if (aboutUs) payload.aboutUs = aboutUs;
            if (privacyPolicy) payload.privacyPolicy = privacyPolicy;
            if (termsAndCondition) payload.termsAndCondition = termsAndCondition;
            if (refundCancellation) payload.refundCancellation = refundCancellation;
            if (quizTiming) payload.quizTiming = quizTiming;
            if (questionTiming) payload.questionTiming = questionTiming;
            if (nextQuestionTiming) payload.nextQuestionTiming = nextQuestionTiming;
            if (rightQuestionMarks) payload.rightQuestionMarks = rightQuestionMarks;
            if (wrongQuestionMarks) payload.wrongQuestionMarks = wrongQuestionMarks;
            if (referralPoints) payload.referralPoints = referralPoints;
            if (minimumWithdraw) payload.minimumWithdraw = minimumWithdraw;
            if (quizInstruction) payload.quizInstruction = quizInstruction;
            if (withdrawCommission) payload.withdrawCommission = withdrawCommission;

            if (req?.files?.logo && req?.files?.logo[0])
                payload.logo = req.files.logo[0].filename
            if (req?.files?.ad1 && req?.files?.ad1[0])
                payload.ad1 = req.files.ad1[0].filename
            if (req?.files?.ad2 && req?.files?.ad2[0])
                payload.ad2 = req?.files?.ad2[0].filename
            if (req?.files?.ad3 && req?.files?.ad3[0])
                payload.ad3 = req?.files?.ad3[0].filename
            if (req?.files?.ad4 && req?.files?.ad4[0])
                payload.ad4 = req?.files?.ad4[0].filename
            if (req?.files?.playVideoLink && req?.files?.playVideoLink[0])
                payload.playVideoLink = req?.files?.playVideoLink[0].filename
            if (req?.files?.playImageLink && req?.files?.playImageLink[0])
                payload.playImageLink = req?.files?.playImageLink[0].filename

            if (!settingDetail)
                await Setting.create(payload)
            else
                await Setting.findOneAndUpdate({ _id: settingDetail._id }, { $set: payload })

            return res.success({}, "Setting update successfully.")
        } catch (err) {
            return next(err);
        }
    }

}

module.exports = new UserController()
