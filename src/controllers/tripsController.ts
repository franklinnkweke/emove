import { Request, Response } from "express";
import { JWT_SECRET } from "../env";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  getAllTripsForAdmin,
  getAllTripsForPassenger,
} from "../services/tripServices";
import {
  doesUserExist,
  updateUserRecordWithEmail,
} from "../services/userService";
import Trip from "../models/tripModel";
import { routeExists } from "../services/routeService";
import Transaction from "../models/transactionModel";

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

export interface NewRequest extends Request {
  user?: UserDataType;
}

export interface JwtResult extends JwtPayload {
  id?: string;
}
export const getTripsController = async (req: NewRequest, res: Response) => {
  //authenticate user

  const { authorization } = req.headers;
  let token;
  authorization ? (token = authorization.split(" ")[1]) : (token = undefined);

  jwt.verify(`${token}`, `${JWT_SECRET}`, async (err, result: any) => {
    if (err) {
      console.log("Error: ", err);
      return res.status(400).json({
        message: "Bad request",
        data: err,
      });
    }
    const email = result?.email;
    // console.log("result: ", result);
    if (!email) {
      return res.status(400).json({
        message: "Bad request",
      });
    }
    const userDetails = (await doesUserExist({ email: email })) as UserDataType;
    // console.log("userDetails: ", userDetails);
    const id = userDetails?._id;

    if(!userDetails){
      return res.status(400).json({
        message: "Bad request",
      });
    }
    if (userDetails && userDetails.roles?.includes("admin")) {
      const tripCollections = await getAllTripsForAdmin();
      return res.status(200).json({
        message: "success",
        data: tripCollections,
      });
    }
    if (userDetails && userDetails.roles?.includes("passenger")) {
      const tripCollection = await getAllTripsForPassenger(`${id}`);
      console.log("tripCollection", tripCollection);
      return res.status(200).json({
        message: "success",
        data: tripCollection,
      });
    }
    return res.status(500).json({
      message: "Internal Server Error",
    });
  });
};

export const createTrip = async (data: {}) => {
  const trip = new Trip(data);
  return trip
    .save()
    .then((data: any) => {
      return data;
    })
    .catch((err: any) => {
      console.log("Error: ", err);
      return false;
    });
};

export const BookAtrip = async (req: Request, res: Response) => {
  //get user id
  const { userId, routeId } = req.body;
  //get route id
  // const { routeId } = req.params;

  console.log("Details: ", routeId, userId);
  console.log("req body: ", req.body);
  console.log("Details: ", typeof(routeId), typeof(userId));

  if(typeof userId !== "string" || typeof routeId !== "string"){
    return res.status(404).json({
      message: "Bad Request",
    });
  }

  //check if user exists
  const userExist = (await doesUserExist({ id: userId })) as UserDataType;
  if (!userExist) {
    return res.status(404).json({
      message: "User does not exist",
    });
  }

  //check if route exists
  const doesRouteExist = await routeExists(routeId);

  if (!doesRouteExist) {
    return res.status(404).json({
      message: "Route does not exist",
    });
  }
  //create trip
  const tripDetails = {
    userId: userId,
    routeId: routeId,
    status: false,
    price: doesRouteExist.price,
    completed: false
  };

  const newTrip = await Trip.create(tripDetails);

  if (!newTrip) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }

  if (userExist.wallet_balance! && userExist.wallet_balance! < newTrip.price) {
    return res.status(400).json({
      message: "Insufficient balance",
    });
  }

  const updatedUserInfo = {
    wallet_balance: userExist.wallet_balance! - newTrip.price,
  };

  const updatedUser = await updateUserRecordWithEmail(
    userExist.email!,
    updatedUserInfo
  );

  // //create transaction

  const transaction = await Transaction.create({
    userId: userExist._id,
    tripId: newTrip._id,
    amount: newTrip.price,
    status: "success",
    transactionType: "debit",
  });

  await Trip.findByIdAndUpdate(newTrip._id, { trxn_ref: transaction._id});
  return res.status(201).json({
    message: "Trip created successfully",
    trip: newTrip,
  });
};
