import jwt from "jsonwebtoken";

export const tokenForUser = (userId) => {
  const timestamp = new Date().getTime();
  return jwt.sign({ sub: userId, iat: timestamp }, process.env.JWT_SECRET);
};