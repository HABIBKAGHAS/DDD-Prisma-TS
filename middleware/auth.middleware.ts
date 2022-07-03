require("dotenv").config();
import * as express from "express";
import * as jwt from "jsonwebtoken";
import AuthenticationTokenMissingException from "../exceptions/AuthenticationTokenMissingException";
import WrongAuthenticationTokenException from "../exceptions/WrongAuthenticationTokenException";
import Payload from "../Models/Token/Payload";
async function authMiddleware(
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) {
  const head = request.headers;
  if (head.authorization === undefined)
    next(new WrongAuthenticationTokenException());

  const token = head.authorization.replace(/"/g, "");
  if (head && token) {
    const secret = process.env.POS_ACCESS_TOKEN_SECRET;
    console.log("token", token, secret);
    try {
      const verificationResponse = jwt.verify(token, secret) as Payload;
      console.log({ verificationResponse });
      if (verificationResponse) next();
    } catch (error) {
      next(new WrongAuthenticationTokenException());
    }
  } else {
    next(new AuthenticationTokenMissingException());
  }
}

export default authMiddleware;
