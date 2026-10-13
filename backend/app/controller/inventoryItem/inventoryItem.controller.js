const InventoryItem = require("../../models/inventoryItem.model");
const mongoose = require("mongoose");
const Branch = require("../../models/branch.model");
const StatusCode = require("../../utils/statusCode");
const { isValid: isValidId } = require("../../utils/validation/validation");

class InventoryItemController {
  // ======================================================
  // CREATE INVENTORY ITEM
  // ======================================================

  async createInventoryItem(req, res) {
    try {
      const { branchId } = req.params;

      const {
        name,
        sku,
        unit,
        currentQuantity,
        minimumStock,
        maximumStock,
        unitCost,
        supplier,
        expiryDate,
        isActive,
      } = req.body;

      // --------------------------------------------------
      // Validate branch ID
      // --------------------------------------------------

      if (!isValidId(branchId)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      // --------------------------------------------------
      // Required fields
      // --------------------------------------------------

      if (!name || !unit) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Name and unit are required",
        });
      }

      // --------------------------------------------------
      // Check branch
      // --------------------------------------------------

      const branch = await Branch.findOne({
        _id: branchId,
        isDeleted: false,
      });

      if (!branch) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Branch not found",
        });
      }

      // --------------------------------------------------
      // Check duplicate SKU
      // --------------------------------------------------

      if (sku) {
        const existingSKU = await InventoryItem.findOne({
          branch: branchId,
          sku: sku.trim(),
          isDeleted: false,
        });

        if (existingSKU) {
          return res.status(StatusCode.CONFLICT).json({
            status: false,
            message: "Inventory item with this SKU already exists",
          });
        }
      }

      // --------------------------------------------------
      // Create
      // --------------------------------------------------

      const inventoryItemId = new mongoose.Types.ObjectId();
      const branchSkuPrefix = String(
        branch.branchCode || branchId.slice(-6)
      )
        .replace(/[^a-z0-9]/gi, "")
        .toUpperCase();
      const itemSku = sku?.trim() ||
        `INV-${branchSkuPrefix}-${inventoryItemId.toString().slice(-8).toUpperCase()}`;

      const inventoryItem = await InventoryItem.create({
        _id: inventoryItemId,
        branch: branchId,
        name: name.trim(),
        sku: itemSku,

        unit,

        currentQuantity:
          currentQuantity !== undefined
            ? Number(currentQuantity)
            : 0,

        minimumStock:
          minimumStock !== undefined
            ? Number(minimumStock)
            : 0,

        maximumStock:
          maximumStock !== undefined
            ? Number(maximumStock)
            : undefined,

        unitCost:
          unitCost !== undefined
            ? Number(unitCost)
            : 0,

        supplier,
        expiryDate,

        // isActive:
        //   isActive !== undefined
        //     ? isActive === true || isActive === "true"
        //     : true,

        // isDeleted: false,
        // deletedAt: null,
      });

      return res.status(StatusCode.CREATED).json({
        status: true,
        message: "Inventory item created successfully",
        data: inventoryItem,
      });
    } catch (error) {
      console.error("Create Inventory Item Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ======================================================
  // GET INVENTORY ITEMS
  // ======================================================

  async getInventoryItems(req, res) {
    try {
      const { branchId } = req.params;

      const {
        page = 1,
        limit = 10,
        search,
        isActive,
        unit,
      } = req.query;

      // --------------------------------------------------
      // Validate branch ID
      // --------------------------------------------------

      if (!isValidId(branchId)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      // --------------------------------------------------
      // Build filter
      // --------------------------------------------------

      const filter = {
        branch: branchId,
        isDeleted: false,
      };

      // --------------------------------------------------
      // Search
      // --------------------------------------------------

      if (search) {
        filter.$or = [
          {
            name: {
              $regex: search,
              $options: "i",
            },
          },
          {
            sku: {
              $regex: search,
              $options: "i",
            },
          },
        ];
      }

      // --------------------------------------------------
      // Active filter
      // --------------------------------------------------

      if (isActive !== undefined) {
        filter.isActive = isActive === "true";
      }

      // --------------------------------------------------
      // Unit filter
      // --------------------------------------------------

      if (unit) {
        filter.unit = unit;
      }

      // --------------------------------------------------
      // Pagination
      // --------------------------------------------------

      const pageNumber = Math.max(Number(page), 1);

      const limitNumber = Math.min(
        Math.max(Number(limit), 1),
        10
      );

      const skip = (pageNumber - 1) * limitNumber;

      // --------------------------------------------------
      // Get data
      // --------------------------------------------------

      const [items, total, statsResult] = await Promise.all([
        InventoryItem.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNumber),

        InventoryItem.countDocuments(filter),

        InventoryItem.aggregate([
          {
            $match: {
              ...filter,
              branch: new mongoose.Types.ObjectId(branchId),
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              inStock: {
                $sum: {
                  $cond: [
                    { $gt: ["$currentQuantity", "$minimumStock"] },
                    1,
                    0,
                  ],
                },
              },
              lowStock: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $gt: ["$currentQuantity", 0] },
                        { $lte: ["$currentQuantity", "$minimumStock"] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              outOfStock: {
                $sum: {
                  $cond: [{ $eq: ["$currentQuantity", 0] }, 1, 0],
                },
              },
              inventoryValue: {
                $sum: {
                  $multiply: ["$currentQuantity", "$unitCost"],
                },
              },
            },
          },
          { $project: { _id: 0 } },
        ]),
      ]);

      const stats = statsResult[0] || {
        total: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        inventoryValue: 0,
      };

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Inventory items fetched successfully",

        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },

        stats,

        data: items,
      });
    } catch (error) {
      console.error("Get Inventory Items Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ======================================================
  // GET INVENTORY ITEM BY ID
  // ======================================================

  async getInventoryItemById(req, res) {
    try {
      const { id } = req.params;

      // --------------------------------------------------
      // Validate ID
      // --------------------------------------------------

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid inventory item ID",
        });
      }

      const item = await InventoryItem.findOne({
        _id: id,
        isDeleted: false,
      }).populate(
        "branch",
        "name branchCode"
      );

      if (!item) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Inventory item not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Inventory item fetched successfully",
        data: item,
      });
    } catch (error) {
      console.error("Get Inventory Item Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ======================================================
  // UPDATE INVENTORY ITEM
  // ======================================================

  async updateInventoryItem(req, res) {
    try {
      const { id } = req.params;

      const {
        name,
        sku,
        unit,
        minimumStock,
        maximumStock,
        unitCost,
        supplier,
        expiryDate,
        isActive,
      } = req.body;

      // --------------------------------------------------
      // Validate ID
      // --------------------------------------------------

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid inventory item ID",
        });
      }

      // --------------------------------------------------
      // Find item
      // --------------------------------------------------

      const item = await InventoryItem.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!item) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Inventory item not found",
        });
      }

      // --------------------------------------------------
      // Check duplicate SKU
      // --------------------------------------------------

      if (sku !== undefined) {
        const existingSKU = await InventoryItem.findOne({
          branch: item.branch,
          sku: sku.trim(),
          isDeleted: false,
          _id: { $ne: id },
        });

        if (existingSKU) {
          return res.status(StatusCode.CONFLICT).json({
            status: false,
            message: "Inventory item with this SKU already exists",
          });
        }

        item.sku = sku.trim();
      }

      // --------------------------------------------------
      // Update fields
      // --------------------------------------------------

      if (name !== undefined) {
        item.name = name.trim();
      }

      if (unit !== undefined) {
        item.unit = unit;
      }

      if (minimumStock !== undefined) {
        item.minimumStock = Number(minimumStock);
      }

      if (maximumStock !== undefined) {
        item.maximumStock = Number(maximumStock);
      }

      if (unitCost !== undefined) {
        item.unitCost = Number(unitCost);
      }

      if (supplier !== undefined) {
        item.supplier = supplier;
      }

      if (expiryDate !== undefined) {
        item.expiryDate = expiryDate;
      }

      if (isActive !== undefined) {
        item.isActive =
          isActive === true ||
          isActive === "true";
      }

      await item.save();

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Inventory item updated successfully",
        data: item,
      });
    } catch (error) {
      console.error("Update Inventory Item Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ======================================================
  // SOFT DELETE INVENTORY ITEM
  // ======================================================

  async softDeleteInventoryItem(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid inventory item ID",
        });
      }

      const item = await InventoryItem.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!item) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Inventory item not found",
        });
      }

      item.isDeleted = true;
      item.deletedAt = new Date();
      item.isActive = false;

      await item.save();

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Inventory item soft deleted successfully",
        data: item,
      });
    } catch (error) {
      console.error(
        "Soft Delete Inventory Item Error:",
        error
      );

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ======================================================
  // HARD DELETE INVENTORY ITEM
  // ======================================================

  async hardDeleteInventoryItem(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid inventory item ID",
        });
      }

      const item = await InventoryItem.findById(id);

      if (!item) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Inventory item not found",
        });
      }

      await InventoryItem.findByIdAndDelete(id);

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Inventory item permanently deleted",
      });
    } catch (error) {
      console.error(
        "Hard Delete Inventory Item Error:",
        error
      );

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ======================================================
  // RESTORE INVENTORY ITEM
  // ======================================================

  async restoreInventoryItem(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid inventory item ID",
        });
      }

      const item = await InventoryItem.findOne({
        _id: id,
        isDeleted: true,
      });

      if (!item) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Deleted inventory item not found",
        });
      }

      // --------------------------------------------------
      // Check duplicate SKU before restore
      // --------------------------------------------------

      if (item.sku) {
        const existingSKU = await InventoryItem.findOne({
          branch: item.branch,
          sku: item.sku,
          isDeleted: false,
          _id: { $ne: id },
        });

        if (existingSKU) {
          return res.status(StatusCode.CONFLICT).json({
            status: false,
            message:
              "Another active inventory item already uses this SKU",
          });
        }
      }

      item.isDeleted = false;
      item.deletedAt = null;
      item.isActive = true;

      await item.save();

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Inventory item restored successfully",
        data: item,
      });
    } catch (error) {
      console.error(
        "Restore Inventory Item Error:",
        error
      );

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ======================================================
  // ACTIVATE INVENTORY ITEM
  // ======================================================

  async activateInventoryItem(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid inventory item ID",
        });
      }

      const item = await InventoryItem.findOneAndUpdate(
        {
          _id: id,
          isDeleted: false,
        },
        {
          $set: {
            isActive: true,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!item) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Inventory item not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Inventory item activated successfully",
        data: item,
      });
    } catch (error) {
      console.error(
        "Activate Inventory Item Error:",
        error
      );

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ======================================================
  // DEACTIVATE INVENTORY ITEM
  // ======================================================

  async deactivateInventoryItem(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid inventory item ID",
        });
      }

      const item = await InventoryItem.findOneAndUpdate(
        {
          _id: id,
          isDeleted: false,
        },
        {
          $set: {
            isActive: false,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!item) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Inventory item not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Inventory item deactivated successfully",
        data: item,
      });
    } catch (error) {
      console.error(
        "Deactivate Inventory Item Error:",
        error
      );

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ======================================================
  // UPDATE STOCK
  // ======================================================

  async updateStock(req, res) {
    try {
      const { id } = req.params;

      const {
        quantity,
        operation,
      } = req.body;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid inventory item ID",
        });
      }

      // --------------------------------------------------
      // Validate quantity
      // --------------------------------------------------

      const quantityNumber = Number(quantity);

      if (
        !Number.isFinite(quantityNumber) ||
        quantityNumber <= 0
      ) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Quantity must be greater than 0",
        });
      }

      // --------------------------------------------------
      // Validate operation
      // --------------------------------------------------

      if (!["add", "remove"].includes(operation)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message:
            "Operation must be either add or remove",
        });
      }

      // --------------------------------------------------
      // Find item
      // --------------------------------------------------

      const item = await InventoryItem.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!item) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Inventory item not found",
        });
      }

      // --------------------------------------------------
      // ADD STOCK
      // --------------------------------------------------

      if (operation === "add") {
        item.currentQuantity += quantityNumber;
      }

      // --------------------------------------------------
      // REMOVE STOCK
      // --------------------------------------------------

      if (operation === "remove") {
        if (item.currentQuantity < quantityNumber) {
          return res.status(StatusCode.BAD_REQUEST).json({
            status: false,
            message: "Insufficient inventory stock",
            currentQuantity: item.currentQuantity,
            requestedQuantity: quantityNumber,
          });
        }

        item.currentQuantity -= quantityNumber;
      }

      await item.save();

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Inventory stock updated successfully",
        data: item,
      });
    } catch (error) {
      console.error("Update Stock Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ======================================================
  // GET LOW STOCK ITEMS
  // ======================================================

  async getLowStockItems(req, res) {
    try {
      const { branchId } = req.params;

      if (!isValidId(branchId)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      const items = await InventoryItem.find({
        branch: branchId,
        isActive: true,
        isDeleted: false,

        $expr: {
          $lte: [
            "$currentQuantity",
            "$minimumStock",
          ],
        },
      }).sort({
        currentQuantity: 1,
      });

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Low stock items fetched successfully",
        count: items.length,
        data: items,
      });
    } catch (error) {
      console.error("Low Stock Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ======================================================
  // GET EXPIRING ITEMS
  // ======================================================

  async getExpiringItems(req, res) {
    try {
      const { branchId } = req.params;

      const {
        days = 7,
      } = req.query;

      if (!isValidId(branchId)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      // --------------------------------------------------
      // Validate days
      // --------------------------------------------------

      const daysNumber = Number(days);

      if (
        !Number.isFinite(daysNumber) ||
        daysNumber < 0
      ) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Days must be a valid number",
        });
      }

      // --------------------------------------------------
      // Date range
      // --------------------------------------------------

      const today = new Date();

      const futureDate = new Date();

      futureDate.setDate(
        futureDate.getDate() + daysNumber
      );

      // --------------------------------------------------
      // Get expiring items
      // --------------------------------------------------

      const items = await InventoryItem.find({
        branch: branchId,
        isActive: true,
        isDeleted: false,

        expiryDate: {
          $gte: today,
          $lte: futureDate,
        },
      }).sort({
        expiryDate: 1,
      });

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message:
          "Expiring inventory items fetched successfully",
        count: items.length,
        data: items,
      });
    } catch (error) {
      console.error("Expiring Items Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
  // ======================================================
// GET DELETED INVENTORY ITEMS
// ======================================================

async getDeletedInventoryItems(req, res) {
  try {
    const { branchId } = req.params;

    const {
      page = 1,
      limit = 10,
      search,
      unit,
    } = req.query;

    // --------------------------------------------------
    // Validate branch ID
    // --------------------------------------------------

    if (!isValidId(branchId)) {
      return res.status(StatusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid branch ID",
      });
    }

    // --------------------------------------------------
    // Build filter
    // --------------------------------------------------

    const filter = {
      branch: branchId,
      isDeleted: true,
    };

    // --------------------------------------------------
    // Search
    // --------------------------------------------------

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          sku: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // --------------------------------------------------
    // Unit filter
    // --------------------------------------------------

    if (unit) {
      filter.unit = unit;
    }

    // --------------------------------------------------
    // Pagination
    // --------------------------------------------------

    const pageNumber = Math.max(
      Number(page),
      1
    );

    const limitNumber = Math.min(
      Math.max(Number(limit), 1),
      100
    );

    const skip =
      (pageNumber - 1) *
      limitNumber;

    // --------------------------------------------------
    // Get deleted items
    // --------------------------------------------------

    const [items, total] =
      await Promise.all([
        InventoryItem.find(filter)
          .sort({
            deletedAt: -1,
          })
          .skip(skip)
          .limit(limitNumber),

        InventoryItem.countDocuments(
          filter
        ),
      ]);

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return res
      .status(StatusCode.SUCCESS)
      .json({
        status: true,

        message:
          "Deleted inventory items fetched successfully",

        pagination: {
          total,

          page: pageNumber,

          limit: limitNumber,

          totalPages:
            Math.ceil(
              total / limitNumber
            ),
        },

        data: items,
      });

  } catch (error) {
    console.error(
      "Get Deleted Inventory Items Error:",
      error
    );

    return res
      .status(
        StatusCode.SERVER_ERROR
      )
      .json({
        status: false,

        message:
          "Internal server error",

        error: error.message,
      });
  }
}
}


module.exports = new InventoryItemController()