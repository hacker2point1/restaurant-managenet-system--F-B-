const mongoose = require("mongoose");

/**
 * Validate MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Convert string to ObjectId
 */
const toObjectId = (id) => {
  return new mongoose.Types.ObjectId(id);
};

/**
 * Build date filter
 *
 * Example:
 * startDate=2026-09-01
 * endDate=2026-09-30
 *
 * Returns:
 * {
 *   $gte: Date,
 *   $lt: Date
 * }
 */
const buildDateFilter = (startDate, endDate) => {
  const filter = {};

  if (startDate) {
    const start = new Date(startDate);

    if (Number.isNaN(start.getTime())) {
      throw new Error("Invalid startDate");
    }

    start.setHours(0, 0, 0, 0);

    filter.$gte = start;
  }

  if (endDate) {
    const end = new Date(endDate);

    if (Number.isNaN(end.getTime())) {
      throw new Error("Invalid endDate");
    }

    // Make end date inclusive
    end.setHours(23, 59, 59, 999);

    filter.$lte = end;
  }

  return filter;
};

/**
 * Build common branch/restaurant filter
 */
const buildScopeFilter = ({
  restaurantId,
  branchId,
  restaurantField = "restaurant",
  branchField = "branch",
}) => {
  const filter = {};

  if (restaurantId) {
    if (!isValidObjectId(restaurantId)) {
      throw new Error("Invalid restaurantId");
    }

    filter[restaurantField] = toObjectId(restaurantId);
  }

  if (branchId) {
    if (!isValidObjectId(branchId)) {
      throw new Error("Invalid branchId");
    }

    filter[branchField] = toObjectId(branchId);
  }

  return filter;
};

module.exports = {
  isValidObjectId,
  toObjectId,
  buildDateFilter,
  buildScopeFilter,
};