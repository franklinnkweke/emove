import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;

const JWT_SECRET = process.env.JWT_SECRET;

const DB_URI = process.env.DB_URI;

const EMAIL = process.env.EMAIL;

const PASSWORD = process.env.PASSWORD;

const SALT = process.env.SALT;

const VERIFYURL = process.env.VERIFYURL;

const RESETURL = process.env.RESETURL;

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const GOOGLE_REDIRECT = process.env.GOOGLE_REDIRECT;
const APP_URL = process.env.APP_URL;
console.log("PORT1: ", PORT);
console.log("ENV: ", PORT, JWT_SECRET, DB_URI, EMAIL, PASSWORD, SALT, VERIFYURL, GOOGLE_REDIRECT);

export { PORT, JWT_SECRET, DB_URI, EMAIL, PASSWORD, SALT, VERIFYURL , RESETURL, PAYSTACK_SECRET_KEY, GOOGLE_REDIRECT, APP_URL};
