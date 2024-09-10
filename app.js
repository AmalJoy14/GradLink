import mongoose from "mongoose";
import express from "express";

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("start.ejs");
});

app.listen(PORT, ()=>{
    console.log(`Listening to port ${PORT}`);
})