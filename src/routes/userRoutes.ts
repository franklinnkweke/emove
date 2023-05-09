import { Router } from "express";
import {
  defaultController,
  login,
  signUp,
  forgotPassword,
  resetpassword,
  editDriver,
  deleteDriverController,
  fundWalletController,
  payStackCallback,
  getTransaction,
  userRecord,
  getAllUsersCountDetails,
  verifyTokenGoogle
} from "../controllers/userController";
import { addDriver, sendAllDrivers, editDriverDetails, deleteDriverDetails, countDriverDetails } from "../controllers/driverController";
import {
  signUpAuth,
  loginAuth,
  forgotPasswordAuth,
  resetPasswordAuth,
  addDriverValidator,
  routeAuth,
  editRouteAuth,
  adminAuthentication,
} from "../middleWares/auth";
import { verifyEmail } from "../controllers/userController";
import { Upload } from "../middleWares/imageUpload";
import {
  changePassword,
  getOneDriverController,
} from "../controllers/userController";
import { addRoute, editRoute } from "../controllers/routeController";
import { getTripsController } from "../controllers/tripsController";
import { BookAtrip } from "../controllers/tripsController";

const route = Router();

route.get("/", defaultController);

route.post("/signup", signUpAuth.body, signUp);

route.post("/login", loginAuth.body, login);

route.post("/verifytoken", verifyTokenGoogle);


route.get("/verify/:token", verifyEmail);
route.get("/user/:id", userRecord);
route.get("/passengers/count", adminAuthentication, getAllUsersCountDetails);

route.get("/drivers/count", adminAuthentication, countDriverDetails);

route.post("/forgotpassword", forgotPasswordAuth.body, forgotPassword);

route.post("/resetpassword/:token", resetPasswordAuth.body, resetpassword);
route.post("/change-password", changePassword);

route.get("/drivers", adminAuthentication, sendAllDrivers);
route.get("/driver/:id", getOneDriverController);

route.delete("/delete-driver/:id", adminAuthentication, deleteDriverDetails);

route.post("/add-driver", adminAuthentication, addDriver);
route.put("/edit-driver/:id", adminAuthentication, editDriverDetails);

route.get("/transaction/:userId", getTransaction);

//routes for bus route
// route.post("/v1/route", routeAuth.body, adminAuthentication, addRoute);
// route.post("/v1/route/edit", editRouteAuth.body, adminAuthentication, editRoute);

route.get("/trips", getTripsController);

route.post("/paystack/pay", fundWalletController);
route.get("/paystack/callback", payStackCallback);

route.post("/booktrip/", BookAtrip);//:userId/:routeId

//router.post("/", , Upload, createMemory);

export { route };
