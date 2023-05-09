import { Request, Response } from "express";
import { validationResult } from "express-validator";
import request from "request";
import _ from "lodash";
import { sendMail } from "../services/emailService";
import { JWT_SECRET, SALT, EMAIL, PASSWORD, VERIFYURL, RESETURL } from "../env";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/userModel";
import cloudUpload from "../utils/cloudinary";
const { initializePayment, verifyPayment } =
  require("../utils/paystack")(request);

import {
  doesUserExist,
  writeUserToDatabase,
  updateUserRecordWithEmail,
  getAllUsers,
  deleteDriver,
  findDriver,
  getAllUsersCount
} from "../services/userService";

import Transaction from "../models/transactionModel";

import { writeTransactionToDatabase } from "../services/transactionService";


export const defaultController = (_req: Request, res: Response) => {
  res.send("Welcome E-move");
};

interface tokenData {
  email: string;
  token?: any;
}

interface UserDataType {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  dateOfBirth?: string;
  gender?: string;
  roles?: string[];
  driverStatus?: string;
  isVerified?: boolean;
  routeOfOperation?: [];
  phoneNumber?: string;
  accountNumber?: string;
  validID?: string;
  photo?: string;
  wallet_balance?: number;
}

interface TransactionDataType {
  status?: string;
  transactionType?: string;
  userId?: string;
  referenceId?: string;
  amount?: number;
}

const secret = JWT_SECRET as string;

export const signUp = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  //no validation errors
  const { firstName, lastName, email, password, dateOfBirth, gender } =
    req.body;
  //check if user exists
  const userExists = await doesUserExist({ email });
  if (userExists) {
    return res.status(400).json({ errors: [{ msg: "User already exists" }] });
  }
  const hashedPassword = await bcrypt.hashSync(password, Number(`${SALT}`));
  const newUser = {
    firstName,
    lastName,
    email,
    password: hashedPassword,
    dateOfBirth,
    gender,
    isVerified: false,
  };

  //write the new user to the database
  const User = await writeUserToDatabase(newUser);

  if (!User) {
    return res
      .status(400)
      .json({ errors: [{ msg: "User could not be created" }] });
  }

  const token = jwt.sign(email, secret);
  const messageData = {
    from: "E-move App",
    to: email,
    subject: "E-move Account Verification",
    text: `Please click on the link below to verify your account`,
    html: `<b>Please click on the link below to verify your account</b><br/>${VERIFYURL}${token}
        `,
  };

  //user created successfully
  //send email notification
  try {
    sendMail(email, messageData);
    return res.status(201).json({
      User,
      message: "User created successfully",
      token,
      success: true,
    });
  } catch (error) {
    return res.status(201).json({
      User,
      message: "Email could not be sent",
      success: false,
    });
  }
};

//verify email
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.params;
  console.log(`Verifying email`);
  console.log(`token: ${token}`);
  const verifyToken = jwt.verify(token, secret) as string;
  console.log(`verifyToken: ${verifyToken}`);
  if (!verifyToken) {
    return res.status(400).json({ message: "Invalid token" });
  }
  const user = (await doesUserExist({ email: verifyToken })) as UserDataType;
  if (!user) {
    return res.status(400).json({ message: "Invalid email address" });
  }
  const newUser = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: user.password,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    isVerified: true,
  };
  const updateUser = updateUserRecordWithEmail(verifyToken, newUser);

  if (!updateUser) {
    //please retry
    return res.status(500).json({ message: "Please try again" });
  }
  return res.status(200).json({ message: "Account verified" });

  //change password
  //change password
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    //get password from request body
    const { password, newPassword, confirmPassword } = req.body;
    //hashed password
    const hashedPassword = await bcrypt.hashSync(
      newPassword,
      Number(`${SALT}`)
    );
    //check if user exists
    const userExists = (await doesUserExist({
      email: req.body.email,
    })) as UserDataType;
    if (!userExists) {
      return res.status(400).json({ errors: [{ msg: "User does not exist" }] });
    }

    //check if password is correct
    // const isPasswordCorrect = bcrypt.compareSync(
    //   password,
    //   userExists.password!
    // );
    //console.log("what is happening");
    if (password !== userExists.password) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Old password is incorrect" }] });
    }
    //check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Passwords do not match" }] });
    }
    const newUser = {
      _id: userExists._id,
      firstName: userExists.firstName,
      lastName: userExists.lastName,
      email: userExists.email,
      password: hashedPassword,
      dateOfBirth: userExists.dateOfBirth,
      gender: userExists.gender,
      isVerified: userExists.isVerified,
    };

    const updateUser = updateUserRecordWithEmail(userExists.email!, newUser);
    if (!updateUser) {
      //please retry
      return res.status(500).json({ message: "Please try again" });
    }
    return res.status(200).json({ message: "Password changed" });
  } catch (error) {
    return res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = (await doesUserExist({ email })) as UserDataType;
  // console.log("user: ", user);
  if (!user) {
    return res.status(400).json({ message: "Invalid email address or password" });
  }

  const isMatch = bcrypt.compareSync(password, user.password!);
  // console.log(isMatch);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid email address or password" });
  }
  if (!user.isVerified) {
    return res.status(400).json({ message: "Please verify your email" });
  }
  const token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: "24h" });
  // console.log("token: ", token)
  return res.status(200).json({ token, user });
};

//googleAuthLogin
export const googleAuthLogin = async (email: string) => {
  let response:any;
  const user = (await doesUserExist({ email })) as UserDataType;
  // console.log("user: ", user);
  if (!user) {
    response = "User does not exist"
  }

  if (!user.isVerified) {
    response = "Please verify your email";
  }
  const token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: "24h" });
  console.log("token: ", token)
  response = {
    token,
    user
  }
  return response;
};

//googleAuthLogin

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await doesUserExist({ email });
  if (!user) {
    return res
      .status(400)
      .json({ message: `User with email: ${email} doesn't exist` });
  }
  const token = jwt.sign(email, secret);
  const messageData = {
    subject: "E-move Reset Password",
    text: `Please click on the link below to reset your password`,
    html: `<b>Please click on the link below to reset your password </b><br/>
        ${RESETURL}${token}`,
  };
  try {
    sendMail(email, messageData);
    return res.status(200).json({
      message: "Reset password email sent",
      success: true,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Reset password email could not be sent",
      success: false,
    });
  }
};

export const resetpassword = async (req: Request, res: Response) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.params;
  console.log("Checkout")
  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "Password and confirm password are not the same" });
  }

  const verifyToken = jwt.verify(token, secret) as Record<string, any>;
  const email = jwt.verify(token, secret) as unknown as string;
  if (!verifyToken) {
    return res.status(400).json({ message: "Invalid token" });
  }

  const user = (await doesUserExist({ email })) as UserDataType;
  console.log("user: ", user);
  console.log("Email: ", verifyToken?.email);
  console.log("verifyToken: ", verifyToken);
  if (!user) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  const hashedNewPassword = await bcrypt.hashSync(password, Number(`${SALT}`));

  const newUserInfo = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: hashedNewPassword,
    //password: password,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    isVerified: user.isVerified,
  };

  const updateUser = updateUserRecordWithEmail(email, newUserInfo);

  if (!updateUser) {
    //please retry
    return res.status(500).json({ message: "Please try again" });
  }
  return res.status(200).json({ message: "Password changed" });
};

export async function getAllUsersCountDetails(req: Request, res: Response){
  const userCount = await getAllUsersCount();
  if(!userCount){
    return res.status(500).json({
      message: "Internal Server Error"
    })
  }
  return res.status(200).json({
    message: "User Count",
    userCount
  })
}

// export async function addDriver(req: Request, res: Response) {
//   const { fullName, routeOfOperation, phoneNumber, accountNumber, validID, photo } = req.body;
//   let cloudImagePhoto: any;
//   let cloudImageValidID: any;
//   //const photo = req.file?.path;


//   if(!fullName || !routeOfOperation || !phoneNumber || !accountNumber || !validID || !photo){
//     return res.status(400).json({ message: "Bad Request" });
//   }

//   console.log("req body: ",req.body);
//   const token  = req.headers.authorization;
//   console.log("token: ", token);
//   const verifyToken = jwt.verify(`${token}`, `${secret}`) as Record<string, any>;
//   console.log("verifyToken: ", verifyToken);

//   if (!verifyToken) {
//     return res.status(400).json({ message: "Bad Request" });
//   }

//   // const user = (await doesUserExist({ email: verifyToken.email })) as UserDataType;
//   // if (!user) {
//   //   return res.status(400).json({ message: "Cannot make edit" });
//   // }

//   // if (user.roles?.includes("driver")) {
//   //   return res.status(400).json({ message: "Already a driver" });
//   // }

//   // if (user.driverStatus == "verified" || user.driverStatus == "pending") {
//   //   return res
//   //     .status(400)
//   //     .json({ message: "Cannot make request at this moment" });
//   // }

//   // if (
//   //   (!photo && !validID && !phoneNumber) ||
//   //   (!user.photo && !user.validID && !user.phoneNumber)
//   // ) {
//   //   return res
//   //     .status(400)
//   //     .json({ message: "All fields are required to be a driver" });
//   // }

//   cloudImagePhoto = await cloudUpload.uploader.upload(photo!, {
//     folder: "emove/photos",
//   });

//   cloudImageValidID = await cloudUpload.uploader.upload(validID, {
//     folder: "emove/validID",
//   });

//   const driverUserInfo = {
//     fullName,
//     routeOfOperation,
//     phoneNumber,
//     accountNumber,
//     driverStatus: "pending",
//     photo: {
//       public_id: cloudImagePhoto!.public_id,
//       url: cloudImagePhoto.secure_url,
//     },
//     validID: {
//       public_id: cloudImageValidID.public_id,
//       url: cloudImageValidID.secure_url,
//     },
//   };

//   //write driver to db
//   const updateUser = updateUserRecordWithEmail(verifyToken.email, updatedUserInfo);

//   if (!updateUser) {
//     //please retry
//     return res.status(500).json({ message: "Please try again" });
//   }
//   return res.status(200).json({ message: "Driver added" });
// }

export async function editDriver(req: Request, res: Response) {
  const { id } = req.params;
  const { routeOfOperation, accountNumber, photo, validID } = req.body;
  let cloudImagePhoto: any;
  let cloudImageValidID: any;

  const user = (await doesUserExist({ id })) as UserDataType;

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  if (!user.roles?.includes("driver")) {
    return res.status(400).json({ message: "Not a" });
  }

  if (photo) {
    cloudImagePhoto = await cloudUpload.uploader.upload(photo!, {
      folder: "emove/photos",
    });
  }

  if (validID) {
    cloudImageValidID = await cloudUpload.uploader.upload(validID, {
      folder: "emove/validID",
    });
  }

  const updatedUserInfo = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: user.password,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    isVerified: user.isVerified,
    phoneNumber: user.phoneNumber,
    accountNumber: !accountNumber ? user.accountNumber : accountNumber,
    driverStatus: user.driverStatus,
    photo: !photo
      ? user.photo
      : {
          public_id: cloudImagePhoto!.public_id,
          url: cloudImagePhoto.secure_url,
        },
    validID: !validID
      ? user.validID
      : {
          public_id: cloudImageValidID.public_id,
          url: cloudImageValidID.secure_url,
        },
  };

  const updateUser = updateUserRecordWithEmail(user.email!, updatedUserInfo);

  if (!updateUser) {
    //please retry
    return res.status(500).json({ message: "Please try again" });
  }
  return res
    .status(200)
    .json({ message: "Update successful", data: updateUser });
}
// GET AND DELETE DRIVERS................................
export const deleteDriverController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await deleteDriver(id);
  console.log(user);
  if (!user) {
    return res.status(400).json({ message: "No user found" });
  }
  return res.status(200).json({ user });
};

export const getOneDriverController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const driver = await findDriver(id);

  if (!driver) {
    return res.status(400).json({ message: "No driver found" });
  }
  return res.status(200).json({ driver });
};

// export const getAllDriversController = async (req: Request, res: Response) => {
//   const users = await getAllUsers();
//   if (!users) {
//     return res.status(400).json({ message: "No user found" });
//   }
//   const drivers = users.filter((user) => user.roles.includes("driver"));
//   if (!drivers) {
//     return res.status(400).json({ message: "No driver found" });
//   }
//   return res.status(200).json({ drivers });
// };

export const getTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.find({
      userId: req.params.userId,
    }).sort({createdAt: -1});
    res.status(200).json({ message: "success", transaction: transaction });
  } catch (error) {
    res.send({
      status: "An error occured",
      message: "Data not found",
    });
  }
};

export const fundWalletController = async (req: Request, res: Response) => {
  let form = _.pick(req.body, ["amount", "email", "full_name", "metadata", "callback_url"]);
  // const { amount, email, full_name } = req.body
  // const form = {amount, email, full_name}
  console.log(form);

  form.metadata = {
    full_name: form.full_name,
  };
  console.log(form.metadata);
  form.amount *= 100;
  form.callback_url = `${process.env.PAYSTACK_CALLBACK}`;

  console.log("form callback_url: ", form.callback_url)

  initializePayment(form, (error: any, body: any) => {
    if (error) {
      //handle errors
      console.log(error);
      return;
    }
    let response = JSON.parse(body);
    res.send(response);
    //res.redirect(response.data.authorization_url);
  });
};

export const payStackCallback = async (req: Request, res: Response) => {
  const ref = req.query.reference;
  console.log(ref);
  verifyPayment(ref, async (error: any, body: any) => {
    if (error) {
      //handle errors appropriately
      console.log(error);
      return res.redirect("/error");
    }
    let response = JSON.parse(body);
    console.log("response", response);
    const data = _.at(response.data, [
      "reference",
      "amount",
      "customer.email",
      "metadata.full_name",
      "status",
    ]);
    console.log(data);

    const [reference, amount, email, full_name, status] = data;

    const user = (await doesUserExist({ email })) as UserDataType;

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (status !== "success") {
      const newTransaction = {
        status: "failed",
        transactionType: "credit",
        userId: user._id,
        referenceId: reference,
        amount: amount / 100,
      };
      const transaction = await writeTransactionToDatabase(newTransaction);
      console.log(transaction);

      if (!transaction) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Transaction could not be created" }] });
      }
    }

    const updatedUserInfo = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      isVerified: user.isVerified,
      phoneNumber: user.phoneNumber,
      accountNumber: user.accountNumber,
      driverStatus: user.driverStatus,
      photo: user.photo,
      validID: user.validID,
      wallet_balance: user.wallet_balance! + amount / 100,
    };

    const newTransaction = {
      status: "success",
      transactionType: "credit",
      userId: user._id,
      referenceId: reference,
      amount: amount / 100,
    };

    const transaction = await writeTransactionToDatabase(newTransaction);

    const updateUser = await updateUserRecordWithEmail(
      user.email!,
      updatedUserInfo
    );

    if (!updateUser && !transaction) {
      //please retry
      return res.status(500).json({ message: "Please try again" });
    }

    return res.status(200).json({ message: "Success", user: updateUser });
  });
};

export const userRecord = async (req: Request, res:Response) => {
  const userId = req.params.id;
  console.log("userId: ", userId)
  if(typeof userId !== "string"){
    return res.status(404).json({
      message: "Bad Request"
    })
  }
  const user = await doesUserExist({ id: userId }) as UserDataType;
  console.log("user: ", user)
  return res.status(200).json({
    message: "user fetched",
    user
  })

}

export const verifyTokenGoogle = async (req: Request, res: Response)=>{
  const token = req.body.token;
  if(!token){
    return res.status(400).json({
      message: "Invalid token"
    })
  }
  const validate = jwt.verify(token, secret);
  if(!validate){
    return res.status(400).json({
      message: "Invalid token"
    })
  }
  return res.status(200).json({
    message: "Valid Token",
    validate
  })
  
}