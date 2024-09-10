import mongoose from "mongoose";
import express from "express";

const app = express();
const PORT = 3000;



app.set("view engine", "ejs");

app.use(express.static('public'));


app.get("/", (req, res) => {
    res.render("start.ejs");
});

app.get("/home", (req,res) =>{
    res.render("login.ejs");
})

app.listen(PORT, ()=>{
    console.log(`Listening to port ${PORT}`);
})