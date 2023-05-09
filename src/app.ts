import express from 'express';
import session from "express-session";
import passport from "passport";
import { route  as userRouter } from './routes/userRoutes';
import { route  as adminRouter } from './routes/adminRoutes';
import { route  as routeRouter } from './routes/routeRoutes';
import { route as googleRoute } from "./api/googleAuth";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { googleAuthLogin } from "./controllers/userController";
// import mongoose, { ConnectOptions } from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
// import bodyParser from 'body-parser';
import { GOOGLE_REDIRECT, APP_URL } from "./env";


//import databaseConnection from "./config/config";

dotenv.config();
const app = express();
app.use(express.json());    
// app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
// app.use(bodyParser.json({limit: "10mb"}));

app.use(session({
    secret: 'Emove',
    resave: false,
    saveUninitialized: false
  }));

app.use(express.json());
app.use(express.urlencoded());
app.use(passport.initialize());
app.use(passport.session());


// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));



app.use(cors({
    origin: '*',
}))

app.use(morgan('combined'));

//databaseConnection();

//check start
passport.use(new GoogleStrategy({
    clientID: '438019500256-bedaq8kmin6s0inlm66s7tge856fkq8k.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: `${APP_URL}google`
  },
  async function(accessToken, refreshToken, profile, done) {
    console.log("here")
    console.log("profile: ", profile);
    const result = await googleAuthLogin(`${profile.emails![0].value}`);
    // const newProfile = {
    //     ...profile,
    //     token: "my-token",
    // }
    //check if user exists in the database
    //if user exists in the database create token and send
    return done(null, result);
  }
));

passport.serializeUser(function(user:any, done) {
  done(null, user);
});

passport.deserializeUser(function(user:any, done) {
  done(null, user);
});

app.get('/auth/google', function (req,res, next){
    console.log("GOOGLE_REDIRECT: ", GOOGLE_REDIRECT)
    console.log(`Loading API library`);
    next();
},
  passport.authenticate('google', { scope: ['profile', 'email'] }));


app.get('/google', function(req, res, next) {
    console.log('Handling Google callback URL...');
    next();
  },
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req:any, res) {
    // Successful authentication, redirect home.
    
    
    console.log("details", req.user);
    const details = req.user;

    const token = details.token;
    const dateOfBirth = details.user.dateOfBirth;
    const driverStatus = details.user.driverStatus;
    const email = details.user.email;
    const firstName = details.user.firstName;
    const gender = details.user.gender;
    const isVerified = details.user.isVerified;
    const lastName = details.user.lastName;
    const password = details.user.password;
    const roles = details.user.roles[0];
    const wallet_balance = details.user.wallet_balance;
    const routeOfOperation = details.user.routeOfOperation;
    const _id = details.user._id;
    console.log("GOOGLE_REDIRECT: ", GOOGLE_REDIRECT)
    //https://emove-teamc.netlify.app/#
    //${GOOGLE_REDIRECT}/#/auth/google
    res.redirect(`${GOOGLE_REDIRECT}#/auth/google/?token=${token}&dateOfBirth=${dateOfBirth}&driverStatus=${driverStatus}&email=${email}&firstName=${firstName}&gender=${gender}&isVerified=${isVerified}&lastName=${lastName}&password=encrypted&roles=${roles}&wallet_balance=${wallet_balance}&routeOfOperation=${routeOfOperation}&_id=${_id}`);
    // return res.status(200).json({message: "Success"})
  });
  //http://localhost:3000/#/auth/google

//check end

app.use("/v1/admin", adminRouter);
app.use("/v1/users", userRouter);
app.use("/v1/routes", routeRouter);
app.use("/auth/google", googleRoute);

export { app };