import mongoose from "mongoose";
import express from "express";
import user from "./models/user.js";
import { userSort, createRoomName, returnPage } from './public/javascripts/functions.js';
import passport from "passport";
import localStrategy from "passport-local";
import expressSession from "express-session";
import flash from "connect-flash";
import { Server } from "socket.io";
import { createServer } from "node:http";
import globalChat from "./models/global.js";
import homeChat from "./models/home.js";
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import device from 'express-device';
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
dotenv.config();


mongoose.connect('mongodb://127.0.0.1:27017/GradLink')
    .then(() => console.log('Connected to MongoDB locally!'))
    .catch((err) => console.error('Failed to connect to MongoDB:', err));

const app = express();
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {},
});
const PORT = 3000;

let onlineUsers = [];

app.set("view engine", "ejs");


app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.use(flash());
app.use(device.capture());

////////////////////////////////////////////////////////////
passport.use(new localStrategy(user.authenticate()));
app.use(
    expressSession({
        resave: false,
        saveUninitialized: true,
        secret: "hey",
        cookie: { secure: false, maxAge: 86400000 }
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

//////////////////////////////////////////////////////////////////////


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/uploads');
    },
    filename: function (req, file, cb) {
        const uniquename = uuidv4();
        cb(null, uniquename + path.extname(file.originalname));
    }

});

const upload = multer({ storage });

//////////////////////////////////////////////////////////////////////


app.get("/", (req, res) => {
    res.render("start.ejs");
});

app.get("/register", (req, res) => {
    res.render("register.ejs", { existsError: req.flash("error") });
});

app.post("/register", (req, res, next) => {
    const userData = new user({
        username: req.body.username,
        password: req.body.password,
        fullname: req.body.fullname,
    });
    console.log(req.body);
    user.register(userData, req.body.password, (err) => {
        if (err) {
            // If the error is due to a duplicate username
            if (err.name === "UserExistsError") {
                req.flash("error", "Username already exists.");
                return res.redirect("/register");
            }
        }
        // Registration successful
        passport.authenticate("local")(req, res, () => {
            res.redirect("/home");
        });
    });
});

app.get("/login", (req, res) => {
    res.render("login.ejs", { error: req.flash("error") });
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: true,
}));

app.get("/logout", isLoggedIn, (req, res) => {
    const username = req.session.passport.user;
    res.redirect("/logout/" + username);
});

app.get("/logout/:username", isLoggedIn, (req, res, next) => {

    req.logout((err) => {
        if (err) {
            return next(err);
        }
        onlineUsers.splice(onlineUsers.indexOf(req.params.username), 1);
        res.clearCookie('connect.sid');
        res.redirect("/login");
    });
});



/**************************************************************************************************************************************/
app.get("/profile", isLoggedIn, (req, res) => {
    const username = req.session.passport.user;
    res.redirect("/profile/" + username);
});

app.get("/profile/:username", isLoggedIn, async (req, res) => {
    try {
        if (req.params.username !== req.session.passport.user) {
            res.redirect("/login");
        } else {
            const userDetails = await user.findOne({ username: req.session.passport.user })
            res.render("profile.ejs", {
                profileImage: userDetails.profileImage,
                username: userDetails.username,
                fullname: userDetails.fullname,
                noOfFrds: userDetails.friends.length,
                description: userDetails.description
            });
        }
    }
    catch (err) {
        console.log(err);
    }

});

app.post('/profileupload', isLoggedIn, upload.single("image"), async (req, res, next) => {
    const userDetails = await user.findOne({ username: req.session.passport.user })
    userDetails.profileImage = req.file.filename;
    await userDetails.save();
    res.redirect("/profile");

});

app.post("/description", isLoggedIn, async (req, res) => {
    try {
        const desc = req.body.description;
        await user.updateOne(
            { username: req.session.passport.user },
            { description: desc }
        );
        res.redirect("/profile");
    }
    catch (err) {
        console.log(err);
    }
});

app.get("/view-profile/:username", async (req, res) => {
    try {
        const userDetails = await user.findOne({ username: req.params.username })
        let from = req.query.From;
        if (from === undefined) {
            from = "home";
        }

        res.render("viewProfile.ejs", {
            location: from,
            profileImage: userDetails.profileImage,
            username: userDetails.username,
            fullname: userDetails.fullname,
            noOfFrds: userDetails.friends.length,
            description: userDetails.description
        });

    }
    catch (err) {
        console.log(err);
    }

});

/**************************************************************************************************************************************/

app.get("/home", isLoggedIn, (req, res) => {
    const username = req.session.passport.user;
    const searchName = req.query.search;
    let redirectUrl = "/home/" + username;
    if (searchName !== undefined) {
        redirectUrl += "?search=" + searchName;
    }
    res.redirect(redirectUrl);
});

app.get("/home/:username", isLoggedIn, async (req, res) => {
    try {
        const searchQuery = req.query.search;

        if (req.params.username !== req.session.passport.user) {
            res.redirect("/login");
        }
        else {
            //Username of Friends of the client
            let friendsListList = await user.find(
                { username: req.params.username },
                { _id: 0, friends: 1 }
            );
            let friendsList = friendsListList[0].friends;

            //Details of each friend of client
            let friendDetailsList = await user.find(
                { username: { $in: friendsList } },
                { _id: 0, username: 1, fullname: 1, profileImage: 1 }
            );

            //To filter friendlist according to search
            if (searchQuery !== undefined && searchQuery !== '') {
                friendDetailsList = friendDetailsList.filter(user => user.fullname.includes(searchQuery));
            }

            res.render("home" + returnPage(req.device.type), {
                friendDetailsList: friendDetailsList,
                username: req.session.passport.user
            });
        }
    }
    catch (err) {
        console.log(err);
    }

});


/**************************************************************************************************************************************/

app.get("/addUser", isLoggedIn, (req, res) => {
    const username = req.session.passport.user;
    const searchName = req.query.search;
    let redirectUrl = "/addUser/" + username;
    if (searchName !== undefined) {
        redirectUrl += "?search=" + searchName;
    }
    res.redirect(redirectUrl);
});

app.get("/addUser/:username", isLoggedIn, async (req, res) => {
    try {
        const searchQuery = req.query.search;

        if (req.params.username !== req.session.passport.user) {
            return res.redirect("/login");
        }
        else {
            //All existing users details except the client
            let existingUserList = await user.find(
                { username: { $ne: req.params.username } },
                { _id: 0, username: 1, fullname: 1, profileImage: 1 }
            );

            //Usernames of Friends of the client
            let friendsList = await user.find(
                { username: req.params.username },
                { _id: 0, friends: 1 }
            );

            let sortedUserList = userSort(friendsList, existingUserList);

            //To filter sorted Users according to search
            if (searchQuery !== undefined && searchQuery !== '') {
                sortedUserList = sortedUserList.filter(user => user.username.includes(searchQuery));
            }

            //To find all recieved requests
            let requestReceived = await user.find(
                { username: req.session.passport.user },
                { _id: 0, reqReceived: 1 }
            )
            let reqReceivedList = requestReceived[0].reqReceived;

            //Details of each reqReceived 
            let reqReceivedDetailsList = await user.find(
                { username: { $in: reqReceivedList } },
                { _id: 0, username: 1, fullname: 1, profileImage: 1 }
            );

            //List of send requests
            let requestSend = await user.find(
                { username: req.session.passport.user },
                { _id: 0, reqSend: 1 }
            )
            let reqSendList = requestSend[0].reqSend;

            //fetch btnState
            let btnState = await user.find(
                { username: req.session.passport.user },
                { _id: 0, addUserBtnState: 1 }
            )

            res.render("addUser" + returnPage(req.device.type), {
                btnState: btnState[0].addUserBtnState,
                reqReceivedList: reqReceivedList,
                reqSendList: reqSendList,
                reqReceivedDetails: reqReceivedDetailsList,
                existingUsers: sortedUserList,
                friendsList: friendsList
            });
        }
    }
    catch (err) {
        console.log(err);
    }
});

app.post('/submit-data', async (req, res) => {
    const { btnState } = req.body;
    try {
        await user.updateOne(
            { username: req.session.passport.user },
            { addUserBtnState: btnState }
        )
    }
    catch (err) {
        console.log(err);
    }
});

app.post("/addFriend/:newFriendName", isLoggedIn, async (req, res) => {
    try {
        const myUsername = req.session.passport.user;
        const frdUsername = req.params.newFriendName;
        await user.updateOne(
            { username: myUsername },
            { $push: { reqSend: frdUsername } }
        );

        await user.updateOne(
            { username: frdUsername },
            { $push: { reqReceived: myUsername } }
        );

        res.redirect("/addUser");
    }
    catch (err) {
        console.log(err);
    }
});

app.post("/reqAccepted/:acceptedFriendName", isLoggedIn, async (req, res) => {
    try {
        const myUsername = req.session.passport.user;
        const frdUsername = req.params.acceptedFriendName;
        await user.updateOne(
            { username: myUsername },
            { $push: { friends: frdUsername }, $pull: { reqReceived: frdUsername } }
        );

        await user.updateOne(
            { username: frdUsername },
            { $push: { friends: myUsername }, $pull: { reqSend: myUsername } }
        );

        res.redirect("/addUser");
    }
    catch (err) {
        console.log(err);
    }
});

app.post("/reqDeclined/:refusedFriendName", isLoggedIn, async (req, res) => {
    try {
        const myUsername = req.session.passport.user;
        const frdUsername = req.params.refusedFriendName;

        await user.updateOne(
            { username: myUsername },
            { $pull: { reqReceived: frdUsername } }
        );

        await user.updateOne(
            { username: frdUsername },
            { $pull: { reqSend: myUsername } }
        );

        res.redirect("/addUser");
    }
    catch (err) {
        console.log(err);
    }
});

app.post("/removeFriend/:oldFriendName", isLoggedIn, async (req, res) => {
    try {
        const myUsername = req.session.passport.user;
        const frdUsername = req.params.oldFriendName;
        await user.updateOne(
            { username: myUsername },
            { $pull: { friends: frdUsername } }
        );
        await user.updateOne(
            { username: frdUsername },
            { $pull: { friends: myUsername } }
        )
        res.redirect("/addUser");
    }
    catch (err) {
        console.log(err);
    }
});

/****************************************************************************************************************************************/

app.get("/global", isLoggedIn, (req, res) => {
    const username = req.session.passport.user;
    res.redirect("/global/" + username);
});

app.get("/global/:username", isLoggedIn, async (req, res) => {
    try {
        if (req.params.username !== req.session.passport.user) {
            res.redirect("/login");
        }
        else {
            //All online users details
            let onlineUsersList = await user.find(
                { username: { $in: onlineUsers } },
                { _id: 0, username: 1, fullname: 1, profileImage: 1 }
            );

            res.render("global" + returnPage(req.device.type), {
                online: onlineUsers.length,
                onlineUsersList: onlineUsersList,
                username: req.session.passport.user
            });
        }
    }
    catch (err) {
        console.log(err);
    }

});


/*************************************************   Home Chat   **********************************************************************************/
io.on('connection', async (socket) => {

    let roomName;

    // Leave all rooms
    socket.on('leave all rooms', async () => {
        const rooms = Object.keys(socket.rooms);
        rooms.forEach(room => {
            if (room !== socket.id) { // Exclude the default room (socket.id)
                socket.leave(room);
            }
        });
    });

    socket.on("Join Home Room", async (myUsername, frdUsername) => {
        roomName = createRoomName(myUsername, frdUsername);
        socket.join(roomName);
        console.log(roomName);


        try {
            const messages = await homeChat.find({ timestamp: { $gt: 0 }, room: roomName });
            messages.forEach(message => {
                socket.emit('Recover home messages', message.text, message.username);
            });
        } catch (e) {
            console.error('Error fetching messages from database:', e);
        }

    });

    socket.on("Home Chat", async (msg, username) => {
        try {

            const homechat = new homeChat({
                room: roomName,
                username: username,
                text: msg
            });
            await homechat.save();

        } catch (err) {
            console.error('Error saving message to database:', err);
        }
        socket.broadcast.to(roomName).emit('Home Chat', msg, username);
    });

});
/**************************************************  Global Chat  **********************************************************************************/
io.on('connection', async (socket) => {
    socket.on('Global Chat', async (msg, username) => {
        try {
            const globalchat = new globalChat({
                username: username,
                text: msg
            });
            await globalchat.save();

        } catch (err) {
            console.error('Error saving message to database:', err);
        }
        socket.broadcast.emit('Global Chat', msg, username);
    });

    if (!socket.recovered) {
        try {
            const messages = await globalChat.find({ timestamp: { $gt: 0 } });
            messages.forEach(message => {
                socket.emit('Recover global messages', message.text, message.username, message._id);
            });
        } catch (e) {
            console.error('Error fetching messages from database:', e);
        }
    }
});

//////////////////////////////////////////////

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        if (!onlineUsers.includes(req.session.passport.user)) {
            onlineUsers.push(req.session.passport.user);
        }
        return next();
    }
    res.redirect("/login");
}

server.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
})