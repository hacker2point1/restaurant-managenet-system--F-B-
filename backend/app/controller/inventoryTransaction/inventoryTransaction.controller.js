const mongoose = require("mongoose");

const InventoryTransaction = require("../../models/inventoryTransaction.model");
const InventoryItem = require("../../models/inventoryItem.model");

const statusCode = require("../../utils/statusCode");
const { isValid: isValidId } = require("../../utils/validation/validation");

class InventoryTransactionController {
  constructor() {
    const methodNames = [
      "getInventoryItem",
      "createTransaction",
      "stockIn",
      "stockOut",
      "purchaseStock",
      "recordWastage",
      "recordReturn",
      "adjustStock",
      "getTransactions",
      "getTransactionById",
      "getItemTransactionHistory",
      "getInventoryConsumption",
      "getInventoryTransactionReport",
    ];

    methodNames.forEach((methodName) => {
      this[methodName] = this[methodName].bind(this);
    });
  }

  async getInventoryItem(inventoryItemId) {
    if (!isValidId(inventoryItemId)) {
      return null;
    }

    return await InventoryItem.findOne({
      _id: inventoryItemId,
      isDeleted: false,
    });
  }

  
  async createTransaction({
    inventoryItem,
    branch,
    type,
    quantity,
    previousQuantity,
    newQuantity,
    unitCost = 0,
    referenceType,
    referenceId,
    reason,
    performedBy,
    session,
  }) {
    const transaction = await InventoryTransaction.create(
      [
        {
          inventoryItem,
          branch,
          type,
          quantity,
          previousQuantity,
          newQuantity,
          unitCost,
          referenceType,
          referenceId,
          reason,
          performedBy,
          transactionDate: new Date(),
        },
      ],
      { session }
    );

    return transaction[0];
  }

  // ============================================================
  // STOCK IN
  //
  // POST /api/inventory-transactions/stock-in
  // ============================================================

  async stockIn(req, res) {
    const session = await mongoose.startSession();

    try {
      const {
        inventoryItem,
        quantity,
        unitCost,
        reason,
        referenceType = "manual",
        referenceId,
      } = req.body;

      const performedBy =
        req.user?._id || req.user?.id;

      // --------------------------------------------------------
      // Validate user
      // --------------------------------------------------------

      if (!performedBy || !isValidId(performedBy)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Valid performedBy user is required",
        });
      }

      // --------------------------------------------------------
      // Validate inventory item
      // --------------------------------------------------------

      if (!inventoryItem || !isValidId(inventoryItem)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Valid inventory item ID is required",
        });
      }

      // --------------------------------------------------------
      // Validate quantity
      // --------------------------------------------------------

      if (
        quantity === undefined ||
        Number(quantity) <= 0
      ) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Quantity must be greater than 0",
        });
      }

      if (
        unitCost !== undefined &&
        Number(unitCost) < 0
      ) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Unit cost cannot be negative",
        });
      }

      // --------------------------------------------------------
      // Get inventory item
      // --------------------------------------------------------

      const inventory = await InventoryItem.findOne({
        _id: inventoryItem,
        isDeleted: false,
      }).session(session);

      if (!inventory) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Inventory item not found",
        });
      }

      if (!inventory.isActive) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Inventory item is inactive",
        });
      }

      // --------------------------------------------------------
      // Start transaction
      // --------------------------------------------------------

      session.startTransaction();

      const previousQuantity =
        Number(inventory.currentQuantity);

      const newQuantity =
        previousQuantity + Number(quantity);

      inventory.currentQuantity = newQuantity;

      if (unitCost !== undefined) {
        inventory.unitCost = Number(unitCost);
      }

      await inventory.save({ session });

      // --------------------------------------------------------
      // Create transaction
      // --------------------------------------------------------

      const transaction =
        await this.createTransaction({
          inventoryItem: inventory._id,
          branch: inventory.branch,
          type: "stock-in",
          quantity: Number(quantity),
          previousQuantity,
          newQuantity,
          unitCost:
            unitCost !== undefined
              ? Number(unitCost)
              : Number(inventory.unitCost || 0),
          referenceType,
          referenceId:
            referenceId &&
            isValidId(referenceId)
              ? referenceId
              : undefined,
          reason,
          performedBy,
          session,
        });

      await session.commitTransaction();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Stock added successfully",
        data: {
          inventory: inventory.toObject(),
          transaction,
        },
      });
    } catch (error) {
      await session.abortTransaction();

      console.error("Stock In Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to add stock",
        error: error.message,
      });
    } finally {
      session.endSession();
    }
  }

  // ============================================================
  // STOCK OUT
  //
  // POST /api/inventory-transactions/stock-out
  // ============================================================

  async stockOut(req, res) {
    const session = await mongoose.startSession();

    try {
      const {
        inventoryItem,
        quantity,
        reason,
        referenceType = "manual",
        referenceId,
      } = req.body;

      const performedBy =
        req.user?._id || req.user?.id;

      // --------------------------------------------------------
      // Validate
      // --------------------------------------------------------

      if (!performedBy || !isValidId(performedBy)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Valid performedBy user is required",
        });
      }

      if (!inventoryItem || !isValidId(inventoryItem)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Valid inventory item ID is required",
        });
      }

      if (
        quantity === undefined ||
        Number(quantity) <= 0
      ) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Quantity must be greater than 0",
        });
      }

      // --------------------------------------------------------
      // Get inventory
      // --------------------------------------------------------

      const inventory = await InventoryItem.findOne({
        _id: inventoryItem,
        isDeleted: false,
      }).session(session);

      if (!inventory) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Inventory item not found",
        });
      }

      if (!inventory.isActive) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Inventory item is inactive",
        });
      }

      // --------------------------------------------------------
      // Check stock
      // --------------------------------------------------------

      const previousQuantity =
        Number(inventory.currentQuantity);

      const requestedQuantity =
        Number(quantity);

      if (requestedQuantity > previousQuantity) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Insufficient inventory stock",
          data: {
            currentQuantity: previousQuantity,
            requestedQuantity,
          },
        });
      }

      session.startTransaction();

      // --------------------------------------------------------
      // Calculate new quantity
      // --------------------------------------------------------

      const newQuantity =
        previousQuantity - requestedQuantity;

      inventory.currentQuantity = newQuantity;

      await inventory.save({ session });

      // --------------------------------------------------------
      // Create transaction
      // --------------------------------------------------------

      const transaction =
        await this.createTransaction({
          inventoryItem: inventory._id,
          branch: inventory.branch,
          type: "stock-out",
          quantity: requestedQuantity,
          previousQuantity,
          newQuantity,
          unitCost: Number(
            inventory.unitCost || 0
          ),
          referenceType,
          referenceId:
            referenceId &&
            isValidId(referenceId)
              ? referenceId
              : undefined,
          reason,
          performedBy,
          session,
        });

      await session.commitTransaction();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Stock removed successfully",
        data: {
          inventory: inventory.toObject(),
          transaction,
        },
      });
    } catch (error) {
      await session.abortTransaction();

      console.error("Stock Out Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to remove stock",
        error: error.message,
      });
    } finally {
      session.endSession();
    }
  }

  // ============================================================
  // PURCHASE STOCK
  //
  // POST /api/inventory-transactions/purchase
  // ============================================================

  async purchaseStock(req, res) {
    const session = await mongoose.startSession();

    try {
      const {
        inventoryItem,
        quantity,
        unitCost,
        referenceId,
        reason,
      } = req.body;

      const performedBy =
        req.user?._id || req.user?.id;

      // --------------------------------------------------------
      // Validate
      // --------------------------------------------------------

      if (!performedBy || !isValidId(performedBy)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Valid performedBy user is required",
        });
      }

      if (!inventoryItem || !isValidId(inventoryItem)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Valid inventory item ID is required",
        });
      }

      if (
        quantity === undefined ||
        Number(quantity) <= 0
      ) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Quantity must be greater than 0",
        });
      }

      if (
        unitCost === undefined ||
        Number(unitCost) < 0
      ) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message:
            "Unit cost is required for purchase stock",
        });
      }

      const inventory = await InventoryItem.findOne({
        _id: inventoryItem,
        isDeleted: false,
      }).session(session);

      if (!inventory) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Inventory item not found",
        });
      }

      if (!inventory.isActive) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Inventory item is inactive",
        });
      }

      session.startTransaction();

      const previousQuantity =
        Number(inventory.currentQuantity);

      const newQuantity =
        previousQuantity + Number(quantity);

      inventory.currentQuantity = newQuantity;
      inventory.unitCost = Number(unitCost);

      await inventory.save({ session });

      const transaction =
        await this.createTransaction({
          inventoryItem: inventory._id,
          branch: inventory.branch,
          type: "purchase",
          quantity: Number(quantity),
          previousQuantity,
          newQuantity,
          unitCost: Number(unitCost),
          referenceType: "purchase",
          referenceId:
            referenceId &&
            isValidId(referenceId)
              ? referenceId
              : undefined,
          reason,
          performedBy,
          session,
        });

      await session.commitTransaction();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Stock purchased successfully",
        data: {
          inventory: inventory.toObject(),
          transaction,
        },
      });
    } catch (error) {
      await session.abortTransaction();

      console.error(
        "Purchase Stock Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to purchase stock",
        error: error.message,
      });
    } finally {
      session.endSession();
    }
  }

  // ============================================================
  // RECORD WASTAGE
  //
  // POST /api/inventory-transactions/wastage
  // ============================================================

  async recordWastage(req, res) {
    const session = await mongoose.startSession();

    try {
      const {
        inventoryItem,
        quantity,
        reason,
      } = req.body;

      const performedBy =
        req.user?._id || req.user?.id;

      if (!performedBy || !isValidId(performedBy)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Valid performedBy user is required",
        });
      }

      if (!inventoryItem || !isValidId(inventoryItem)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Valid inventory item ID is required",
        });
      }

      if (
        quantity === undefined ||
        Number(quantity) <= 0
      ) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Wastage quantity must be greater than 0",
        });
      }

      if (!reason || !reason.trim()) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Wastage reason is required",
        });
      }

      const inventory = await InventoryItem.findOne({
        _id: inventoryItem,
        isDeleted: false,
      }).session(session);

      if (!inventory) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Inventory item not found",
        });
      }

      const previousQuantity =
        Number(inventory.currentQuantity);

      const wastageQuantity =
        Number(quantity);

      if (wastageQuantity > previousQuantity) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message:
            "Wastage quantity cannot exceed current stock",
        });
      }

      session.startTransaction();

      const newQuantity =
        previousQuantity - wastageQuantity;

      inventory.currentQuantity = newQuantity;

      await inventory.save({ session });

      const transaction =
        await this.createTransaction({
          inventoryItem: inventory._id,
          branch: inventory.branch,
          type: "wastage",
          quantity: wastageQuantity,
          previousQuantity,
          newQuantity,
          unitCost: Number(
            inventory.unitCost || 0
          ),
          referenceType: "wastage",
          reason,
          performedBy,
          session,
        });

      await session.commitTransaction();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Wastage recorded successfully",
        data: {
          inventory: inventory.toObject(),
          transaction,
        },
      });
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      console.error(
        "Record Wastage Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message:
          "Failed to record wastage",
        error: error.message,
      });
    } finally {
      await session.endSession();
    }
  }

  // ============================================================
  // RECORD RETURN
  //
  // POST /api/inventory-transactions/return
  // ============================================================

  async recordReturn(req, res) {
    const session = await mongoose.startSession();

    try {
      const {
        inventoryItem,
        quantity,
        referenceId,
        reason,
      } = req.body;

      const performedBy =
        req.user?._id || req.user?.id;

      if (!performedBy || !isValidId(performedBy)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Valid performedBy user is required",
        });
      }

      if (!inventoryItem || !isValidId(inventoryItem)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Valid inventory item ID is required",
        });
      }

      if (
        quantity === undefined ||
        Number(quantity) <= 0
      ) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Return quantity must be greater than 0",
        });
      }

      const inventory = await InventoryItem.findOne({
        _id: inventoryItem,
        isDeleted: false,
      }).session(session);

      if (!inventory) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Inventory item not found",
        });
      }

      session.startTransaction();

      const previousQuantity =
        Number(inventory.currentQuantity);

      const returnQuantity =
        Number(quantity);

      const newQuantity =
        previousQuantity + returnQuantity;

      inventory.currentQuantity = newQuantity;

      await inventory.save({ session });

      const transaction =
        await this.createTransaction({
          inventoryItem: inventory._id,
          branch: inventory.branch,
          type: "return",
          quantity: returnQuantity,
          previousQuantity,
          newQuantity,
          unitCost: Number(
            inventory.unitCost || 0
          ),
          referenceType: "return",
          referenceId:
            referenceId &&
            isValidId(referenceId)
              ? referenceId
              : undefined,
          reason,
          performedBy,
          session,
        });

      await session.commitTransaction();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Stock return recorded successfully",
        data: {
          inventory: inventory.toObject(),
          transaction,
        },
      });
    } catch (error) {
      await session.abortTransaction();

      console.error(
        "Record Return Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message:
          "Failed to record stock return",
        error: error.message,
      });
    } finally {
      session.endSession();
    }
  }

  // ============================================================
  // ADJUST STOCK
  //
  // POST /api/inventory-transactions/adjust
  // ============================================================

  async adjustStock(req, res) {
    const session = await mongoose.startSession();

    try {
      const {
        inventoryItem,
        newQuantity,
        reason,
      } = req.body;

      const performedBy =
        req.user?._id || req.user?.id;

      if (!performedBy || !isValidId(performedBy)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Valid performedBy user is required",
        });
      }

      if (!inventoryItem || !isValidId(inventoryItem)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Valid inventory item ID is required",
        });
      }

      if (
        newQuantity === undefined ||
        Number(newQuantity) < 0
      ) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message:
            "New quantity must be 0 or greater",
        });
      }

      if (!reason || !reason.trim()) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message:
            "Adjustment reason is required",
        });
      }

      const inventory = await InventoryItem.findOne({
        _id: inventoryItem,
        isDeleted: false,
      }).session(session);

      if (!inventory) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Inventory item not found",
        });
      }

      session.startTransaction();

      const previousQuantity =
        Number(inventory.currentQuantity);

      const adjustedQuantity =
        Number(newQuantity);

      inventory.currentQuantity =
        adjustedQuantity;

      await inventory.save({ session });

      const difference = Math.abs(
        adjustedQuantity - previousQuantity
      );

      const transaction =
        await this.createTransaction({
          inventoryItem: inventory._id,
          branch: inventory.branch,
          type: "adjustment",
          quantity: difference,
          previousQuantity,
          newQuantity: adjustedQuantity,
          unitCost: Number(
            inventory.unitCost || 0
          ),
          referenceType: "manual",
          reason,
          performedBy,
          session,
        });

      await session.commitTransaction();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Stock adjusted successfully",
        data: {
          inventory: inventory.toObject(),
          transaction,
        },
      });
    } catch (error) {
      await session.abortTransaction();

      console.error(
        "Adjust Stock Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message:
          "Failed to adjust stock",
        error: error.message,
      });
    } finally {
      session.endSession();
    }
  }

  // ============================================================
  // GET TRANSACTIONS
  //
  // GET /api/inventory-transactions
  // ============================================================

  async getTransactions(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        branch,
        inventoryItem,
        type,
        startDate,
        endDate,
        search,
      } = req.query;

      const match = {};

      if (search && search.trim()) {
  const searchRegex = new RegExp(search.trim(), "i");

  const matchingItems = await InventoryItem.find({
    $or: [
      { name: searchRegex },
      { sku: searchRegex },
    ],
  }).select("_id");

  const itemIds = matchingItems.map((item) => item._id);

  const searchConditions = [];

  if (itemIds.length) {
    searchConditions.push({
      inventoryItem: { $in: itemIds },
    });
  }

  if (isValidId(search.trim())) {
    searchConditions.push({
      _id: new mongoose.Types.ObjectId(search.trim()),
    });
  }

  if (searchConditions.length) {
    match.$or = searchConditions;
  } else {
    match.inventoryItem = {
      $in: [],
    };
  }
}









      const pageNumber = Math.max(
        Number(page),
        1
      );

      const limitNumber = Math.max(
        Number(limit),
        1
      );

      const skip =
        (pageNumber - 1) * limitNumber;

      // --------------------------------------------------------
      // Branch
      // --------------------------------------------------------

      if (branch) {
        if (!isValidId(branch)) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid branch ID",
          });
        }

        match.branch =
          new mongoose.Types.ObjectId(branch);
      }

      // --------------------------------------------------------
      // Inventory item
      // --------------------------------------------------------

      if (inventoryItem) {
        if (!isValidId(inventoryItem)) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message:
              "Invalid inventory item ID",
          });
        }

        match.inventoryItem =
          new mongoose.Types.ObjectId(
            inventoryItem
          );
      }

      // --------------------------------------------------------
      // Transaction type
      // --------------------------------------------------------

      if (type) {
        const allowedTypes = [
          "purchase",
          "stock-in",
          "stock-out",
          "wastage",
          "return",
          "adjustment",
        ];

        if (!allowedTypes.includes(type)) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid transaction type",
          });
        }

        match.type = type;
      }

      // --------------------------------------------------------
      // Date filter
      // --------------------------------------------------------

      if (startDate || endDate) {
        match.transactionDate = {};

        if (startDate) {
          const start = new Date(startDate);

          if (isNaN(start.getTime())) {
            return res.status(statusCode.BAD_REQUEST).json({
              status: false,
              message: "Invalid start date",
            });
          }

          match.transactionDate.$gte = start;
        }

        if (endDate) {
          const end = new Date(endDate);

          if (isNaN(end.getTime())) {
            return res.status(statusCode.BAD_REQUEST).json({
              status: false,
              message: "Invalid end date",
            });
          }

          end.setHours(
            23,
            59,
            59,
            999
          );

          match.transactionDate.$lte = end;
        }
      }

      // --------------------------------------------------------
      // Aggregation
      // --------------------------------------------------------

      const transactions =
        await InventoryTransaction.aggregate([
          {
            $match: match,
          },

          // Inventory Item
          {
            $lookup: {
              from: "inventoryitems",
              localField: "inventoryItem",
              foreignField: "_id",
              as: "inventoryItemDetails",
            },
          },

          {
            $unwind: {
              path: "$inventoryItemDetails",
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

          // User
          {
            $lookup: {
              from: "users",
              localField: "performedBy",
              foreignField: "_id",
              as: "performedByDetails",
            },
          },

          {
            $unwind: {
              path: "$performedByDetails",
              preserveNullAndEmptyArrays: true,
            },
          },

          // Final projection
          {
            $project: {
              inventoryItem: {
                _id: "$inventoryItemDetails._id",
                name: "$inventoryItemDetails.name",
                sku: "$inventoryItemDetails.sku",
                unit: "$inventoryItemDetails.unit",
              },

              branch: {
                _id: "$branchDetails._id",
                name: "$branchDetails.name",
                branchCode:
                  "$branchDetails.branchCode",
              },

              type: 1,
              quantity: 1,
              previousQuantity: 1,
              newQuantity: 1,
              unitCost: 1,
              referenceType: 1,
              referenceId: 1,
              reason: 1,

              performedBy: {
                _id: "$performedByDetails._id",
                name: "$performedByDetails.name",
                email: "$performedByDetails.email",
              },

              transactionDate: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },

          {
            $sort: {
              transactionDate: -1,
            },
          },

          {
            $skip: skip,
          },

          {
            $limit: limitNumber,
          },
        ]);

      const totalTransactions =
        await InventoryTransaction.countDocuments(
          match
        );

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message:
          "Inventory transactions fetched successfully",

        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalTransactions,
          totalPages: Math.ceil(
            totalTransactions /
              limitNumber
          ),
        },

        count: transactions.length,
        data: transactions,
      });
    } catch (error) {
      console.error(
        "Get Transactions Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message:
          "Failed to fetch inventory transactions",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET TRANSACTION BY ID
  //
  // GET /api/inventory-transactions/:id
  // ============================================================

  async getTransactionById(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid transaction ID",
        });
      }

      const transactions =
        await InventoryTransaction.aggregate([
          {
            $match: {
              _id: new mongoose.Types.ObjectId(id),
            },
          },

          {
            $lookup: {
              from: "inventoryitems",
              localField: "inventoryItem",
              foreignField: "_id",
              as: "inventoryItemDetails",
            },
          },

          {
            $unwind: {
              path: "$inventoryItemDetails",
              preserveNullAndEmptyArrays: true,
            },
          },

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

          {
            $lookup: {
              from: "users",
              localField: "performedBy",
              foreignField: "_id",
              as: "performedByDetails",
            },
          },

          {
            $unwind: {
              path: "$performedByDetails",
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $project: {
              inventoryItem: {
                _id: "$inventoryItemDetails._id",
                name: "$inventoryItemDetails.name",
                sku: "$inventoryItemDetails.sku",
                unit: "$inventoryItemDetails.unit",
              },

              branch: {
                _id: "$branchDetails._id",
                name: "$branchDetails.name",
                branchCode:
                  "$branchDetails.branchCode",
                address:
                  "$branchDetails.address",
              },

              type: 1,
              quantity: 1,
              previousQuantity: 1,
              newQuantity: 1,
              unitCost: 1,
              referenceType: 1,
              referenceId: 1,
              reason: 1,

              performedBy: {
                _id: "$performedByDetails._id",
                name: "$performedByDetails.name",
                email: "$performedByDetails.email",
              },

              transactionDate: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ]);

      if (!transactions.length) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Transaction not found",
        });
      }

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message:
          "Inventory transaction fetched successfully",
        data: transactions[0],
      });
    } catch (error) {
      console.error(
        "Get Transaction By ID Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message:
          "Failed to fetch inventory transaction",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET ITEM TRANSACTION HISTORY
  //
  // GET /api/inventory-items/:inventoryItemId/transactions
  // ============================================================

  async getItemTransactionHistory(req, res) {
    try {
      const { inventoryItemId } =
        req.params;

      if (!isValidId(inventoryItemId)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message:
            "Invalid inventory item ID",
        });
      }

      const transactions =
        await InventoryTransaction.aggregate([
          {
            $match: {
              inventoryItem:
                new mongoose.Types.ObjectId(
                  inventoryItemId
                ),
            },
          },

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

          {
            $lookup: {
              from: "users",
              localField: "performedBy",
              foreignField: "_id",
              as: "performedByDetails",
            },
          },

          {
            $unwind: {
              path: "$performedByDetails",
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $project: {
              inventoryItem: 1,
              branch: {
                _id: "$branchDetails._id",
                name: "$branchDetails.name",
                branchCode:
                  "$branchDetails.branchCode",
              },

              type: 1,
              quantity: 1,
              previousQuantity: 1,
              newQuantity: 1,
              unitCost: 1,
              referenceType: 1,
              referenceId: 1,
              reason: 1,

              performedBy: {
                _id: "$performedByDetails._id",
                name: "$performedByDetails.name",
              },

              transactionDate: 1,
            },
          },

          {
            $sort: {
              transactionDate: -1,
            },
          },
        ]);

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message:
          "Inventory item transaction history fetched successfully",
        count: transactions.length,
        data: transactions,
      });
    } catch (error) {
      console.error(
        "Get Item Transaction History Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message:
          "Failed to fetch item transaction history",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET INVENTORY CONSUMPTION
  //
  // GET /api/inventory-transactions/consumption
  //
  // referenceType = order
  // and type = stock-out
  // ============================================================

  async getInventoryConsumption(req, res) {
    try {
      const {
        branch,
        inventoryItem,
        startDate,
        endDate,
      } = req.query;

      const match = {
        type: "stock-out",
        referenceType: "order",
      };

      // --------------------------------------------------------
      // Branch
      // --------------------------------------------------------

      if (branch) {
        if (!isValidId(branch)) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid branch ID",
          });
        }

        match.branch =
          new mongoose.Types.ObjectId(branch);
      }

      // --------------------------------------------------------
      // Inventory item
      // --------------------------------------------------------

      if (inventoryItem) {
        if (!isValidId(inventoryItem)) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message:
              "Invalid inventory item ID",
          });
        }

        match.inventoryItem =
          new mongoose.Types.ObjectId(
            inventoryItem
          );
      }

      // --------------------------------------------------------
      // Date filter
      // --------------------------------------------------------

      if (startDate || endDate) {
        match.transactionDate = {};

        if (startDate) {
          const start = new Date(startDate);

          if (isNaN(start.getTime())) {
            return res.status(statusCode.BAD_REQUEST).json({
              status: false,
              message: "Invalid start date",
            });
          }

          match.transactionDate.$gte = start;
        }

        if (endDate) {
          const end = new Date(endDate);

          if (isNaN(end.getTime())) {
            return res.status(statusCode.BAD_REQUEST).json({
              status: false,
              message: "Invalid end date",
            });
          }

          end.setHours(
            23,
            59,
            59,
            999
          );

          match.transactionDate.$lte = end;
        }
      }

      // --------------------------------------------------------
      // Aggregate consumption
      // --------------------------------------------------------

      const consumption =
        await InventoryTransaction.aggregate([
          {
            $match: match,
          },

          {
            $lookup: {
              from: "inventoryitems",
              localField: "inventoryItem",
              foreignField: "_id",
              as: "inventoryDetails",
            },
          },

          {
            $unwind: {
              path: "$inventoryDetails",
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $group: {
              _id: "$inventoryItem",

              itemName: {
                $first:
                  "$inventoryDetails.name",
              },

              sku: {
                $first:
                  "$inventoryDetails.sku",
              },

              unit: {
                $first:
                  "$inventoryDetails.unit",
              },

              totalConsumed: {
                $sum: "$quantity",
              },

              transactionCount: {
                $sum: 1,
              },

              totalConsumptionCost: {
                $sum: {
                  $multiply: [
                    "$quantity",
                    "$unitCost",
                  ],
                },
              },
            },
          },

          {
            $sort: {
              totalConsumed: -1,
            },
          },
        ]);

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message:
          "Inventory consumption fetched successfully",
        count: consumption.length,
        data: consumption,
      });
    } catch (error) {
      console.error(
        "Get Inventory Consumption Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message:
          "Failed to fetch inventory consumption",
        error: error.message,
      });
    }
  }

  // ============================================================
  // INVENTORY TRANSACTION REPORT
  //
  // GET /api/inventory-transactions/report
  // ============================================================

  async getInventoryTransactionReport(
    req,
    res
  ) {
    try {
      const {
        branch,
        inventoryItem,
        startDate,
        endDate,
      } = req.query;

      const match = {};

      // --------------------------------------------------------
      // Branch
      // --------------------------------------------------------

      if (branch) {
        if (!isValidId(branch)) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid branch ID",
          });
        }

        match.branch =
          new mongoose.Types.ObjectId(branch);
      }

      // --------------------------------------------------------
      // Inventory Item
      // --------------------------------------------------------

      if (inventoryItem) {
        if (!isValidId(inventoryItem)) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message:
              "Invalid inventory item ID",
          });
        }

        match.inventoryItem =
          new mongoose.Types.ObjectId(
            inventoryItem
          );
      }

      // --------------------------------------------------------
      // Date range
      // --------------------------------------------------------

      if (startDate || endDate) {
        match.transactionDate = {};

        if (startDate) {
          const start = new Date(startDate);

          if (isNaN(start.getTime())) {
            return res.status(statusCode.BAD_REQUEST).json({
              status: false,
              message: "Invalid start date",
            });
          }

          match.transactionDate.$gte = start;
        }

        if (endDate) {
          const end = new Date(endDate);

          if (isNaN(end.getTime())) {
            return res.status(statusCode.BAD_REQUEST).json({
              status: false,
              message: "Invalid end date",
            });
          }

          end.setHours(
            23,
            59,
            59,
            999
          );

          match.transactionDate.$lte = end;
        }
      }

      // --------------------------------------------------------
      // Report aggregation
      // --------------------------------------------------------

      const report =
        await InventoryTransaction.aggregate([
          {
            $match: match,
          },

          // ----------------------------------------------------
          // Overall statistics + type statistics
          // ----------------------------------------------------

          {
            $facet: {
              // ----------------------------------------------
              // Overall
              // ----------------------------------------------

              summary: [
                {
                  $group: {
                    _id: null,

                    totalTransactions: {
                      $sum: 1,
                    },

                    totalQuantity: {
                      $sum: "$quantity",
                    },

                    totalTransactionValue: {
                      $sum: {
                        $multiply: [
                          "$quantity",
                          "$unitCost",
                        ],
                      },
                    },
                  },
                },
              ],

              // ----------------------------------------------
              // By transaction type
              // ----------------------------------------------

              byType: [
                {
                  $group: {
                    _id: "$type",

                    transactionCount: {
                      $sum: 1,
                    },

                    totalQuantity: {
                      $sum: "$quantity",
                    },

                    totalValue: {
                      $sum: {
                        $multiply: [
                          "$quantity",
                          "$unitCost",
                        ],
                      },
                    },
                  },
                },

                {
                  $sort: {
                    totalQuantity: -1,
                  },
                },
              ],

              // ----------------------------------------------
              // By inventory item
              // ----------------------------------------------

              byInventoryItem: [
                {
                  $lookup: {
                    from: "inventoryitems",
                    localField: "inventoryItem",
                    foreignField: "_id",
                    as: "inventoryDetails",
                  },
                },

                {
                  $unwind: {
                    path: "$inventoryDetails",
                    preserveNullAndEmptyArrays: true,
                  },
                },

                {
                  $group: {
                    _id: "$inventoryItem",

                    itemName: {
                      $first:
                        "$inventoryDetails.name",
                    },

                    sku: {
                      $first:
                        "$inventoryDetails.sku",
                    },

                    unit: {
                      $first:
                        "$inventoryDetails.unit",
                    },

                    transactionCount: {
                      $sum: 1,
                    },

                    totalQuantity: {
                      $sum: "$quantity",
                    },

                    totalValue: {
                      $sum: {
                        $multiply: [
                          "$quantity",
                          "$unitCost",
                        ],
                      },
                    },
                  },
                },

                {
                  $sort: {
                    totalQuantity: -1,
                  },
                },
              ],
            },
          },
        ]);

      const data = report[0];

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message:
          "Inventory transaction report generated successfully",

        data: {
          summary:
            data.summary[0] || {
              totalTransactions: 0,
              totalQuantity: 0,
              totalTransactionValue: 0,
            },

          byType: data.byType,

          byInventoryItem:
            data.byInventoryItem,
        },
      });
    } catch (error) {
      console.error(
        "Inventory Transaction Report Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message:
          "Failed to generate inventory transaction report",
        error: error.message,
      });
    }
  }
}

module.exports =
  new InventoryTransactionController();