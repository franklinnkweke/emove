import express from "express";
import { routeAuth, editRouteAuth } from "../middleWares/auth";
import {
  addRoute,
  editRoute,
  getTotalCounts,
} from "../controllers/routeController";
import { adminAuthentication } from "../middleWares/auth";
import { getRoute, getAvailableRoutes } from "../controllers/routeController";

const route = express.Router();

//add authentication middleware
route.post("/", routeAuth.body, adminAuthentication, addRoute);
route.post("/edit/:id", editRouteAuth.body, adminAuthentication, editRoute);
route.get("/getRoute/:routeId", getRoute);
route.get("/getAllRoutes", getAvailableRoutes);
route.get("/getStatistics", getTotalCounts);

export { route };
