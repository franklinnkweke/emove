import { Request, Response } from "express";
import { verify, reject, getPendingUsers } from "../services/adminService";

export async function verifyDriverController(req: Request, res: Response) {
  try {
      const { passengerID } = req.params;
      await verify(passengerID)
      return res.status(200).json({message: `User ${passengerID} is now a verified driver`})
  } catch (error:any) {
      return res.status(400).json({error: error.message})
  }
}

export async function rejectDriverController(req: Request, res: Response) {
  try {
      const { passengerID } = req.params;
      await reject(passengerID)
      return res.status(200).json({message: `User ${passengerID} application has been rejected`})
  } catch (error:any) {
       return res.status(400).json({error: error.message})
  }
}

export async function getPendingUsersController(req: Request, res: Response) {
    try {
        const users = await getPendingUsers()
        return res.status(200).json({pendingUsers: users})
    } catch (error:any) {
        return res.status(400).json({error: error.message})
    }
}
