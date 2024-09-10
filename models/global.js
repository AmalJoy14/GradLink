import mongoose from "mongoose";
import plm from "passport-local-mongoose";

const globalMessagesSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  });

  globalMessagesSchema.plugin(plm);

  const globalChat = mongoose.model("Global Chat",globalMessagesSchema,"Global Chat"); //collection
  export default globalChat ;