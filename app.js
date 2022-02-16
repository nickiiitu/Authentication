require("dotenv").config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const encrypt=require("mongoose-encryption");
const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});

const Usersch=new mongoose.Schema({
email:String,
passward:String
});
Usersch.plugin(encrypt,{secret:process.env.SECRETE, encryptedFields:["passward"]});
const User=mongoose.model("User",Usersch);

app.get("/",function(req,res){
res.render("home");
});

app.get("/login",function(req,res){
res.render("login");
});

app.get("/register",function(req,res){
res.render("register");
});

app.post("/register",function(req,res){
    console.log(req.body.password);
    const user=new User({
        email:req.body.username,
        passward:req.body.password
    });
    user.save(function(err){
        if(!err){
            res.render("secrets");
        }
    });
});

app.post("/login",function(req,res){
const em=req.body.username;
const pas=req.body.password;

User.find({email:em ,passward:pas},function(err,result){
    if(err){
        console.log(err);
    }else{
        res.render("secrets");
    }
})
});
app.listen(3000,function(){
console.log("listen");
});
