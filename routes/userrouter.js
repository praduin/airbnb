// core module ;
const path = require("path");
const controller = require("../controllers/fhome");
const express = require("express");
const rootDir = require("../utils/pathUtil");

const app = express();
app.use(express.urlencoded({ extended: false }));
const userRouter = express.Router();

userRouter.get("/", controller.getIndex);
userRouter.get("/homes", controller.getHome);
userRouter.get("/favoritehome", controller.getfavrouited);
userRouter.get("/booking-list", controller.getBookings);
userRouter.get("/getIndex", controller.getfavrouited);
userRouter.get("/homes/:homeId", controller.getHomeDetail);
userRouter.post("/favoritehome", controller.postAddToFavorite);

userRouter.post("/remove-from-favorite", controller.postremoveFromFavorite);

module.exports = userRouter;
