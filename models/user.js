import mongoose from "mongoose";
import plm from "passport-local-mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
      },
      password: {
        type: String,
        required:true
      },
      fullname: {
        type: String,
        required: true
      },
      
});

userSchema.plugin(plm);

const user = mongoose.model("user",userSchema,"user"); //collection
export default user;