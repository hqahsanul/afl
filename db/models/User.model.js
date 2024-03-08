const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, index: true },
  id:{ type: String,  default: '' },
  mobile: { type: String,  index: true },
  email: { type: String, index: true },
  role: { type: String, default: 'USER', index: true },
  password: { type: String },
  refferBy: { type: String,  },
  refferedTo: [{ type: String }],
  avatar: { type: String, default: '' },
  otp: { type: String, default: '1234' },
  resetToken: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  // loc: {type: { type: String, default: 'Point' },coordinates: [ { type: Number,},],},
  deviceType: { type: String, default: '', },
  deviceToken: { type: String, default: '', },
  deviceId: { type: String, default: '', },
  street_address: { type: String, default: '', },
  city: { type: String, default: '', },
  state: { type: String, default: '', },
  country: { type: String, default: '', },
  pincode: { type: String, default: '', },
  notification: { type: Boolean, default: true, },
  authTokenIssuedAt: Number,
  status: { type: Boolean, default: true },
  kyc: { type: Number, default: 0 },
  createdAt: { type: Date,  default: Date.now },
  updatedAt: { type: Date,  default: Date.now }
});

const walletSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  balance: { type: Number, default: 0 },
  deposit: { type: Number, default: 0 },
  taskBalance: { type: Number, default: 0 },
  withdraw: { type: Number, default: 0 },
  holdBalance: { type: Number, default: 0 },
  refBalance: { type: Number, default: 0 },
  projBalance: { type: Number, default: 0 },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now }
});


const taskSchema = new Schema({
  Name: { type: String, required: true },
  category: { type: String,default:"DEFAULT" },
  taskReward: { type: Number, default:0 },
  taskLink:{type: String,default:""},
  remark:{ type: String,default:"" },
  status: { type: Number, default: 0 },
  businessDate:{type: Number},
  isCompleted:{ type:Boolean,default:false}
});

const linkedInSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  Name: { type: String, required: true },
  email: { type: String,default:"DEFAULT" },
  password: { type: String, default:'' },
  no_connection:{ type: Number, default:0 },
  remark:{ type: String,default:"" },
  status: { type: Number, default: 0 },
  businessDate:{type: Number}
});

const userTaskSchema = new Schema({
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: Number, default: 0 },
  remark: { type: String,default:"" },
  isCompleted: { type: Boolean, default: false },
  businessDate:{type: Number},
  createdAt: { type: Number, default: Date.now() }
});

const webinarSchema = new Schema({
  topic: { type: String, default:"" },
  description: { type: String,default:"" },
  startAt: { type: Number, default:0 },
  Link:{type: String,default:""},
  remark:{ type: String,default:"" },
  status: { type: Boolean, default: true },
  businessDate:{type: Number},
  duration:{type: Number},
});

const documentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  userName: { type: String },
  docName: { type: String },
  docFile: { type: String },
  docLink: { type: String },
  remark: { type: String },
  status: { type: Number, default: 0 },
  businessDate:{type: Number},
  createdAt: { type: Number, default: Date.now() }
});

const projectSchema = new Schema({
  id: { type: Number, default:1 },
  name: { type: String, required: true },
  description: { type: String, required: true },
  technology: [{ type: String, required: true }],
  price: { type: Number },
  finalPrice: { type: Number },
  remAmount: { type: Number },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  demoLink: { type: String, required: true },
  file: { type: String, required: true },
  createdAt: { type: Number, default: Date.now() },
  updatedAt: { type: Number, default: Date.now() }
});

const userProjectSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  technology: [{ type: String, required: true }],
  price: { type: Number, default:1 },
  finalPrice: { type: Number, default:1 },
  demoLink: { type: String, required: true },
  file: { type: String, required: true },
  isConverted:{type:Boolean,default:false},
  createdAt: { type: Number, default: Date.now() },
  updatedAt: { type: Number, default: Date.now() }
});


const userQuestionSchema = new Schema({
  gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true, index: true },
  questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  question: { type: String, required: true },
  answer: { type: Number, required: true },
  isCorrect: { type: Boolean, default: false },
  mainPoints: { type: Number, default: 0 },
  rawPoints: { type: Number, default: 0 },
  rank: { type: Number, default: 1 },
  timeTaken: { type: Number },
  createdAt: { type: Number, default: Date.now() },
  isCompleted: { type: Boolean, default: false },
});

const bankSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  bank_name: { type: String, required: true },
  account_holder: { type: String, required: true },
  account_number: { type: String, required: true },
  ifsc: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now }
});

const transactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: Number, default: 0, required: true }, //0=deposit,1=game ded,2=game won,3=withd,4=pen,5=refund
  status: { type: Number, default: 0, required: true },
  refferedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  projectId:{ type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  msg:{ type: String, default: '0'},
  amount:{ type: Number, default: 0, required: true },
  remainingAmount:{ type: Number, default: 0, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
  Admin:{ type:Boolean,default:false}
});


const PoolSchema = new Schema({
      gametId: {type: Schema.Types.ObjectId,ref: 'Game'},
      pool: [{_id: false, from: {type: Number,default: 1},to: {type: Number,default: 1}, amount: { type: Number, default: 100 }}],
});


const kycSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  adhaar: { type: Number },
  pan: { type: String },
  adhaarFront: { type: String },
  adhaarBack: { type: String },
  panFront: { type: String },
  panBack: { type: String },
  isVerified: { type: Boolean, default: false },
  time: { type: Number },
  remark:{ type:String},
  status:{ type:Number, default:0}
});


const noticeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  Notice: { type: String },
  description:{ type:String},
  remark:{ type:String},
  status: { type: Number, default: 0 },
  start_at: { type: Number },
  end_at:{ type: Number },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now }
});

walletSchema.index({ _id: 1 }, { unique: true });

const User = mongoose.model('User', UserSchema);
const Wallet = mongoose.model('Wallet', walletSchema);
const Task = mongoose.model('Task', taskSchema);
const Project = mongoose.model('Project', projectSchema);
const Bank = mongoose.model('Bank', bankSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const UserProject = mongoose.model('UserProject', userProjectSchema);
const UserQuestion = mongoose.model('UserQuestion', userQuestionSchema);
const Document = mongoose.model('Document', documentSchema);
const UserTask = mongoose.model('UserTask', userTaskSchema);
const LinkedIn = mongoose.model('LinkedIn', linkedInSchema);
const Kyc = mongoose.model('Kyc', kycSchema);
const Notice = mongoose.model('Notice', noticeSchema);
const Webinar = mongoose.model('Webinar', webinarSchema);





module.exports = { User, Wallet, Bank, Transaction, UserQuestion,Kyc,Notice ,Project,LinkedIn,Webinar,Task,UserTask,Document};
