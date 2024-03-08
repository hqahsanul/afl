const jwt = require('jsonwebtoken')
const { signJWT, verifyJWT } = require('./utils')
const { generateOtp, randomString, utcDateTime } = require('../lib/util')
const mongoose = require('mongoose')
const { User, Wallet, Address } = require('../db/models/User.model')
var request = require('request');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');


class AuthController {

    async logIn(req, res, next) {
        try {
            const { password, email } = req.body;
            console.log(password,email);

                const user = await User.findOne({ email });

                if (!email) {
                    return res.status(404).json({ message : 'Please provide email' });
                }

                if (!password) {
                    return res.status(400).json({ message : 'Please provide password' });
                }

                if (!user) {
                    return res.status(404).json({ message : 'Not found' });
                }

                if (!user.status) {
                    return res.status(404).json({ message : 'Not verified' });
                }

                const passwordMatch = bcrypt.compareSync(password, user.password);

                if (!passwordMatch) {
                    return res.status(404).json({ message : 'Check password and phone' });
                }


                user.authTokenIssuedAt = utcDateTime().valueOf();
                await user.save();
                const userJson = user.toJSON();
                const jwttoken = signJWT(userJson);


                const { authTokenIssuedAt,otp,resetToken,__v,...data}=userJson;
                delete userJson.password;
                data.jwt = jwttoken;
                
                return res.success({ user: data }, 'Login Success');
                
        } catch (err) {
            console.log(err);
            return next(err);
        }
    }
    
  async generateToken(req, res) {
      let _id = req.params._id;
      const user = await User.findOne({ _id });
      const platform = req.headers['x-hrms-platform'];
      const token = signJWT(user, platform);
      return res.success({
          token
      });
  }
  async logOut(req, res) {
     
      const { user } = req;
      user.authTokenIssuedAt = null;
      user.deviceToken = null;
      await user.save();
      return res.success({}, req.__('LOGOUT_SUCCESS'));
  }
  /**
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   * @returns 
   */
  async verifyOtp(req, res, next) {
      const {otp, email, resetToken,TYPE } = req.body;

      try {

          let user = await User.findOne({email, status: true});

          if(otp&&email&&resetToken&&TYPE){
            return res.status(400).json({message :"Something went wrong"});
          }

          if (!user) {
            return res.status(401).json({message :"UNAUTHORIZED"});
          } else {
              if (user.resetToken == resetToken) {
                  if ((user.otp == otp)) {

                      user.isVerified = true;
                      user.authTokenIssuedAt = utcDateTime().valueOf();
                      let newUser = await user.save();
                      const userJson = newUser.toJSON();
                      const jwttoken = signJWT(user);
                      userJson.jwt = jwttoken;

                      ['password', 'authTokenIssuedAt', 'otp', 'resetToken', '__v'].forEach(key => delete userJson[key]);
                      return res.success({user: userJson,TYPE },'OTP verified');

                  } else {
                    return res.status(401).json({message :'Invalid OTP'});
                  }

              } else {
                  return res.status(401).json({message :"Invalid reset token"});
              }
          }
      } catch (err) {
          return next(err)
      }
  }

  async resendOtp(req, res, next) {
      const { email, resetToken} = req.body;
      try {
          let user = await User.findOne({email, status: true});

          if(email&&resetToken){
            return res.status(400).json({message :"Something went wrong"});
          }

          if (!user) { return res.status(401).json({message :"UNAUTHORIZED"});}
          if (user) {
              if (user.resetToken === resetToken) {
                //   let otp = generateOtp();
                  user.otp = '1234';
                  await user.save();
                  return res.success({resetToken,email}, "OTP sent successfully");

              } else {
                return res.status(401).json({message :"Invalid reset token"});
              }

          }
      } catch (err) {
        console.log(err);
          return next(err)
      }
  }

//   async sendOtp(req, res, next) {
//     const { email,type} = req.body;
//     try {
//         let user = await User.findOne({email});

//         if(!email){
//           return res.status(400).json({message :"Something went wrong"});
//         }

//         if(type==0){

//             if (!user) { 
//                 const resetToken = randomString(12);
//                 user=new User({
//                     email,
//                     otp:'1234',
//                     resetToken
//                 });
//                 await user.save();
//                 return res.success({resetToken}, "OTP sent successfully");
//             }
//             if (user?.isVerified) {
//                     return res.status(401).json({message :"Account already exist, please login"});
//                 } else {
//                     user.otp = '1234';
//                     const resetToken = randomString(12);
//                     user.resetToken=resetToken;
//                     await user.save();
//                     return res.success({resetToken}, "OTP sent successfully");
//                 }
//         }else if(type==1){

//             if(user){
//                 user.otp = '1234';
//                     const resetToken = randomString(12);
//                     user.resetToken=resetToken;
//                     await user.save();
//                     return res.success({resetToken}, "OTP sent successfully");
//             }else{
//                 return res.status(400).json({message :"Account does't exist!"});
//             }

//         }
        

        
//     } catch (err) {
//       console.log(err);
//         return next(err)
//     }
// }


async sendOtp(req, res, next) {
    const { email, type } = req.body;

    try {
        if (!email) {
            return res.error("Email is required");
        }

        let user = await User.findOne({ email });

        if (type === 0) {
            if (!user) {
                const resetToken = randomString(12);
                user = new User({
                    email,
                    otp: '1234',
                    resetToken,
                });
                await user.save();
                return res.success({ resetToken }, "OTP sent successfully");
            }

            if (user?.isVerified) {
                return res.error("Account already exists, please login", 401);
            } else {
                user.otp = '1234';
                const resetToken = randomString(12);
                user.resetToken = resetToken;
                await user.save();
                return res.success({ resetToken }, "OTP sent successfully");
            }
        } else if (type === 1) {
            if (user) {
                user.otp = '1234';
                const resetToken = randomString(12);
                user.resetToken = resetToken;
                await user.save();
                return res.success({ resetToken }, "OTP sent successfully");
            } else {
                return res.error("Account doesn't exist!", 400);
            }
        }
    } catch (err) {
        console.error(err);
        return next(err);
    }
}


async getRef(req, res, next) {
    const { inviteCode} = req.body;
    try {
        // let user = await User.findOne({inviteCode});

        // if(!inviteCode){
        //   return res.status(400).json({message :"Something went wrong"});
        // }

        // if (!user) { 
        //     return res.status(400).json({message :"NOT FOUND", isFound:false});
        // }
        // if (user&&user?.status) {
        //     const name=`${user.first_name} ${user.last_name}`
        //         return res.status(200).json({message :"Name found",name });
        //     } else {
        //         return res.status(400).json({message :"NOT FOUND", isFound:false});
        //     }
        return res.status(200).json({message :"Name found",name:"naRefme" });
    } catch (err) {
      console.log(err);
        return next(err)
    }
}


  /**
   * 
   * @param {email,password,deviceToken,deviceType} req 
   * @param {*} res 
   * @param {*} next 
   */

async  signup(req, res, next) {
    const { first_name,last_name,email,mobile,password,cnf_password,refferBy,resetToken,refferByName,otp } = req.body;
    try {
        console.log("------------Body", first_name,last_name,email,mobile,password,cnf_password,resetToken,otp,refferByName)
        if(first_name &&last_name&&email&&mobile&&password&&cnf_password&&resetToken&&otp){

            let user = await User.findOne({email});

            if (user) {
                if (!user.isVerified) {
                    if(!(user.otp == otp)||!(user.resetToken == resetToken)) return res.status(401).json({success: false, message : 'Wrong OTP or Reset Token' });
                    const hashedPassword = await bcrypt.hash(password, 10);
    
                    user.first_name = first_name;
                    user.last_name = last_name;
                    user.email = email;
                    user.mobile = mobile;
                    user.password = hashedPassword;
                    user.otp = otp;
                    user.isVerified = true;
                    user.authTokenIssuedAt = utcDateTime().valueOf();
                    if(refferBy) user.refferBy=refferBy;
                    if(refferByName) user.refferByName=refferByName;

                    await user.save();
                    const [userUpdateResult] = await Promise.all([user.save()]);
    
                    const userJson = userUpdateResult.toJSON();
                    const jwtToken = signJWT(userJson);
                    userJson.jwtToken=jwtToken;

                    ['password', 'authTokenIssuedAt', 'otp', 'resetToken', '__v'].forEach(key => delete userJson[key]);
                    return res.success({
                        user: userJson,
                    }, "Registration success!");
                }else {
                    return res.status(403).json({
                        success: false,
                        message : 'Account already registered'
                    });
                }
                
            } else {
                return res.status(403).json({success: false,message : 'Please verify send otp first!'});
            }
        }else{
            console.log("====================?")
            return res.status(400).json({
                success: false,
                message : 'Data missing'
            });
        }

        // const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWE4YjQ1YmEyNDhkMWQ0MTEw'
        // return res.success({ jwt }, 'Login Success');
    
    } catch (err) {
        console.error(err);
        return next(err);
    }
}

  async  forgotPassword(req, res, next) {
    const { email,otp,resetToken,password,cnf_password } = req.body;
    try {
        const user = await User.findOne({email,isVerified: true});

        if (!user) {
            return res.status(401).json({message :"Not registered"});
        } else if (user) {
            const resetToken = randomString(10);
            // const otp = generateOtp();

            user.resetToken = resetToken;
            // user.otp = otp;
            user.authTokenIssuedAt = utcDateTime().valueOf();
            await user.save();

            const options = {
                url: process.env.FAST_URL,
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    authorization: process.env.FAST_KEY
                },
                body: {
                    variables_values: user.otp,
                    route: 'otp',
                   // numbers: mobile
                },
                json: true
            };

            return res.success({ resetToken,email }, "OTP sent successfully");
        }
    } catch (err) {
        return next(err);
    }
}

async resetPassword(req, res, next) {
    const { email,otp,resetToken,password,cnf_password } = req.body;

    try {
        const user = await User.findOne({ email,isVerified:true });

        if (!user) {
            return res.status(401).json({ message : "UNAUTHORIZED" });
        }

        if(!(user.otp==otp)||!(user.resetToken==resetToken)){
            return res.status(401).json({ message : "UNAUTHORIZED" });
        } 

        if (password === cnf_password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
            await user.save();
            return res.success({}, 'Password reset successfully');
        } else {
            return res.status(401).json({ message : "Passwords do not match" });
        }
    } catch (err) {
        return next(err);
    }
}


}

module.exports = new AuthController()



