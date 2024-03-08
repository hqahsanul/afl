const { User, Wallet, Address,Game,Bank,Kyc,LinkedIn,UserTask, Transaction,Task,Project,Webinar,Document} = require('../db/models/User.model')
// const { Category, Slider1, Slider2,Product } = require('../db/models/product.model')
const { uploadImageAPI } = require('../lib/util');
const multiparty = require('multiparty');
const request = require('request');
const _ = require('lodash');
const moment = require('moment');
const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');



class UserController {
    
    async editProfile(req, res, next) {
        try {
            const user = await User.findOne({ _id: req._id });
    
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            
            const form = new multiparty.Form();
            const { fields, files } = await parseFormAsync(form, req);
    
            for (const key in fields) {
                if (fields.hasOwnProperty(key)) {
                    user[key] = fields[key][0];
                }
            }
    
            if (files.avatar && files.avatar[0].originalFilename) {
                const fileupload = files.avatar[0];
                const contents = await fs.readFile(fileupload.path, {encoding: 'base64'});
                user.avatar = contents;
            }
    
            let user_ = await user.save();
    
            return res.status(200).json({ success: true, message: 'Profile update successfully', data: { user: user_ } });
        } catch (err) {
            console.error(err);
            return next(err);
        }
    }
    
    async createProfile(req, res, next) {
        try {
            const user = await User.findOne({ _id: req._id });
    
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            

            const form = new multiparty.Form();
            const { fields, files } = await parseFormAsync(form, req);
    
            for (const key in fields) {
                if (fields.hasOwnProperty(key)) {
                    user[key] = fields[key][0];
                }
            }
    
            if (files.avatar && files.avatar[0].originalFilename) {
                const fileupload = files.avatar[0];
                const contents = await fs.readFile(fileupload.path, {encoding: 'base64'});
                user.avatar = contents;
            }
    
            let user_ = await user.save();
            return res.status(200).json({ success: true, message: 'Profile created successfully', data: { user: user_ } });

        } catch (err) {
            console.error(err);
            return next(err);
        }
    }

    async createTask(req,res,next){
        try {
            const {Name,remark,taskLink,businessDate }=req.body;
            let _task=new Task({
                Name,
                remark,
                businessDate,
                taskLink
            });

            const task=await _task.save()
            return res.status(200).json({ success: true, message: 'Task created successfully', task });

        } catch (err) {
            console.error(err);
            return next(err);
        }
    }

    async taskList(req,res,next){
        try{

            let tasks= await Task.find({isCompleted: false});
            return res.success({tasks},"Task List");

        }catch(err){
            console.log(err);
            return next(err);
        }
    }

    async updateTask(req, res, next) {
        try {
            const { _id}=req.body;
    
            if (_id) {
                return res.status(400).json({ success: false, message: 'Please provide Task ID' });
            }
    
            const task=await Task.findOneAndUpdate({_id},{$set:{isCompleted:true}})
            if(task){
                return res.status(200).json({ success: true, message: 'Task updates successfully'});
            }
            
        } catch (err) {
            console.error(err);
            return next(err);
        }
    }

    async updateUserTask(req, res, next) {
        try {
            const { _id,businessDate}=req.body;
            if (!_id) {
                return res.status(400).json({ success: false, message: 'Please provide Task _id' });
            }
            
            const user_task=await UserTask({taskId:_id,userId:req._id});
            if(user_task) user_task.isCompleted=true;
            else {
                user_task=new UserTask({
                    taskId:_id,
                    userId:req._id,
                    businessDate,
                    createdAt:Date.now()
                });
                
            }
            await user_task.save();
            if(user_task){
                return res.status(200).json({ success: true, message: 'User Task updated successfully'});
            }
            
        } catch (err) {
            console.error(err);
            return next(err);
        }
    }

    async userTaskList(req,res,next){
        try{

            let tasks= await UserTask.find({userId:req._id}).populate('taskId');
            return res.success({tasks},"Task List");

        }catch(err){
            console.log(err);
            return next(err);
        }
    }

    async documentList(req,res,next){
        try{

            let documents= await Document.find();
            return res.success({documents},"Documents List");

        }catch(err){
            console.log(err);
            return next(err);
        }
    }

    async createDocument(req,res,next){
        try {

            const form = new multiparty.Form();
            const { fields, files } = await parseFormAsync(form, req);
            let document=new Document();
            document['userId']=req._id;
            document['userName']=req.user.name;
            document['status']=0;
            document['remark']="Pending";

            console.log(JSON.stringify(fields),files);
            
            for (const key in fields) {
                if (fields.hasOwnProperty(key)) {
                    document[key] = fields[key][0];
                }
            }
    
            if (files.uploadFile && files.uploadFile[0].originalFilename) {

                const fileupload = files.uploadFile[0];
                const uploadDir = 'uploads/docs';
                let file_name=Date.now()+'_'+fileupload.originalFilename;
                const uploadPath = path.join(uploadDir, file_name);

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                fs.writeFileSync(uploadPath, fs.readFileSync(fileupload.path));
                document.docFile = path.relative('uploads', uploadPath);
            }
    
            let data = await document.save();
            return res.status(200).json({ success: true, message: 'Document created successfully', data: { data } });

        } catch (err) {
            console.error(err);
            return next(err);
        }
    }

    async approveUserTask(req, res, next) {
        try {
            const { _id, status } = req.body;

            if (_id && status) {
                return res.status(400).json({ success: false, message: 'Please provide Task ID and Status' });
            }
            const userTask = await UserTask.findOneAndUpdate({ _id }, { $set: { status: status } });
            if (userTask) {
                return res.status(200).json({ success: true, message: 'User Task updated successfully' });
            }

        } catch (err) {
            console.error(err);
            return next(err);
        }
    }
    
    async projectList(req, res, next) {
        try {
        
            const projects = await Project.find({ status:true } );
            if (projects.length>0) {
                return res.status(200).json({ success: true, message: 'Project List',projects });
            }
            return res.status(200).json({ success: false, message: 'No data found' });

        } catch (err) {
            console.error(err);
            return next(err);
        }
    }

    async userProjectList(req, res, next) {
        try {
        
            const projects = await Project.find({ userId:req._id } );
            if (projects.length>0) {
                return res.status(200).json({ success: true, message: 'Project List',projects });
            }
            return res.status(200).json({ success: false, message: 'No data found' });

        } catch (err) {
            console.error(err);
            return next(err);
        }
    }

    async createProject(req,res,next){
        try {

            let project=new Project();
            const id=await Project.countDocuments({})+1;
            project['id']=id;
            project['userId']=req._id;
            const form = new multiparty.Form();
            const { fields, files } = await parseFormAsync(form, req);
            console.log(files.projFile,fields)
            
            for (const key in fields) {
                if (fields.hasOwnProperty(key)) {
                    project[key] = fields[key][0];
                }
            }
    
            if (files.projFile && files.projFile[0].originalFilename) {
                console.log("====------")
                const fileupload = files.projFile[0];
                const uploadDir = 'uploads/projects';
                let file_name=Date.now()+'_'+fileupload.originalFilename;
                const uploadPath = path.join(uploadDir, file_name);

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                console.log("=======================",uploadPath)
                fs.writeFileSync(uploadPath, fs.readFileSync(fileupload.path));
                project.file = path.relative('uploads', uploadPath);
            }
    
            let data = await project.save();
            return res.status(200).json({ success: true, message: 'Project created successfully', data: { data } });

        } catch (err) {
            console.error(err);
            return next(err);
        }
    }

    async myIncome(req, res, next) {
        try {
        
            const transactions = await Transaction.find({ userId:req._id } );
            if (transactions.length>0) {
                return res.status(200).json({ success: true, message: 'Project List',transactions });
            }
            return res.status(200).json({ success: false, message: 'No data found' });

        } catch (err) {
            console.error(err);
            return next(err);
        }
    }

    async myrefIncome(req, res, next) {
        try {
        
            const transactions = await Transaction.find({ userId:req._id } );
            if (transactions.length>0) {
                return res.status(200).json({ success: true, message: 'Project List',transactions });
            }
            return res.status(200).json({ success: false, message: 'No data found' });

        } catch (err) {
            console.error(err);
            return next(err);
        }
    }

    async userreferralList(req, res, next) {
        try {
        
            const referral = await User.find({ refferBy:req._id } );
            if (referral.length>0) {
                return res.status(200).json({ success: true, message: 'Referral List',referral });
            }
            return res.status(200).json({ success: false, message: 'No data found' });

        } catch (err) {
            console.error(err);
            return next(err);
        }
    }

    async convProject(req, res, next) {
        try {
        
            const transactions = await Project.find({ userId:req._id,isConverted:true } );
            if (transactions.length>0) {
                return res.status(200).json({ success: true, message: 'Project List',transactions });
            }
            return res.status(200).json({ success: false, message: 'No data found' });

        } catch (err) {
            console.error(err);
            return next(err);
        }
    }

    async AdminTransaction(req, res, next) {
        try {

            let transactions = await Transaction.findOne({ userId: req._id })
            if (transactions.length > 0) {
                return res.success({ transactions }, "Transactions List");
            }
            return res.notFound({}, "Bank not found");
        } catch (err) {
            console.log(err);
            return next(err);
        }
    }

    async AdminAllIncome(req, res, next) {
        try {

            let transactions = await Transaction.findOne({ userId: req._id })
            if (transactions.length > 0) {
                return res.success({ transactions }, "Transactions List");
            }
            return res.notFound({}, "Bank not found");
        } catch (err) {
            console.log(err);
            return next(err);
        }
    }

    async AdminApproveKyc(req, res, next) {
        try {

            const { _id }=req.body;
            let kyc = await Kyc.findOneAndUpdate({ _id },{$set:{ }})
            if (kyc) {
                return res.success({ kyc }, "Kyc updated successfully");
            }
            return res.notFound({}, "Something went wrong!");
        } catch (err) {
            console.log(err);
            return next(err);
        }
    }

    async createLinkedIn(req,res,next){
        try {

            const {Name,remark, businessDate,password,email,no_connection }=req.body;
            if(!Name||!remark||!businessDate||!password||!email||!no_connection){
                return res.status(400).json({ success: false, message: 'Insufficent data' });
            }
            let acc=new LinkedIn({
                userId:req._id,
                Name,
                remark,
                businessDate,
                password,
                email,
                no_connection
            });

           const accLinkedIn=await acc.save()
          return res.status(200).json({ success: true, message: 'LinkedIn Account saved successfully', accLinkedIn });

        } catch (err) {
            console.error(err);
            return next(err);
        }
    }

    async accLinkedIn(req,res,next){
        try {

            const accLinkedIns=await LinkedIn.find({userId:req._id});
            console.log(accLinkedIns);
            return res.status(200).json({ success: true, message: 'LinkedIn Account List', accLinkedIns });

        } catch (err) {
            console.error(err);
            return next(err);
        }
    }

    async createWebinar(req,res,next){
        try {
            const {topic,description, businessDate,Link,remark,duration }=req.body;
            if(!topic||!description||!businessDate||!Link||!remark||!duration){
                return res.status(400).json({ success: false, message: 'Insufficent data' });
            }
            let web=new Webinar({
                userId:req._id,
                topic,
                description,
                businessDate,
                startAt:Date.now(),
                Link,
                remark,
                duration
            });

            const webinar=await web.save()
            return res.status(200).json({ success: true, message: 'Webinar created successfully', webinar });

        } catch (err) {
            console.error(err);
            return next(err);
        }
    }

    async webinarList(req,res,next){
        try {

           const webiners=await Webinar.find()
            return res.status(200).json({ success: true, message: 'Webinar list', webiners });

        } catch (err) {
            console.error(err);
            return next(err);
        }
    }
    

  //------------------------------------------------------------------------------------------||-----------------------------------



async  saveAddress(req, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { houseNumber , route , wardNumber , city , state , zipCode , country  } = req.body;

        await updateDefaultAddress(req._id, session);

        const newAddress = new Address({
            houseNumber,
            route,
            wardNumber,
            city,
            state,
            zipCode,
            country,
            userId: req._id
        });

        await newAddress.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.success({ newAddress }, 'Address added successfully');
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(err);
        return next(err);
    }
}

async updateKyc(req, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { houseNumber , route , wardNumber , city , state , zipCode , country  } = req.body;

        await updateDefaultAddress(req._id, session);

        const newAddress = new Address({
            houseNumber,
            route,
            wardNumber,
            city,
            state,
            zipCode,
            country,
            userId: req._id
        });

        await newAddress.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.success({ newAddress }, 'Address added successfully');
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(err);
        return next(err);
    }
}

async  deleteAddress(req, res, next) {
    try {
        const { addressId } = req.body;
        const deletedAddress = await Address.findOneAndDelete({ userId: req._id, _id: addressId });

        if (!deletedAddress) {
            return res.status(404).json({ error: 'Address not found' });
        }

        return res.success({  },'Address deleted successfully');

    }catch (err) {
        console.error(err);
        return next(err);
    }
}

async depositHistory(req,res,next){
    try{

        let transactions= await Transaction.find({userId:req._id,type:'deposit',status:1}).lean();
        return res.success({transactions},"User's transaction fetched successfully");

    }catch(err){
        console.log(err);
        return next(err);
    }
}

async withdrawHistory(req,res,next){
    try{

        let transactions= await Transaction.find({userId:req._id,type:'withdraw'}).lean();
        return res.success({transactions},"User's transaction fetched successfully");

    }catch(err){
        console.log(err);
        return next(err);
    }
}

async quizHistory(req,res,next){
    try{

        let quizs= await Game.find({userId:req._id}).lean();
        return res.success({quizs},"User's quizs fetched successfully");

    }catch(err){
        console.log(err);
        return next(err);
    }
}


 async  Test(req, res, next) {
        try {
            return res.success({  });
        } catch (err) {
            return next(err);
        }
 }

 async AboutUs(req, res) {
        return res.render('about-us', {});
 }

 async Privacy(req, res) {
        return res.render('privacy', {});
 }

 async Faq(req, res) {
    return res.render('faq', {});
}

 async slideList(req,res,next){
    try{

        let slides=[{slide:'profile/emp.jpeg'},{slide:'profile/emp.jpeg'}]
        return res.success({slides},"Slides List");

    }catch(err){
        return next(err);
    }
 }

 async addBalance(req,res,next){
    try{
        let{userId,balance}=req.body;

        const addWallet=new Wallet({
            userId,
            balance
        })

       await addWallet.save();

       return res.success({ addWallet }, 'Wallet added successfully');

    }catch(err){
        console.error(err);
        return next(err);

    }
 }

    async Balance(req, res, next) {
        try {
            let { balance } = req.body;
            let wallet = await Wallet.findOne({ userId: req._id })
            if (wallet) {
                wallet.balance += Number(balance);
                wallet.deposit += Number(balance);
                wallet.userId = req._id;
            } else {
                wallet = new Wallet({
                    balance: Number(balance),
                    deposit: Number(balance),
                    userId: req._id
                })
            }

            await wallet.save();
            return res.success({ wallet }, 'Wallet added successfully');

        } catch (err) {
            console.error(err);
            return next(err);
        }
    }

 async myWallet(req, res, next) {
    try {
      let wallet = await Wallet.findOne({
        userId: req._id
       
      })

      if (wallet) {
        return res.success({ wallet }, "wallet found")

      } else {
        return res.notFound({},"wallet not found")
      }


    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async addGame(req,res,next){
    try{
        let{gameName,isCompleted,amount,schedule,entrance}=req.body;

        const game=new Game({
            gameName,
            isCompleted,
            amount,
            schedule,
            entrance
        })

       await game.save();

       return res.success({ game }, 'game added successfully');

    }catch(err){
        console.error(err);
        return next(err);

    }
 }

 async addBank(req,res,next){
    try{
        let{bank_name,account_holder,account_number,ifsc}=req.body;

        let bank = new Bank({
            userId:req._id,
            bank_name,
            account_holder,
            account_number,
            ifsc   
        })

        await bank.save();

       return res.success({ bank }, 'Bank added successfully');


    }catch(err){
        console.log(err);
        return next(err);
    }
 }

 async getBank(req,res,next){
    try{

        let bank =await Bank.findOne({userId:req._id});

        if(bank){
            return res.success({bank},"Bank found successfully");
        }

        return res.notFound({},"Bank not found");

    }catch(err){
        console.log(err);
        return next(err);
    }
 }



    

}

module.exports = new UserController()
async function updateDefaultAddress(userId, session) {
    await Address.updateMany({ userId }, { default: false }, { session });
}

function parseFormAsync(form, req) {
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve({ fields, files });
            }
        });
    });
}