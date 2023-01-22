import { PrismaClient } from "@prisma/client";

// use `prisma` in your application to read and write data in your DB
// use `prisma` in your application to read and write data in your DB
class BaseController {
  prisma = new PrismaClient();
}

export default BaseController;
