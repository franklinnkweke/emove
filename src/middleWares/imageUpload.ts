import multer from "multer";
// import { Request, Response } from "express";



// const storage = multer.diskStorage({
//     destination: function (req: Request, file: Express.Multer.File, cb) {
//         cb(null, './assets/uploads');
//     },
//     filename: function (req: Request, file: Express.Multer.File, cb) {
//         cb(null, `${Date.now()}--${file.originalname}`);
//     }
// });

export const Upload = multer({ dest: 'uploads/' }).single("image")