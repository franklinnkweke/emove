import { check, validationResult } from "express-validator";
import { request, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../env";
import { findAnyUser } from "../services/userService";

interface UserDataType {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  dateOfBirth?: string;
  gender?: string;
  isVerified?: boolean;
  roles?: [string];
}

interface JwtPayload {
  id: string;
}
export interface NewRequest extends Request {
  user?: {};
}

export const signUpAuth = {
  body: [
    check("firstName", "First name is required").not().isEmpty(),
    check("lastName", "Last name is required").not().isEmpty(),
    check("email", "Email is required").not().isEmpty().isEmail(),
    check("gender", "Gender is required").not().isEmpty(),
    check("dateOfBirth", "Date of birth is required").not().isEmpty(),
    check("password", "Password is required and must be more than 5 characters")
      .not()
      .isEmpty()
      .isLength({ min: 6 }),
  ],
};

export const changePasswordAuth = {
  body: [
    check("email", "Email is required").not().isEmpty().isEmail(),
    check("password", "Password is required and must be more than 5 characters")
      .not()
      .isEmpty()
      .isLength({ min: 6 }),
    check(
      "newPassword",
      "New password is required and must be more than 5 characters"
    )
      .custom((value, { req }) => {
        if (value !== req.body.confirmPassword) {
          throw new Error("Password confirmation does not match password");
        }
        return true;
      })
      .custom((value, { req }) => {
        if (value === req.body.password) {
          throw new Error("New password cannot be the same as old password");
        }
        return true;
      }),
    ,
    check("confirmPassword", "Confirm password is required").not().isEmpty(),
  ],
};

export const loginAuth = {
  body: [
    check("email", "Email is required").not().isEmpty().isEmail(),
    check("password", "Password is required and must be more than 5 characters")
      .not()
      .isEmpty()
      .isLength({ min: 6 }),
  ],
};

export const forgotPasswordAuth = {
  body: [check("email", "Email is required").not().isEmpty().isEmail()],
};

export const resetPasswordAuth = {
  body: [
    check("password", "Password is required and must be more than 5 characters")
      .not()
      .isEmpty()
      .isLength({ min: 6 }),
    check(
      "confirmPassword",
      "Password is required and must be more than 5 characters"
    )
      .not()
      .isEmpty()
      //.equals(request.body.password)
      .isLength({ min: 6 }),
  ],
};

export const addDriverValidator = {
  body: [
    check("phoneNumber", "Phone number is required").not().isEmpty(),
    check("accountNumber", "Account Number is required").not().isEmpty(),
    check("validID", "Valid ID is required").not().isEmpty().isEmail(),
    check("photo", "Photo is required").not().isEmpty(),
  ],
};

export const verifyDriverValidator = {
  params: [check("passengerID", "Passenger ID required").not().isEmpty()],
};

export const editDriverValidator = {
  body: [
    check("phoneNumber", "Phone number is required").not().isEmpty(),
    check("accountNumber", "Account Number is required").not().isEmpty(),
    check("validID", "Valid ID is required").not().isEmpty().isEmail(),
    check("photo", "Photo is required").not().isEmpty(),
  ],
};
export const routeAuth = {
  body: [
    check("pickUpStation", "Pickup station is required").not().isEmpty(),
    check("destination", "Destination is required").not().isEmpty(),
    check("price", "Price is required").not().isEmpty(),
  ],
};

export const editRouteAuth = {
  body: [check("price", "Price is required").not().isEmpty()],
};

//include admin authorization

export const adminAuthentication = async (
  req: NewRequest,
  res: Response,
  next: NextFunction
) => {
  //get and validate token
  const { authorization } = req.headers;
  console.log("authorization: ", authorization)
  const token = authorization?.split(" ")[1] as string;
  const validateToken = jwt.verify(
    `${token}`,
    `${JWT_SECRET}`,
    async (error, result) => {
      console.log("Result: ", result)
      console.log("error: ", error)
      const resultNew = result as JwtPayload;
      const id = resultNew?.id;
      console.log("id: ", id);
      if (!result || !id) {
        res.status(400).json({
          message: "Bad RequestA",
        });
        return;
      }
      const userDetails = (await findAnyUser({
        _id: `${id}`,
      })) as unknown as UserDataType;
      req.user = userDetails;
      console.log("userDetails: ", userDetails);
      if (!userDetails) {
        res.status(400).json({
          message: "Bad RequestB",
        });
        return;
      }
      const userRoles = userDetails.roles;
      if (!userRoles?.includes("admin")) {
        res.status(400).json({
          message: "Bad RequestC",
        });
        return;
      }
      console.log("HERSS");
      next();
    }
  );
};
