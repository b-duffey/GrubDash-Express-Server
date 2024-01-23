const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//Validation functions

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName] && data[propertyName] !== "") {
      return next();
    }
    next({ status: 400, message: `Order must include a ${propertyName}` });
  };
}

function dishPropertyIsValid(req, res, next) {
  const { data: { dishes } = {} } = req.body || {};

  if (Array.isArray(dishes) && dishes.length > 0) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include at least one dish",
  });
}

function quantityIsValidNumber(req, res, next) {
  const { orderId } = req.params;
  const { data: { dishes } = {} } = req.body;

  for (let i = 0; i < dishes.length; i++) {
    const { quantity } = dishes[i];
    if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
      return next({
        status: 400,
        message: `Dish ${i} must have a quantity that is an integer greater than 0`, //need to add ${index} back in
      });
    }
  }
  next();
}

function orderExists(req, res, next) {
  const { orderId } = req.params;

  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order does not exist: ${orderId}.`,
  });
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function update(req, res) {
  const order = res.locals.order;
  const { orderId } = req.params;

  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } =
    req.body;

  if (!status || status === "" || status == "invalid") {
    return res.status(400).json({
      error:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  } else if (status === "delivered") {
    return res.status(400).json({
      error: "A delivered order cannot be changed",
    });
  } else if (id && String(id) !== orderId) {
    return res.status(400).json({
      error: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
    });
  }

  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;

  res.json({ data: order });
}

function destroy(req, res) {
  const { order } = res.locals;
  const { orderId } = req.params;
  if (order.status === "pending") {
    const index = orders.findIndex((order) => order.id === orderId);
    const deletedOrders = orders.splice(index, 1);
    res.sendStatus(204);
  } else {
    return res.status(400).json({
      error: "An order cannot be deleted unless it is pending.",
    });
  }
}

function list(req, res) {
  const { orderId } = req.params;
  const filteredOrders = orders.filter(
    (order) => order.id === Number(orderId) || !orderId
  );

  //console.log(filteredOrders);

  res.json({ data: filteredOrders });
}
function read(req, res, next) {
  const order = res.locals.order;

  res.json({ data: order });
}

module.exports = {
  list,
  read: [orderExists, read], //need Order exists function maybe
  update: [
    orderExists,

    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("status"),
    bodyDataHas("dishes"),
    dishPropertyIsValid,
    quantityIsValidNumber,
    update,
  ],
  create: [
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    dishPropertyIsValid,
    quantityIsValidNumber,
    create,
  ],
  delete: [orderExists, destroy],
  dishPropertyIsValid,
  quantityIsValidNumber,
  orderExists,
};
