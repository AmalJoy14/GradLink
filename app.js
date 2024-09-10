import mongoose from "mongoose";
import express from "express";
import user from "./models/user.js";
import passport from "passport";
import localStrategy from "passport-local";
import expressSession from "express-session";
import flash from "connect-flash";
import cookieParser from "cookie-parser";
import device from 'express-device';


mongoose.connect('mongodb://127.0.0.1:27017/GradLink')
    .then(() => console.log('Connected to MongoDB locally!'))
    .catch((err) => console.error('Failed to connect to MongoDB:', err));

const app = express();
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


            res.render("home", {
                username: req.session.passport.user
            });
        }
    }
    catch (err) {
        console.log(err);
    }

});

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

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        if (!onlineUsers.includes(req.session.passport.user)) {
            onlineUsers.push(req.session.passport.user);
        }
        return next();
    }
    res.redirect("/login");
}

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
})