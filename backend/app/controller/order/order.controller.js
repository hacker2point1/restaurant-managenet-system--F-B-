const mongoose = require("mongoose");

const Order = require("../../models/order.Model");
const MenuItem = require("../../models/menuItem.model");
const Branch = require("../../models/branch.model");
const Customer = require("../../models/customer.model");
const Table = require("../../models/table.model");

const statusCode = require("../../utils/statusCode");
const { isValidId } = require("../../utils/validation/validation");

// ============================================================
// ORDER CONTROLLER
// ============================================================

class OrderController {
  // ============================================================
  // CREATE ORDER
  // POST /api/orders
  // ============================================================

  async createOrder(req, res) {
    try {
      const {
        restaurant,
        branch,
        customer,
        table,
        items,
        tax = 0,
        paymentMethod,
      } = req.body;

      // --------------------------------------------------------
      // Validate restaurant
      // --------------------------------------------------------

      if (!restaurant || !isValidId(restaurant)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Valid restaurant ID is required",
        });
      }

      // --------------------------------------------------------
      // Validate branch
      // --------------------------------------------------------

      if (!branch || !isValidId(branch)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Valid branch ID is required",
        });
      }

      // --------------------------------------------------------
      // Validate customer if provided
      // --------------------------------------------------------

      if (customer && !isValidId(customer)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      // --------------------------------------------------------
      // Validate table if provided
      // --------------------------------------------------------

      if (table && !isValidId(table)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid table ID",
        });
      }

      // --------------------------------------------------------
      // Validate items
      // --------------------------------------------------------

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Order must contain at least one item",
        });
      }

      // --------------------------------------------------------
      // Validate tax
      // --------------------------------------------------------

      if (Number(tax) < 0) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Tax cannot be negative",
        });
      }

      // --------------------------------------------------------
      // Check Branch
      // --------------------------------------------------------

      const branchData = await Branch.findOne({
        _id: branch,
        isDeleted: false,
      });

      if (!branchData) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Branch not found",
        });
      }

      // --------------------------------------------------------
      // Make sure branch belongs to restaurant
      // --------------------------------------------------------

      if (
        branchData.restaurant &&
        branchData.restaurant.toString() !== restaurant.toString()
      ) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Branch does not belong to this restaurant",
        });
      }

      // --------------------------------------------------------
      // Check customer
      // --------------------------------------------------------

      if (customer) {
        const customerData = await Customer.findOne({
          _id: customer,
          isActive: true,
        });

        if (!customerData) {
          return res.status(statusCode.NOT_FOUND).json({
            status: false,
            message: "Customer not found or inactive",
          });
        }
      }

      // --------------------------------------------------------
      // Check table
      // --------------------------------------------------------

      if (table) {
        const tableData = await Table.findOne({
          _id: table,
          branch: branch,
          isDeleted: false,
        });

        if (!tableData) {
          return res.status(statusCode.NOT_FOUND).json({
            status: false,
            message: "Table not found in this branch",
          });
        }

        if (!tableData.isActive) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message: "Table is inactive",
          });
        }

        if (
          tableData.status !== "available" &&
          tableData.status !== "reserved"
        ) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message: `Table is currently ${tableData.status}`,
          });
        }
      }

      // --------------------------------------------------------
      // Prepare order items
      // --------------------------------------------------------

      const orderItems = [];
      let subtotal = 0;

      for (const item of items) {
        // ------------------------------------------------------
        // Validate menu item ID
        // ------------------------------------------------------

        if (!item.menuItem || !isValidId(item.menuItem)) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message: "Valid menu item ID is required",
          });
        }

        // ------------------------------------------------------
        // Validate quantity
        // ------------------------------------------------------

        const quantity = Number(item.quantity);

        if (!quantity || quantity < 1) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message:
              "Menu item quantity must be at least 1",
          });
        }

        // ------------------------------------------------------
        // Get MenuItem from MongoDB
        //
        // MenuItem
        //    ↓
        // InventoryItem
        // ------------------------------------------------------

        const menuItems = await MenuItem.aggregate([
          {
            $match: {
              _id: new mongoose.Types.ObjectId(item.menuItem),
              branch: new mongoose.Types.ObjectId(branch),
              isDeleted: false,
              isAvailable: true,
            },
          },

          {
            $lookup: {
              from: "inventoryitems",
              localField: "ingredients",
              foreignField: "_id",
              as: "ingredientDetails",
            },
          },

          {
            $project: {
              _id: 1,
              name: 1,
              price: 1,
              ingredients: 1,
              ingredientDetails: 1,
            },
          },
        ]);

        if (!menuItems.length) {
          return res.status(statusCode.NOT_FOUND).json({
            status: false,
            message:
              `Menu item ${item.menuItem} not found, unavailable, deleted, or does not belong to this branch`,
          });
        }

        const menuItem = menuItems[0];

        // ------------------------------------------------------
        // Calculate item total
        // ------------------------------------------------------

        const unitPrice = Number(menuItem.price);

        const totalPrice = unitPrice * quantity;

        subtotal += totalPrice;

        // ------------------------------------------------------
        // Prepare ingredients
        // ------------------------------------------------------

        const ingredients = (
          menuItem.ingredientDetails || []
        ).map((ingredient) => ({
          inventoryItem: ingredient._id,
          quantityUsed: 0,
        }));

        orderItems.push({
          menuItem: menuItem._id,
          name: menuItem.name,
          quantity,
          unitPrice,
          totalPrice,
          ingredients,
        });
      }

      // --------------------------------------------------------
      // Discount
      // --------------------------------------------------------

      const discount = 0;

      // --------------------------------------------------------
      // Calculate total
      // --------------------------------------------------------

      const totalAmount = Math.max(
        subtotal - discount + Number(tax),
        0
      );

      // --------------------------------------------------------
      // Generate order number
      // --------------------------------------------------------

      const orderNumber = `ORD-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      // --------------------------------------------------------
      // Create order
      // --------------------------------------------------------

      const order = await Order.create({
        orderNumber,
        restaurant,
        branch,
        customer: customer || undefined,
        table: table || undefined,
        items: orderItems,
        subtotal,
        discount,
        tax: Number(tax),
        totalAmount,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod,
        orderedAt: new Date(),
        createdBy: req.user?._id || req.user?.id,
      });

      return res.status(statusCode.CREATED).json({
        status: true,
        message: "Order created successfully",
        data: order,
      });
    } catch (error) {
      console.error("Create Order Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to create order",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET ALL ORDERS
  // GET /api/orders
  // ============================================================

  async getOrders(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        paymentStatus,
        branch,
        restaurant,
      } = req.query;

      const pageNumber = Math.max(Number(page), 1);
      const limitNumber = Math.max(Number(limit), 1);
      const skip = (pageNumber - 1) * limitNumber;

      // --------------------------------------------------------
      // Match filter
      // --------------------------------------------------------

      const match = {};

      if (status) {
        match.status = status;
      }

      if (paymentStatus) {
        match.paymentStatus = paymentStatus;
      }

      if (branch) {
        if (!isValidId(branch)) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid branch ID",
          });
        }

        match.branch = new mongoose.Types.ObjectId(branch);
      }

      if (restaurant) {
        if (!isValidId(restaurant)) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid restaurant ID",
          });
        }

        match.restaurant =
          new mongoose.Types.ObjectId(restaurant);
      }

      // --------------------------------------------------------
      // Aggregation
      // --------------------------------------------------------

      const orders = await Order.aggregate([
        {
          $match: match,
        },

        // ------------------------------------------------------
        // Restaurant
        // ------------------------------------------------------

        {
          $lookup: {
            from: "restaurants",
            localField: "restaurant",
            foreignField: "_id",
            as: "restaurantDetails",
          },
        },

        {
          $unwind: {
            path: "$restaurantDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        // ------------------------------------------------------
        // Branch
        // ------------------------------------------------------

        {
          $lookup: {
            from: "branches",
            localField: "branch",
            foreignField: "_id",
            as: "branchDetails",
          },
        },

        {
          $unwind: {
            path: "$branchDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        // ------------------------------------------------------
        // Customer
        // ------------------------------------------------------

        {
          $lookup: {
            from: "customers",
            localField: "customer",
            foreignField: "_id",
            as: "customerDetails",
          },
        },

        {
          $unwind: {
            path: "$customerDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        // ------------------------------------------------------
        // Table
        // ------------------------------------------------------

        {
          $lookup: {
            from: "tables",
            localField: "table",
            foreignField: "_id",
            as: "tableDetails",
          },
        },

        {
          $unwind: {
            path: "$tableDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        // ------------------------------------------------------
        // Menu Items
        // ------------------------------------------------------

        {
          $lookup: {
            from: "menuitems",
            localField: "items.menuItem",
            foreignField: "_id",
            as: "menuItemDetails",
          },
        },

        // ------------------------------------------------------
        // Replace menuItem ID inside items[]
        // ------------------------------------------------------

        {
          $addFields: {
            items: {
              $map: {
                input: "$items",
                as: "item",
                in: {
                  $mergeObjects: [
                    "$$item",
                    {
                      menuItem: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$menuItemDetails",
                              as: "menu",
                              cond: {
                                $eq: [
                                  "$$menu._id",
                                  "$$item.menuItem",
                                ],
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        },

        // ------------------------------------------------------
        // Final response
        // ------------------------------------------------------

        {
          $project: {
            menuItemDetails: 0,

            "restaurantDetails.__v": 0,
            "branchDetails.__v": 0,
            "customerDetails.__v": 0,
            "tableDetails.__v": 0,
          },
        },

        {
          $sort: {
            orderedAt: -1,
          },
        },

        {
          $skip: skip,
        },

        {
          $limit: limitNumber,
        },
      ]);

      // --------------------------------------------------------
      // Total count
      // --------------------------------------------------------

      const totalOrders =
        await Order.countDocuments(match);

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Orders fetched successfully",
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalOrders,
          totalPages: Math.ceil(
            totalOrders / limitNumber
          ),
        },
        count: orders.length,
        data: orders,
      });
    } catch (error) {
      console.error("Get Orders Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to fetch orders",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET ORDER BY ID
  // GET /api/orders/:id
  // ============================================================

  async getOrderById(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid order ID",
        });
      }

      const orders = await Order.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },

        // Restaurant
        {
          $lookup: {
            from: "restaurants",
            localField: "restaurant",
            foreignField: "_id",
            as: "restaurantDetails",
          },
        },

        {
          $unwind: {
            path: "$restaurantDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Branch
        {
          $lookup: {
            from: "branches",
            localField: "branch",
            foreignField: "_id",
            as: "branchDetails",
          },
        },

        {
          $unwind: {
            path: "$branchDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Customer
        {
          $lookup: {
            from: "customers",
            localField: "customer",
            foreignField: "_id",
            as: "customerDetails",
          },
        },

        {
          $unwind: {
            path: "$customerDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Table
        {
          $lookup: {
            from: "tables",
            localField: "table",
            foreignField: "_id",
            as: "tableDetails",
          },
        },

        {
          $unwind: {
            path: "$tableDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Menu Items
        {
          $lookup: {
            from: "menuitems",
            localField: "items.menuItem",
            foreignField: "_id",
            as: "menuItemDetails",
          },
        },

        {
          $addFields: {
            items: {
              $map: {
                input: "$items",
                as: "item",
                in: {
                  $mergeObjects: [
                    "$$item",
                    {
                      menuItem: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$menuItemDetails",
                              as: "menu",
                              cond: {
                                $eq: [
                                  "$$menu._id",
                                  "$$item.menuItem",
                                ],
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        },

        {
          $project: {
            menuItemDetails: 0,
          },
        },
      ]);

      if (!orders.length) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Order not found",
        });
      }

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Order fetched successfully",
        data: orders[0],
      });
    } catch (error) {
      console.error("Get Order By ID Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to fetch order",
        error: error.message,
      });
    }
  }

  // ============================================================
  // UPDATE ORDER
  // PATCH /api/orders/:id
  // ============================================================

  async updateOrder(req, res) {
    try {
      const { id } = req.params;

      const {
        table,
        tax,
        paymentMethod,
      } = req.body;

      if (!isValidId(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid order ID",
        });
      }

      const order = await Order.findById(id);

      if (!order) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Order not found",
        });
      }

      if (
        order.status === "completed" ||
        order.status === "cancelled"
      ) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message:
            "Completed or cancelled order cannot be updated",
        });
      }

      // --------------------------------------------------------
      // Update table
      // --------------------------------------------------------

      if (table !== undefined) {
        if (table !== null && !isValidId(table)) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid table ID",
          });
        }

        if (table) {
          const tableData = await Table.findOne({
            _id: table,
            branch: order.branch,
            isDeleted: false,
          });

          if (!tableData) {
            return res.status(statusCode.NOT_FOUND).json({
              status: false,
              message: "Table not found in order branch",
            });
          }
        }

        order.table = table || undefined;
      }

      // --------------------------------------------------------
      // Update tax
      // --------------------------------------------------------

      if (tax !== undefined) {
        if (Number(tax) < 0) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message: "Tax cannot be negative",
          });
        }

        order.tax = Number(tax);
      }

      // --------------------------------------------------------
      // Update payment method
      // --------------------------------------------------------

      if (paymentMethod !== undefined) {
        const allowedMethods = [
          "cash",
          "card",
          "upi",
          "online",
        ];

        if (!allowedMethods.includes(paymentMethod)) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message:
              "Invalid payment method",
          });
        }

        order.paymentMethod = paymentMethod;
      }

      // --------------------------------------------------------
      // Recalculate total
      // --------------------------------------------------------

      order.totalAmount = Math.max(
        order.subtotal -
          order.discount +
          order.tax,
        0
      );

      await order.save();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Order updated successfully",
        data: order,
      });
    } catch (error) {
      console.error("Update Order Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to update order",
        error: error.message,
      });
    }
  }

  // ============================================================
  // CANCEL ORDER
  // PATCH /api/orders/:id/cancel
  // ============================================================

  async cancelOrder(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid order ID",
        });
      }

      const order = await Order.findById(id);

      if (!order) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Order not found",
        });
      }

      if (
        order.status === "completed" ||
        order.status === "served" ||
        order.status === "cancelled"
      ) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message:
            `Order cannot be cancelled because it is ${order.status}`,
        });
      }

      order.status = "cancelled";
      order.cancelledAt = new Date();

      await order.save();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Order cancelled successfully",
        data: order,
      });
    } catch (error) {
      console.error("Cancel Order Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to cancel order",
        error: error.message,
      });
    }
  }

  // ============================================================
  // CONFIRM ORDER
  // PATCH /api/orders/:id/confirm
  // ============================================================

  async confirmOrder(req, res) {
    return this.changeOrderStatus(
      req,
      res,
      "pending",
      "confirmed",
      "Order confirmed successfully"
    );
  }

  // ============================================================
  // START PREPARING
  // PATCH /api/orders/:id/start-preparing
  // ============================================================

  async startPreparing(req, res) {
    return this.changeOrderStatus(
      req,
      res,
      "confirmed",
      "preparing",
      "Order preparation started"
    );
  }

  // ============================================================
  // MARK READY
  // PATCH /api/orders/:id/ready
  // ============================================================

  async markReady(req, res) {
    return this.changeOrderStatus(
      req,
      res,
      "preparing",
      "ready",
      "Order marked as ready"
    );
  }

  // ============================================================
  // MARK SERVED
  // PATCH /api/orders/:id/served
  // ============================================================

  async markServed(req, res) {
    return this.changeOrderStatus(
      req,
      res,
      "ready",
      "served",
      "Order marked as served"
    );
  }

  // ============================================================
  // COMPLETE ORDER
  // PATCH /api/orders/:id/complete
  // ============================================================

  async completeOrder(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid order ID",
        });
      }

      const order = await Order.findById(id);

      if (!order) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Order not found",
        });
      }

      if (order.status !== "served") {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message:
            `Order must be served before completing. Current status: ${order.status}`,
        });
      }

      order.status = "completed";
      order.completedAt = new Date();

      await order.save();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Order completed successfully",
        data: order,
      });
    } catch (error) {
      console.error("Complete Order Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to complete order",
        error: error.message,
      });
    }
  }

  // ============================================================
  // COMMON STATUS CHANGE
  // ============================================================

  async changeOrderStatus(
    req,
    res,
    currentStatus,
    newStatus,
    message
  ) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid order ID",
        });
      }

      const order = await Order.findById(id);

      if (!order) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Order not found",
        });
      }

      if (order.status !== currentStatus) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message:
            `Order must be ${currentStatus} before changing to ${newStatus}. Current status: ${order.status}`,
        });
      }

      order.status = newStatus;

      await order.save();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message,
        data: order,
      });
    } catch (error) {
      console.error(
        "Change Order Status Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message:
          "Failed to change order status",
        error: error.message,
      });
    }
  }

  // ============================================================
  // UPDATE PAYMENT STATUS
  // PATCH /api/orders/:id/payment
  // ============================================================

  async updatePaymentStatus(req, res) {
    try {
      const { id } = req.params;

      const {
        paymentStatus,
        paymentMethod,
      } = req.body;

      const allowedPaymentStatuses = [
        "pending",
        "paid",
        "failed",
        "refunded",
      ];

      const allowedPaymentMethods = [
        "cash",
        "card",
        "upi",
        "online",
      ];

      if (!isValidId(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid order ID",
        });
      }

      if (
        !allowedPaymentStatuses.includes(
          paymentStatus
        )
      ) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message:
            "Invalid payment status",
        });
      }

      if (
        paymentMethod &&
        !allowedPaymentMethods.includes(
          paymentMethod
        )
      ) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message:
            "Invalid payment method",
        });
      }

      const order = await Order.findById(id);

      if (!order) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Order not found",
        });
      }

      order.paymentStatus = paymentStatus;

      if (paymentMethod) {
        order.paymentMethod = paymentMethod;
      }

      await order.save();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message:
          "Payment status updated successfully",
        data: order,
      });
    } catch (error) {
      console.error(
        "Update Payment Status Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message:
          "Failed to update payment status",
        error: error.message,
      });
    }
  }

  // ============================================================
  // APPLY COUPON
  // PATCH /api/orders/:id/coupon
  // ============================================================

  async applyCoupon(req, res) {
    try {
      const { id } = req.params;
      const { coupon } = req.body;

      if (!isValidId(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid order ID",
        });
      }

      if (!coupon || !isValidId(coupon)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Valid coupon ID is required",
        });
      }

      const order = await Order.findById(id);

      if (!order) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Order not found",
        });
      }

      if (
        order.status === "completed" ||
        order.status === "cancelled"
      ) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message:
            "Coupon cannot be applied to completed or cancelled order",
        });
      }

      // --------------------------------------------------------
      // IMPORTANT:
      //
      // Your provided Order model contains coupon reference,
      // but Coupon model/rules were not provided.
      //
      // Therefore we attach the coupon ID here.
      // Discount calculation should be added after the
      // Coupon schema/rules are available.
      // --------------------------------------------------------

      order.coupon = coupon;

      await order.save();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Coupon applied successfully",
        data: order,
      });
    } catch (error) {
      console.error("Apply Coupon Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to apply coupon",
        error: error.message,
      });
    }
  }

  // ============================================================
  // CALCULATE ORDER TOTAL
  // GET /api/orders/:id/calculate-total
  // ============================================================

  async calculateOrderTotal(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid order ID",
        });
      }

      // --------------------------------------------------------
      // Use aggregation
      // --------------------------------------------------------

      const result = await Order.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },

        {
          $project: {
            subtotal: 1,
            discount: 1,
            tax: 1,
            totalAmount: {
              $max: [
                {
                  $add: [
                    "$subtotal",
                    {
                      $multiply: [
                        "$discount",
                        -1,
                      ],
                    },
                    "$tax",
                  ],
                },
                0,
              ],
            },
          },
        },
      ]);

      if (!result.length) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Order not found",
        });
      }

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Order total calculated successfully",
        data: result[0],
      });
    } catch (error) {
      console.error(
        "Calculate Order Total Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message:
          "Failed to calculate order total",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET ORDER HISTORY
  // GET /api/orders/customer/:customerId/history
  // ============================================================

  async getOrderHistory(req, res) {
    try {
      const { customerId } = req.params;

      if (!isValidId(customerId)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      const orders = await Order.aggregate([
        {
          $match: {
            customer:
              new mongoose.Types.ObjectId(customerId),
          },
        },

        // ------------------------------------------------------
        // Branch
        // ------------------------------------------------------

        {
          $lookup: {
            from: "branches",
            localField: "branch",
            foreignField: "_id",
            as: "branchDetails",
          },
        },

        {
          $unwind: {
            path: "$branchDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        // ------------------------------------------------------
        // Restaurant
        // ------------------------------------------------------

        {
          $lookup: {
            from: "restaurants",
            localField: "restaurant",
            foreignField: "_id",
            as: "restaurantDetails",
          },
        },

        {
          $unwind: {
            path: "$restaurantDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        // ------------------------------------------------------
        // Table
        // ------------------------------------------------------

        {
          $lookup: {
            from: "tables",
            localField: "table",
            foreignField: "_id",
            as: "tableDetails",
          },
        },

        {
          $unwind: {
            path: "$tableDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        // ------------------------------------------------------
        // Menu Items
        // ------------------------------------------------------

        {
          $lookup: {
            from: "menuitems",
            localField: "items.menuItem",
            foreignField: "_id",
            as: "menuItemDetails",
          },
        },

        {
          $addFields: {
            items: {
              $map: {
                input: "$items",
                as: "item",
                in: {
                  $mergeObjects: [
                    "$$item",
                    {
                      menuItem: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$menuItemDetails",
                              as: "menu",
                              cond: {
                                $eq: [
                                  "$$menu._id",
                                  "$$item.menuItem",
                                ],
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        },

        {
          $project: {
            menuItemDetails: 0,
          },
        },

        {
          $sort: {
            orderedAt: -1,
          },
        },
      ]);

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message:
          "Customer order history fetched successfully",
        count: orders.length,
        data: orders,
      });
    } catch (error) {
      console.error(
        "Get Order History Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message:
          "Failed to fetch order history",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET BRANCH ORDERS
  // GET /api/branches/:branchId/orders
  // ============================================================

  async getBranchOrders(req, res) {
    try {
      const { branchId } = req.params;

      if (!isValidId(branchId)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      const orders = await Order.aggregate([
        {
          $match: {
            branch:
              new mongoose.Types.ObjectId(branchId),
          },
        },

        // ------------------------------------------------------
        // Customer
        // ------------------------------------------------------

        {
          $lookup: {
            from: "customers",
            localField: "customer",
            foreignField: "_id",
            as: "customerDetails",
          },
        },

        {
          $unwind: {
            path: "$customerDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        // ------------------------------------------------------
        // Table
        // ------------------------------------------------------

        {
          $lookup: {
            from: "tables",
            localField: "table",
            foreignField: "_id",
            as: "tableDetails",
          },
        },

        {
          $unwind: {
            path: "$tableDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        // ------------------------------------------------------
        // Menu Items
        // ------------------------------------------------------

        {
          $lookup: {
            from: "menuitems",
            localField: "items.menuItem",
            foreignField: "_id",
            as: "menuItemDetails",
          },
        },

        {
          $addFields: {
            items: {
              $map: {
                input: "$items",
                as: "item",
                in: {
                  $mergeObjects: [
                    "$$item",
                    {
                      menuItem: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$menuItemDetails",
                              as: "menu",
                              cond: {
                                $eq: [
                                  "$$menu._id",
                                  "$$item.menuItem",
                                ],
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        },

        {
          $project: {
            menuItemDetails: 0,
          },
        },

        {
          $sort: {
            orderedAt: -1,
          },
        },
      ]);

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message:
          "Branch orders fetched successfully",
        count: orders.length,
        data: orders,
      });
    } catch (error) {
      console.error(
        "Get Branch Orders Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message:
          "Failed to fetch branch orders",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET CUSTOMER ORDERS
  // GET /api/customers/:customerId/orders
  // ============================================================

  async getCustomerOrders(req, res) {
    try {
      const { customerId } = req.params;

      if (!isValidId(customerId)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      const orders = await Order.aggregate([
        {
          $match: {
            customer:
              new mongoose.Types.ObjectId(customerId),
          },
        },

        // ------------------------------------------------------
        // Branch
        // ------------------------------------------------------

        {
          $lookup: {
            from: "branches",
            localField: "branch",
            foreignField: "_id",
            as: "branchDetails",
          },
        },

        {
          $unwind: {
            path: "$branchDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        // ------------------------------------------------------
        // Restaurant
        // ------------------------------------------------------

        {
          $lookup: {
            from: "restaurants",
            localField: "restaurant",
            foreignField: "_id",
            as: "restaurantDetails",
          },
        },

        {
          $unwind: {
            path: "$restaurantDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        // ------------------------------------------------------
        // Table
        // ------------------------------------------------------

        {
          $lookup: {
            from: "tables",
            localField: "table",
            foreignField: "_id",
            as: "tableDetails",
          },
        },

        {
          $unwind: {
            path: "$tableDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        // ------------------------------------------------------
        // Menu Items
        // ------------------------------------------------------

        {
          $lookup: {
            from: "menuitems",
            localField: "items.menuItem",
            foreignField: "_id",
            as: "menuItemDetails",
          },
        },

        {
          $addFields: {
            items: {
              $map: {
                input: "$items",
                as: "item",
                in: {
                  $mergeObjects: [
                    "$$item",
                    {
                      menuItem: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$menuItemDetails",
                              as: "menu",
                              cond: {
                                $eq: [
                                  "$$menu._id",
                                  "$$item.menuItem",
                                ],
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        },

        {
          $project: {
            menuItemDetails: 0,
          },
        },

        {
          $sort: {
            orderedAt: -1,
          },
        },
      ]);

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message:
          "Customer orders fetched successfully",
        count: orders.length,
        data: orders,
      });
    } catch (error) {
      console.error(
        "Get Customer Orders Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message:
          "Failed to fetch customer orders",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET ORDER STATISTICS
  // GET /api/orders/statistics
  // ============================================================

  async getOrderStatistics(req, res) {
    try {
      const { branchId, restaurantId } = req.query;

      const match = {};

      // --------------------------------------------------------
      // Branch filter
      // --------------------------------------------------------

      if (branchId) {
        if (!isValidId(branchId)) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid branch ID",
          });
        }

        match.branch =
          new mongoose.Types.ObjectId(branchId);
      }

      // --------------------------------------------------------
      // Restaurant filter
      // --------------------------------------------------------

      if (restaurantId) {
        if (!isValidId(restaurantId)) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid restaurant ID",
          });
        }

        match.restaurant =
          new mongoose.Types.ObjectId(
            restaurantId
          );
      }

      // --------------------------------------------------------
      // Statistics aggregation
      // --------------------------------------------------------

      const statistics = await Order.aggregate([
        {
          $match: match,
        },

        {
          $facet: {
            // --------------------------------------------------
            // Total Orders
            // --------------------------------------------------

            totalOrders: [
              {
                $count: "count",
              },
            ],

            // --------------------------------------------------
            // Total Revenue
            // --------------------------------------------------

            totalRevenue: [
              {
                $match: {
                  status: "completed",
                },
              },
              {
                $group: {
                  _id: null,
                  total: {
                    $sum: "$totalAmount",
                  },
                },
              },
            ],

            // --------------------------------------------------
            // Orders By Status
            // --------------------------------------------------

            ordersByStatus: [
              {
                $group: {
                  _id: "$status",
                  count: {
                    $sum: 1,
                  },
                },
              },
              {
                $sort: {
                  count: -1,
                },
              },
            ],

            // --------------------------------------------------
            // Orders By Payment Status
            // --------------------------------------------------

            ordersByPaymentStatus: [
              {
                $group: {
                  _id: "$paymentStatus",
                  count: {
                    $sum: 1,
                  },
                },
              },
              {
                $sort: {
                  count: -1,
                },
              },
            ],

            // --------------------------------------------------
            // Average Order Value
            // --------------------------------------------------

            averageOrderValue: [
              {
                $group: {
                  _id: null,
                  average: {
                    $avg: "$totalAmount",
                  },
                },
              },
            ],

            // --------------------------------------------------
            // Total Subtotal
            // --------------------------------------------------

            totalSubtotal: [
              {
                $group: {
                  _id: null,
                  total: {
                    $sum: "$subtotal",
                  },
                },
              },
            ],

            // --------------------------------------------------
            // Total Discount
            // --------------------------------------------------

            totalDiscount: [
              {
                $group: {
                  _id: null,
                  total: {
                    $sum: "$discount",
                  },
                },
              },
            ],

            // --------------------------------------------------
            // Total Tax
            // --------------------------------------------------

            totalTax: [
              {
                $group: {
                  _id: null,
                  total: {
                    $sum: "$tax",
                  },
                },
              },
            ],
          },
        },
      ]);

      const data = statistics[0];

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message:
          "Order statistics fetched successfully",

        data: {
          totalOrders:
            data.totalOrders[0]?.count || 0,

          totalRevenue:
            data.totalRevenue[0]?.total || 0,

          averageOrderValue:
            Number(
              (
                data.averageOrderValue[0]
                  ?.average || 0
              ).toFixed(2)
            ),

          totalSubtotal:
            data.totalSubtotal[0]?.total || 0,

          totalDiscount:
            data.totalDiscount[0]?.total || 0,

          totalTax:
            data.totalTax[0]?.total || 0,

          ordersByStatus:
            data.ordersByStatus,

          ordersByPaymentStatus:
            data.ordersByPaymentStatus,
        },
      });
    } catch (error) {
      console.error(
        "Get Order Statistics Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message:
          "Failed to fetch order statistics",
        error: error.message,
      });
    }
  }
}

module.exports = new OrderController();