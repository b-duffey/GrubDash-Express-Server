const router = require("express").Router();
const controller = require("./orders.controller.js");
const dishesRouter = require("../dishes/dishes.router");
const methodNotAllowed = require("../errors/methodNotAllowed");
const errorHandler = require("../errors/errorHandler");
const notFound = require("../errors/notFound");

// TODO: Implement the /orders routes needed to make the tests pass

router
  .route("/:orderId")
  .get(controller.read)
  .get(controller.list)
  .delete(controller.delete)
  .put(controller.update)
  .all(methodNotAllowed, errorHandler, notFound);

router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed, errorHandler, notFound);

module.exports = router;
