// backend\src\middleware\validateActivityMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { ActivityType , isActivity } from "../constants/activities";

export const validateActivityMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { activity } = req.params;

  if (!isActivity(activity)) {
    res.status(400).json({ error: `La actividad '${activity}' no es válida.` });
    return;
  }

  req.locals.activityType = activity as ActivityType; 
  next();
};