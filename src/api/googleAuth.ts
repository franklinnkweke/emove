import passport from "passport";
import express, { Router, Request, Response, NextFunction } from "express";
import { Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth20';
import { app } from "../app";
import cors from "cors";

const route = Router();

passport.use(new GoogleStrategy({
    clientID: '438019500256-bedaq8kmin6s0inlm66s7tge856fkq8k.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'https://main--emove-teamc.netlify.app/'
    },
    function(accessToken:any, refreshToken:any, profile:any, done:any) {
    console.log("here")
    console.log("profile: ", profile);
    return done(null, profile);
    }
));
    
passport.serializeUser(function(user, done) {
    done(null, user);
});
    
passport.deserializeUser(function(user:any, done) {
    done(null, user);
});
    
route.get('/auth/google', function (req:Request, res:Response, next:NextFunction){
        console.log(`Loading API library`);
        next();
},
passport.authenticate('google', { scope: ['profile', 'email'] }));
    
    
route.get('/', function(req:Request, res:Response, next: NextFunction) {
    console.log('Handling Google callback URL...');
    next();
    },
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req: Request, res: Response) {
    // Successful authentication, redirect home.
    console.log("res: ", res);
    // res.redirect('/');

    console.log("details",req.body);
    return res.status(200).json({message: "Success"})
});
 
export { route }