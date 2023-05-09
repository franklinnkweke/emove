import { Router } from "express";
import {
  verifyDriverController,
  rejectDriverController,
  getPendingUsersController,
} from "../controllers/adminController";
import {
  verifyDriverValidator,
  adminAuthentication,
} from "../middleWares/auth";
import { getTripsController } from "../controllers/tripsController";

const route = Router();

route.get(
  "/verifyDriver/:passengerID",
  verifyDriverValidator.params,
  verifyDriverController
);
route.get(
  "/rejectDriver/:passengerID",
  verifyDriverValidator.params,
  rejectDriverController
);

route.get("/getPendingUsers", getPendingUsersController);

route.get("/trips", adminAuthentication, getTripsController);

//router.post("/", , Upload, createMemory);

export { route };
