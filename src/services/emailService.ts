import nodemailer from 'nodemailer';
import jwt from "jsonwebtoken";
import { JWT_SECRET, EMAIL, PASSWORD, VERIFYURL, RESETURL } from "../env";

const userName = EMAIL;
const password = PASSWORD;
const secret = JWT_SECRET as string;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: userName,
        pass: password
    }
});

//please use the url for user authentication
//add JWT token


//  const mailOptions = {
//         from: "E-move App",
//         to: email,
//         subject: "E-move Account Verification",
//         text: `Please click on the link below to verify your account`,
//         html: `<b>Please click on the link below to verify your account</b><br/>${VERIFYURL}${token}
//         `
//     }



export const sendMail = (email: string, data:{subject: string, text: string, html: string, from?: string }) =>{
    const mailOptions = {
        from: data.from || "E-move App",
        to: email,
        subject: data.subject,
        text: data.text,
        html: data.html 
    }
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent:'+ info.response);
        }
    })
}

// export default sendMail;