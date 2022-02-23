require("dotenv").config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
// const bcrypt=require("bcrypt");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy=require("passport-google-oauth20").Strategy;
const findOrCreate=require("mongoose-findorcreate");
//we dont need to require passportlocal module
const app=express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");
// const encrypt=require("mongoose-encryption");
// const md5=require("md5");

// const saltRound=10;

app.use(session({
    secret:"our littel secret.",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});

const Usersch=new mongoose.Schema({
email:String,
passward:String
});
// Usersch.plugin(encrypt,{secret:process.env.SECRETE, encryptedFields:["passward"]});

Usersch.plugin(passportLocalMongoose);
Usersch.plugin(findOrCreate);
const User=mongoose.model("User",Usersch);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


 
passport.use(new GoogleStrategy({
    clientID: process.env.client_id,
clientSecret:process.env.client_secret,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/",function(req,res){
res.render("home");
});

app.get("/login",function(req,res){
res.render("login");
});

app.get("/register",function(req,res){
res.render("register");
});

app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

app.get("/logout",function(req,res){

    req.logout();
    res.redirect("/");
});
app.post("/register",function(req,res){
    // console.log(req.body.password);
    // bcrypt.hash(req.body.password,saltRound,function(err,hash){
    //     const newUser =new User({
    //         email:req.body.username,
    //         passward:hash
    //     });
    //     newUser.save(function(err){
    //         if(err){
    //             console.log(err);
    //         }else{
    //             res.render("secrets");
    //         }
    //     });
    // });
    User.register({username:req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            }
            )}
    })
    
});

app.post("/login",function(req,res){
    
const em=req.body.username;
const pas=req.body.password;

// User.find({email:em},function(err,result){
//     if(err){
//         console.log(err);
//     }else{
//         if(result){
//             bcrypt.compare(pas,result.passward,function(err,results){

//                 if(results){
//                     res.render("secrets");
//                 }
//             });
//         }
//     }
// });

const user =new User({
    username:req.body.username,
    passward:req.body.password
});

req.login(user,function(err){
    if(!err){
        passport.authenticate("local")(req,res,function(){
            res.redirect("/secrets");
        });
    }
})
});
app.listen(3000,function(){
console.log("listen");
});
