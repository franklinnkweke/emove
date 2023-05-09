import Route from "../models/routeModel";

interface routeDataType {
  id?: string;
  pickUpStation?: string;
  destination?: string;
  price?: number;
}

export const routeExists = async (id: string) => {
  try {
    const data = await Route.findById(id);
    return data;
    
  } catch (error) {
    console.log("Error: ", error);
    return null;  
  } 
};

export const routeExistNEW = async (data: {}) => {
  return Route.find(data)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.log("Error: ", err);
      return false;
    });
};

export const createRoute = async (data: {}) => {
  const route = new Route(data);
  return route
    .save()
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.log("Error: ", err);
      return false;
    });
};

export const updateRoute = async (data: routeDataType) => {
  // const route = await Route.findByIdAndUpdate(data._id, data, {new: true});
  // return route;
  // console.log("id: ", data)
  return Route.findByIdAndUpdate(data.id, data, { new: true })
    .then((data) => {
      console.log("data: ", data);
      return data;
    })
    .catch((err) => {
      console.log("Error: ", err);
      return false;
    });
};

export const getAllRoutes = async () => {
  const routes = await Route.find({});
  return routes;
};
