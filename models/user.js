import mongoose from "mongoose";
import plm from "passport-local-mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
      },
      profileImage: {
        type: String,
        default : 'noProfileImage.png'
      },
      password: {
        type: String,
        required:true
      },
      fullname: {
        type: String,
        required: true
      },
      friends: [String],
      reqSend: [String],
      reqReceived: [String],

      description : {
        type: String,
        default : 'Welcome To My Profile'
      },
      addUserBtnState :{
        type: String,
        default: false
      }
});

userSchema.plugin(plm);

const user = mongoose.model("user",userSchema,"user"); //collection
export default user;