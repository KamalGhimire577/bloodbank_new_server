import type { Response, NextFunction } from "express";
import type { IextendedRequest } from "./types.js";

/**
 * Middleware to allow only users with role "donor"
 */
const isDonor = (req: IextendedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User not logged in" });
  }

  if (req.user.role !== "donor") {
    return res
      .status(403)
      .json({ message: "Access denied: Only donors allowed" });
  }

  next();
};

export default isDonor;
