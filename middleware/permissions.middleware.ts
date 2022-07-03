require("dotenv").config();
import WrongAuthenticationTokenException from "exceptions/WrongAuthenticationTokenException";
import * as express from "express";

function permissionsMiddleware(
  doctype: Array<string>,
  action: Array<string>,
  permissions: any,
  next: express.NextFunction
) {
  const perm = permissions.find((x) => {
    return doctype.find((z) => {
      return x.DoctypeId === z && action.find((z) => x[z] === true);
    });
  });
  if (perm) next();
  else {
    return {
      originalError: {
        status: 403,
        message: "You don't have permission to do that",
      },
    };
  }
}

export default permissionsMiddleware;
