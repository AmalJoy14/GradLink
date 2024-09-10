import mongoose from "mongoose";
import express from "express";
import passport from "passport";
import localStrategy from "passport-local";
import expressSession from "express-session";
import flash from "connect-flash";
import cookieParser from "cookie-parser";
import device from 'express-device';

const app = express();
const PORT = 3000;



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

app.get("/home", (req,res) =>{
    res.render("login.ejs");
})

app.listen(PORT, ()=>{
    console.log(`Listening to port ${PORT}`);
})