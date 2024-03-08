const mongoose = require('mongoose');
const Schema = mongoose.Schema;

function getImage(image) {
    console.log('image', image)
    if(image) {
        return process.env.BASE_URL + image
    } else {
        return ''
    }
}

const SettingSchema = new Schema({
    logo: { type: String, default: '' },
    ad1: { type: String, default: '' },
    ad2: { type: String, default: '' },
    ad3: { type: String, default: '' },
    ad4: { type: String, default: '' },
    whatsappLink: { type: String, default: '' },
    telegramLink: { type: String, default: '' },
    youtubeLink: { type: String, default: '' },
    email: { type: String, default: '' },
    playVideoLink: { type: String, default: '' },
    playImageLink: { type: String, default: '' },
    playText: { type: String, default: '' },
    aboutUs: { type: String, default: '' },
    termsAndCondition: { type: String, default: '' },
    privacyPolicy: { type: String, default: '' },
    refundCancellation: { type: String, default: '' },
    quizTiming: { type: Number, default: '' },
    questionTiming: { type: Number, default: '' },
    nextQuestionTiming: { type: Number, default: '' },
    rightQuestionMarks: { type: Number, default: '' },
    wrongQuestionMarks: { type: Number, default: '' },
    quizInstruction: { type: String, default: '' },
    referralPoints: { type: Number, default: '' },
    minimumWithdraw: { type: Number, default: '' },
    withdrawCommission: { type: Number, default: '' },
    status: { type: Boolean, default: true }
},
    {
        timestamps: true,
        toJSON: true
    });

const Setting = mongoose.model('Setting', SettingSchema);



module.exports = Setting;
