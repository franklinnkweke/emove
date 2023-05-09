import { Request, Response } from "express";
import {
  routeExists,
  createRoute,
  updateRoute,
  getAllRoutes,
  routeExistNEW
} from "../services/routeService";
import { getAllUsers } from "../services/userService";

interface routeDataType {
  id?: string;
  pickUpStation?: string;
  destination?: string;
  price?: number;
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
}

export const addRoute = async (req: Request, res: Response) => {
  //take the data
  const { pickUpStation, destination, price } = req.body;
  const routeDetails = {
    pickUpStation,
    destination,
  };
  const doesRouteExists = (await routeExistNEW(
    routeDetails
  )) as unknown as Array<routeDataType>;
  console.log("doesRouteExists: ", doesRouteExists);
  if (doesRouteExists.length !== 0) {
    return res.status(400).json({
      message: "Route already exists",
    });
  }
  const newRoute = await createRoute({ ...routeDetails, price });
  if (!newRoute) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
  return res.status(201).json({
    message: "Route created successfully",
    route: newRoute,
  });
};

export const editRoute = async (req: Request, res: Response) => {
  //get route id
  // const { routeId } = req.headers;
  console.log("req body: ", req.body);
  // console.log("req body: ", req.body);
  const { price } = req.body;
  const id: string = req.params['id'] as unknown as string; 
  //check if route exists
  const doesRouteExist = await routeExistNEW({ _id: id });
  if (!doesRouteExist) {
    return res.status(404).json({
      message: "Route does not exist",
    });
  }
  //fetch route details
  const newRouteID = id as unknown as string;
  //update route details
  const routeDetails = {
    price: price,
    id: id,
  };
  const updateRouteDetails = await updateRoute(routeDetails);
  console.log("updateRouteDetails: ", updateRouteDetails);
  if (!updateRouteDetails) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
  return res.status(200).json({
    message: "Route updated successfully",
    route: updateRouteDetails,
  });
};
export const getRoute = async (req: Request, res: Response) => {
  //get route id
  const { routeId } = req.params;

  //check if route exists
  const doesRouteExist = await routeExistNEW({ _id: routeId });
  console.log(doesRouteExist);
  if (!doesRouteExist) {
    return res.status(404).json({
      message: "Route does not exist",
    });
  }
  return res.status(200).json({
    message: "Route exists",
    route: doesRouteExist,
  });
};

// };

export const getAvailableRoutes = async (req: Request, res: Response) => {
  try {
    const routes = await getAllRoutes();
    if (!routes) {
      return res.status(400).json({ message: "no routes" });
    }
    return res.status(200).json({
      message: "Route exists",
      routes,
    });
  } catch (error) {
    return res.status(400).json({ message: "something went wrong" });
  }
};

export const getTotalCounts = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers() as unknown as Array<UserDataType>;
    if (!users) {
      res.status(400).json({ message: "something wrong" });
    }

    const totalPassengers = users.filter((user) =>
      user.roles?.includes("passenger")
    ).length;
    const totalDrivers = users.filter((user) =>
      user.roles?.includes("driver")
    ).length;

    return res.status(200).json({
      amountOfDrivers: totalDrivers,
      amountOfPassengers: totalPassengers,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};
