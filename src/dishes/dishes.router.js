const router = require("express").Router();
const controller = require("./dishes.controller.js");
const methodNotAllowed = require("../errors/methodNotAllowed");
const errorHandler = require("../errors/errorHandler");
const notFound = require("../errors/notFound");

// TODO: Implement the /dishes routes needed to make the tests pass

router
  .route("/:dishId")
  .get(controller.read)
  .get(controller.list)
  .put(controller.update)
  .all(methodNotAllowed, errorHandler, notFound);

router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed, errorHandler, notFound);

module.exports = router;
