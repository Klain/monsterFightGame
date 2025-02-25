// backend\src\middleware\validateActivityMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { isActivity } from "../validators/activity-validator";

export const validateActivityMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const activityType: number = +(req.body?.activityType || req.params?.activityType);

  if (!isActivity(activityType)) {
    res.status(400).json({ error: `La actividad '${activityType}' no es válida.` });
    return;
  }
  req.locals.activityType = activityType;
  next();
};