const mongoose = require("mongoose");

const Table = require("../../models/table.model");
const Branch = require("../../models/branch.model");
const Restaurant = require("../../models/resturant.model");
const statusCode = require("../../utils/statusCode");


class TableController {
  // ============================================================
  // GET TABLES WITH OPTIONAL RESTAURANT / BRANCH FILTERS
  // ============================================================

  async getAllTables(req, res) {
    try {
      const { restaurantId, branchId } = req.query;
      const filter = { isDeleted: false };

      if (restaurantId && !mongoose.Types.ObjectId.isValid(restaurantId)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid restaurant ID",
        });
      }

      if (branchId) {
        if (!mongoose.Types.ObjectId.isValid(branchId)) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid branch ID",
          });
        }

        const branchFilter = {
          _id: branchId,
          isDeleted: false,
          ...(restaurantId ? { restaurant: restaurantId } : {}),
        };
        const branch = await Branch.findOne(branchFilter).select("_id");

        if (!branch) {
          return res.status(statusCode.NOT_FOUND).json({
            status: false,
            message: "Branch not found",
          });
        }

        filter.branch = branch._id;
      } else if (restaurantId) {
        const restaurant = await Restaurant.findOne({
          _id: restaurantId,
          isDeleted: false,
        }).select("_id");

        if (!restaurant) {
          return res.status(statusCode.NOT_FOUND).json({
            status: false,
            message: "Restaurant not found",
          });
        }

        const branches = await Branch.find({
          restaurant: restaurant._id,
          isDeleted: false,
        }).select("_id");

        filter.branch = { $in: branches.map((branch) => branch._id) };
      }

      const tables = await Table.find(filter)
        .populate("branch", "name branchCode restaurant")
        .sort({ tableNumber: 1 });

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Tables fetched successfully",
        count: tables.length,
        data: tables,
      });
    } catch (error) {
      console.error("Get All Tables Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to fetch tables",
        error: error.message,
      });
    }
  }

  // ============================================================
  // CREATE TABLE
  // ============================================================

  async createTable(req, res) {
    try {
      const { branchId } = req.params;

      const {
        tableNumber,
        capacity,
        location,
        status,
        isActive,
      } = req.body;

      // --------------------------------------------------------
      // Validate branch ID
      // --------------------------------------------------------

      if (!mongoose.Types.ObjectId.isValid(branchId)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      // --------------------------------------------------------
      // Validate required fields
      // --------------------------------------------------------

      if (!tableNumber || !tableNumber.trim()) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Table number is required",
        });
      }

      if (
        capacity === undefined ||
        capacity === null ||
        Number(capacity) < 1
      ) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Capacity must be at least 1",
        });
      }

      // --------------------------------------------------------
      // Check branch
      // --------------------------------------------------------

      const branch = await Branch.findOne({
        _id: branchId,
        isDeleted: false,
      });

      if (!branch) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Branch not found",
        });
      }

      // --------------------------------------------------------
      // Check duplicate table number
      // --------------------------------------------------------

      const existingTable = await Table.findOne({
        branch: branchId,
        tableNumber: tableNumber.trim(),
      });

      if (existingTable) {
        return res.status(409).json({
          status: false,
          message: "Table number already exists in this branch",
        });
      }

      // --------------------------------------------------------
      // Create table
      // --------------------------------------------------------

      const table = await Table.create({
        branch: branchId,
        tableNumber: tableNumber.trim(),
        capacity: Number(capacity),
        location: location || "indoor",
        status: status || "available",
        isActive:
          isActive !== undefined
            ? isActive === true || isActive === "true"
            : true,
        isDeleted: false,
        deletedAt: null,
      });

      return res.status(statusCode.CREATED).json({
        status: true,
        message: "Table created successfully",
        data: table,
      });
    } catch (error) {
      console.error("Create Table Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to create table",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET ALL TABLES
  // GET /api/branches/:branchId/tables
  // ============================================================

  async getTables(req, res) {
    try {
      const { branchId } = req.params;

      // --------------------------------------------------------
      // Validate branch ID
      // --------------------------------------------------------

      if (!mongoose.Types.ObjectId.isValid(branchId)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      // --------------------------------------------------------
      // Check branch
      // --------------------------------------------------------

      const branch = await Branch.findOne({
        _id: branchId,
        isDeleted: false,
      });

      if (!branch) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Branch not found",
        });
      }

      // --------------------------------------------------------
      // Get tables
      // --------------------------------------------------------

      const tables = await Table.find({
        branch: branchId,
        isDeleted: false,
      }).sort({
        tableNumber: 1,
      });

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Tables fetched successfully",
        count: tables.length,
        data: tables,
      });
    } catch (error) {
      console.error("Get Tables Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to fetch tables",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET TABLE BY ID
  // GET /api/tables/:id
  // ============================================================

  async getTableById(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid table ID",
        });
      }

      // --------------------------------------------------------
      // TABLE -> BRANCH -> RESTAURANT
      // Using aggregation instead of populate
      // --------------------------------------------------------

      const tables = await Table.aggregate([
        // ------------------------------------------------------
        // Find table
        // ------------------------------------------------------

        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
            isDeleted: false,
          },
        },

        // ------------------------------------------------------
        // Lookup Branch
        // ------------------------------------------------------

        {
          $lookup: {
            from: "branches",
            localField: "branch",
            foreignField: "_id",
            as: "branchDetails",
          },
        },

        // ------------------------------------------------------
        // Convert branch array to object
        // ------------------------------------------------------

        {
          $unwind: {
            path: "$branchDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        // ------------------------------------------------------
        // Lookup Restaurant through Branch
        // ------------------------------------------------------

        {
          $lookup: {
            from: "restaurants",
            localField: "branchDetails.restaurant",
            foreignField: "_id",
            as: "restaurantDetails",
          },
        },

        // ------------------------------------------------------
        // Convert restaurant array to object
        // ------------------------------------------------------

        {
          $unwind: {
            path: "$restaurantDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        // ------------------------------------------------------
        // Shape response
        // ------------------------------------------------------

        {
          $project: {
            tableNumber: 1,
            capacity: 1,
            location: 1,
            status: 1,
            isActive: 1,
            isDeleted: 1,
            deletedAt: 1,
            createdAt: 1,
            updatedAt: 1,

            branch: {
              _id: "$branchDetails._id",
              name: "$branchDetails.name",
              branchCode: "$branchDetails.branchCode",
              contact: "$branchDetails.contact",
              address: "$branchDetails.address",
            },

            restaurant: {
              _id: "$restaurantDetails._id",
              name: "$restaurantDetails.name",
            },
          },
        },
      ]);

      if (!tables.length) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Table not found",
        });
      }

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Table fetched successfully",
        data: tables[0],
      });
    } catch (error) {
      console.error("Get Table By ID Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to fetch table",
        error: error.message,
      });
    }
  }

  // ============================================================
  // UPDATE TABLE
  // PATCH /api/tables/:id
  // ============================================================

  async updateTable(req, res) {
    try {
      const { id } = req.params;

      const {
        tableNumber,
        capacity,
        location,
        isActive,
      } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid table ID",
        });
      }

      const table = await Table.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!table) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Table not found",
        });
      }

      // --------------------------------------------------------
      // Update table number
      // --------------------------------------------------------

      if (tableNumber !== undefined) {
        if (!tableNumber.trim()) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message: "Table number cannot be empty",
          });
        }

        const existingTable = await Table.findOne({
          branch: table.branch,
          tableNumber: tableNumber.trim(),
          _id: { $ne: id },
          isDeleted: false,
        });

        if (existingTable) {
          return res.status(409).json({
            status: false,
            message:
              "Table number already exists in this branch",
          });
        }

        table.tableNumber = tableNumber.trim();
      }

      // --------------------------------------------------------
      // Update capacity
      // --------------------------------------------------------

      if (capacity !== undefined) {
        if (Number(capacity) < 1) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message: "Capacity must be at least 1",
          });
        }

        table.capacity = Number(capacity);
      }

      // --------------------------------------------------------
      // Update location
      // --------------------------------------------------------

      if (location !== undefined) {
        const allowedLocations = [
          "indoor",
          "outdoor",
          "rooftop",
          "private",
          "bar",
        ];

        if (!allowedLocations.includes(location)) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid table location",
          });
        }

        table.location = location;
      }

      // --------------------------------------------------------
      // Update active status
      // --------------------------------------------------------

      if (isActive !== undefined) {
        table.isActive =
          isActive === true ||
          isActive === "true";
      }

      await table.save();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Table updated successfully",
        data: table,
      });
    } catch (error) {
      console.error("Update Table Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to update table",
        error: error.message,
      });
    }
  }

  // ============================================================
  // SOFT DELETE TABLE
  // PATCH /api/tables/:id/soft-delete
  // ============================================================

  async softDeleteTable(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid table ID",
        });
      }

      const table = await Table.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!table) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message:
            "Table not found or already deleted",
        });
      }

      // --------------------------------------------------------
      // Don't delete occupied/reserved table
      // --------------------------------------------------------

      if (
        table.status === "occupied" ||
        table.status === "reserved"
      ) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message:
            "Occupied or reserved table cannot be deleted",
        });
      }

      table.isDeleted = true;
      table.deletedAt = new Date();
      table.isActive = false;

      await table.save();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Table soft deleted successfully",
        data: table,
      });
    } catch (error) {
      console.error("Soft Delete Table Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to soft delete table",
        error: error.message,
      });
    }
  }

  // ============================================================
  // RESTORE TABLE
  // PATCH /api/tables/:id/restore
  // ============================================================

  async restoreTable(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid table ID",
        });
      }

      const table = await Table.findOne({
        _id: id,
        isDeleted: true,
      });

      if (!table) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Deleted table not found",
        });
      }

      table.isDeleted = false;
      table.deletedAt = null;
      table.isActive = true;
      table.status = "available";

      await table.save();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Table restored successfully",
        data: table,
      });
    } catch (error) {
      console.error("Restore Table Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to restore table",
        error: error.message,
      });
    }
  }

  // ============================================================
  // PERMANENT DELETE TABLE
  // DELETE /api/tables/:id/permanent-delete
  // ============================================================

  async permanentDeleteTable(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid table ID",
        });
      }

      const table = await Table.findById(id);

      if (!table) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Table not found",
        });
      }

      if (
        table.status === "occupied" ||
        table.status === "reserved"
      ) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message:
            "Occupied or reserved table cannot be permanently deleted",
        });
      }

      await Table.findByIdAndDelete(id);

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Table permanently deleted",
      });
    } catch (error) {
      console.error(
        "Permanent Delete Table Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message:
          "Failed to permanently delete table",
        error: error.message,
      });
    }
  }

  // ============================================================
  // UPDATE TABLE STATUS
  // PATCH /api/tables/:id/status
  // ============================================================

  async updateTableStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "available",
        "occupied",
        "reserved",
        "maintenance",
      ];

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid table ID",
        });
      }

      if (!allowedStatuses.includes(status)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message:
            "Invalid status. Allowed values: available, occupied, reserved, maintenance",
        });
      }

      const table = await Table.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!table) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Table not found",
        });
      }

      if (!table.isActive) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message:
            "Inactive table status cannot be changed",
        });
      }

      table.status = status;

      await table.save();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Table status updated successfully",
        data: table,
      });
    } catch (error) {
      console.error(
        "Update Table Status Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to update table status",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET AVAILABLE TABLES
  //
  // GET /api/branches/:branchId/tables/available
  //
  // Optional query parameters:
  // ?capacity=4
  // ?location=rooftop
  // ?city=Kolkata
  // ?state=West Bengal
  // ?country=India
  // ?zipCode=700001
  //
  // Flow:
  // Table -> Branch -> Restaurant
  // ============================================================

  async getAvailableTables(req, res) {
    try {
      const { branchId } = req.params;

      const {
        capacity,
        location,
        city,
        state,
        country,
        zipCode,
      } = req.query;

      // --------------------------------------------------------
      // Validate branch ID
      // --------------------------------------------------------

      if (!mongoose.Types.ObjectId.isValid(branchId)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      // --------------------------------------------------------
      // Validate capacity
      // --------------------------------------------------------

      if (
        capacity !== undefined &&
        Number(capacity) < 1
      ) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Capacity must be at least 1",
        });
      }

      // --------------------------------------------------------
      // Build table match
      // --------------------------------------------------------

      const tableMatch = {
        branch: new mongoose.Types.ObjectId(branchId),
        status: "available",
        isActive: true,
        isDeleted: false,
      };

      // --------------------------------------------------------
      // Capacity filter
      // --------------------------------------------------------

      if (capacity !== undefined) {
        tableMatch.capacity = {
          $gte: Number(capacity),
        };
      }

      // --------------------------------------------------------
      // Table location filter
      //
      // Example:
      // ?location=rooftop
      // --------------------------------------------------------

      if (location !== undefined) {
        const allowedLocations = [
          "indoor",
          "outdoor",
          "rooftop",
          "private",
          "bar",
        ];

        if (!allowedLocations.includes(location)) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message:
              "Invalid table location. Allowed values: indoor, outdoor, rooftop, private, bar",
          });
        }

        tableMatch.location = location;
      }

      // --------------------------------------------------------
      // Aggregation
      // Table -> Branch -> Restaurant
      // --------------------------------------------------------

      const tables = await Table.aggregate([
        // ------------------------------------------------------
        // 1. Match available tables
        // ------------------------------------------------------

        {
          $match: tableMatch,
        },

        // ------------------------------------------------------
        // 2. Lookup Branch
        // ------------------------------------------------------

        {
          $lookup: {
            from: "branches",
            localField: "branch",
            foreignField: "_id",
            as: "branchDetails",
          },
        },

        // ------------------------------------------------------
        // 3. Convert Branch array into object
        // ------------------------------------------------------

        {
          $unwind: {
            path: "$branchDetails",
            preserveNullAndEmptyArrays: false,
          },
        },

        // ------------------------------------------------------
        // 4. Make sure branch is not deleted
        // ------------------------------------------------------

        {
          $match: {
            "branchDetails.isDeleted": false,
          },
        },

        // ------------------------------------------------------
        // 5. Filter using BRANCH ADDRESS
        //
        // Example:
        // branch.address.city = "Kolkata"
        // branch.address.state = "West Bengal"
        // ------------------------------------------------------

        ...(city
          ? [
              {
                $match: {
                  "branchDetails.address.city": {
                    $regex: `^${city}$`,
                    $options: "i",
                  },
                },
              },
            ]
          : []),

        ...(state
          ? [
              {
                $match: {
                  "branchDetails.address.state": {
                    $regex: `^${state}$`,
                    $options: "i",
                  },
                },
              },
            ]
          : []),

        ...(country
          ? [
              {
                $match: {
                  "branchDetails.address.country": {
                    $regex: `^${country}$`,
                    $options: "i",
                  },
                },
              },
            ]
          : []),

        ...(zipCode
          ? [
              {
                $match: {
                  "branchDetails.address.zipCode": zipCode,
                },
              },
            ]
          : []),

        // ------------------------------------------------------
        // 6. Lookup Restaurant
        // Branch.restaurant -> Restaurant._id
        // ------------------------------------------------------

        {
          $lookup: {
            from: "restaurants",
            localField: "branchDetails.restaurant",
            foreignField: "_id",
            as: "restaurantDetails",
          },
        },

        // ------------------------------------------------------
        // 7. Convert Restaurant array into object
        // ------------------------------------------------------

        {
          $unwind: {
            path: "$restaurantDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        // ------------------------------------------------------
        // 8. Project final response
        // ------------------------------------------------------

        {
          $project: {
            _id: 1,
            tableNumber: 1,
            capacity: 1,
            location: 1,
            status: 1,
            isActive: 1,

            branch: {
              _id: "$branchDetails._id",
              name: "$branchDetails.name",
              branchCode: "$branchDetails.branchCode",

              contact: "$branchDetails.contact",

              address: "$branchDetails.address",
            },

            restaurant: {
              _id: "$restaurantDetails._id",
              name: "$restaurantDetails.name",
            },
          },
        },

        // ------------------------------------------------------
        // 9. Sort
        // ------------------------------------------------------

        {
          $sort: {
            tableNumber: 1,
          },
        },
      ]);

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Available tables fetched successfully",
        count: tables.length,
        data: tables,
      });
    } catch (error) {
      console.error(
        "Get Available Tables Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message:
          "Failed to fetch available tables",
        error: error.message,
      });
    }
  }

  // ============================================================
  // CHECK TABLE AVAILABILITY
  //
  // GET /api/branches/:branchId/tables/check-availability
  //
  // Optional:
  // ?capacity=4
  // ?location=rooftop
  // ?city=Kolkata
  // ?state=West Bengal
  // ?country=India
  // ?zipCode=700001
  //
  // Flow:
  // Table -> Branch -> Restaurant
  // ============================================================

  async checkTableAvailability(req, res) {
    try {
      const { branchId } = req.params;

      const {
        capacity,
        location,
        city,
        state,
        country,
        zipCode,
      } = req.query;

      // --------------------------------------------------------
      // Validate branch ID
      // --------------------------------------------------------

      if (!mongoose.Types.ObjectId.isValid(branchId)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      // --------------------------------------------------------
      // Validate capacity
      // --------------------------------------------------------

      if (
        capacity !== undefined &&
        Number(capacity) < 1
      ) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Capacity must be at least 1",
        });
      }

      // --------------------------------------------------------
      // Build table match
      // --------------------------------------------------------

      const tableMatch = {
        branch: new mongoose.Types.ObjectId(branchId),
        status: "available",
        isActive: true,
        isDeleted: false,
      };

      // --------------------------------------------------------
      // Capacity filter
      // --------------------------------------------------------

      if (capacity !== undefined) {
        tableMatch.capacity = {
          $gte: Number(capacity),
        };
      }

      // --------------------------------------------------------
      // Table location filter
      // --------------------------------------------------------

      if (location !== undefined) {
        const allowedLocations = [
          "indoor",
          "outdoor",
          "rooftop",
          "private",
          "bar",
        ];

        if (!allowedLocations.includes(location)) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message:
              "Invalid table location. Allowed values: indoor, outdoor, rooftop, private, bar",
          });
        }

        tableMatch.location = location;
      }

      // --------------------------------------------------------
      // Aggregation
      // Table -> Branch -> Restaurant
      // --------------------------------------------------------

      const result = await Table.aggregate([
        // ------------------------------------------------------
        // 1. Match available tables
        // ------------------------------------------------------

        {
          $match: tableMatch,
        },

        // ------------------------------------------------------
        // 2. Lookup Branch
        // ------------------------------------------------------

        {
          $lookup: {
            from: "branches",
            localField: "branch",
            foreignField: "_id",
            as: "branchDetails",
          },
        },

        // ------------------------------------------------------
        // 3. Convert branch array to object
        // ------------------------------------------------------

        {
          $unwind: {
            path: "$branchDetails",
            preserveNullAndEmptyArrays: false,
          },
        },

        // ------------------------------------------------------
        // 4. Make sure branch is active/not deleted
        // ------------------------------------------------------

        {
          $match: {
            "branchDetails.isDeleted": false,
          },
        },

        // ------------------------------------------------------
        // 5. Filter by branch address
        // ------------------------------------------------------

        ...(city
          ? [
              {
                $match: {
                  "branchDetails.address.city": {
                    $regex: `^${city}$`,
                    $options: "i",
                  },
                },
              },
            ]
          : []),

        ...(state
          ? [
              {
                $match: {
                  "branchDetails.address.state": {
                    $regex: `^${state}$`,
                    $options: "i",
                  },
                },
              },
            ]
          : []),

        ...(country
          ? [
              {
                $match: {
                  "branchDetails.address.country": {
                    $regex: `^${country}$`,
                    $options: "i",
                  },
                },
              },
            ]
          : []),

        ...(zipCode
          ? [
              {
                $match: {
                  "branchDetails.address.zipCode": zipCode,
                },
              },
            ]
          : []),

        // ------------------------------------------------------
        // 6. Lookup Restaurant
        // ------------------------------------------------------

        {
          $lookup: {
            from: "restaurants",
            localField: "branchDetails.restaurant",
            foreignField: "_id",
            as: "restaurantDetails",
          },
        },

        // ------------------------------------------------------
        // 7. Convert Restaurant array to object
        // ------------------------------------------------------

        {
          $unwind: {
            path: "$restaurantDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        // ------------------------------------------------------
        // 8. Count matching tables
        // ------------------------------------------------------

        {
          $count: "availableCount",
        },
      ]);

      const availableCount =
        result.length > 0
          ? result[0].availableCount
          : 0;

      const available = availableCount > 0;

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Table availability checked",

        data: {
          available,
          availableCount,
        },
      });
    } catch (error) {
      console.error(
        "Check Table Availability Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message:
          "Failed to check table availability",
        error: error.message,
      });
    }
  }

  // ============================================================
  // ALLOCATE TABLE
  // PATCH /api/tables/:id/allocate
  // ============================================================

  async allocateTable(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid table ID",
        });
      }

      const table = await Table.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!table) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Table not found",
        });
      }

      if (!table.isActive) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Table is inactive",
        });
      }

      if (table.status !== "available") {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message:
            `Table is currently ${table.status}`,
        });
      }

      table.status = "occupied";

      await table.save();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Table allocated successfully",
        data: table,
      });
    } catch (error) {
      console.error("Allocate Table Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to allocate table",
        error: error.message,
      });
    }
  }

  // ============================================================
  // RELEASE TABLE
  // PATCH /api/tables/:id/release
  // ============================================================

  async releaseTable(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid table ID",
        });
      }

      const table = await Table.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!table) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Table not found",
        });
      }

      if (table.status !== "occupied") {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message:
            "Only occupied tables can be released",
        });
      }

      table.status = "available";

      await table.save();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Table released successfully",
        data: table,
      });
    } catch (error) {
      console.error("Release Table Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to release table",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET TABLE UTILIZATION
  // GET /api/branches/:branchId/tables/utilization
  // ============================================================

  async getTableUtilization(req, res) {
    try {
      const { branchId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(branchId)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      // --------------------------------------------------------
      // Check branch
      // --------------------------------------------------------

      const branch = await Branch.findOne({
        _id: branchId,
        isDeleted: false,
      });

      if (!branch) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Branch not found",
        });
      }

      // --------------------------------------------------------
      // Total tables
      // --------------------------------------------------------

      const totalTables =
        await Table.countDocuments({
          branch: branchId,
          isDeleted: false,
        });

      // --------------------------------------------------------
      // Available tables
      // --------------------------------------------------------

      const availableTables =
        await Table.countDocuments({
          branch: branchId,
          isDeleted: false,
          isActive: true,
          status: "available",
        });

      // --------------------------------------------------------
      // Occupied tables
      // --------------------------------------------------------

      const occupiedTables =
        await Table.countDocuments({
          branch: branchId,
          isDeleted: false,
          isActive: true,
          status: "occupied",
        });

      // --------------------------------------------------------
      // Reserved tables
      // --------------------------------------------------------

      const reservedTables =
        await Table.countDocuments({
          branch: branchId,
          isDeleted: false,
          isActive: true,
          status: "reserved",
        });

      // --------------------------------------------------------
      // Maintenance tables
      // --------------------------------------------------------

      const maintenanceTables =
        await Table.countDocuments({
          branch: branchId,
          isDeleted: false,
          isActive: true,
          status: "maintenance",
        });

      // --------------------------------------------------------
      // Active tables
      // --------------------------------------------------------

      const activeTables =
        await Table.countDocuments({
          branch: branchId,
          isDeleted: false,
          isActive: true,
        });

      // --------------------------------------------------------
      // Utilization percentage
      // --------------------------------------------------------

      const utilizationPercentage =
        activeTables > 0
          ? Number(
              (
                (occupiedTables /
                  activeTables) *
                100
              ).toFixed(2)
            )
          : 0;

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message:
          "Table utilization fetched successfully",

        data: {
          totalTables,
          activeTables,
          availableTables,
          occupiedTables,
          reservedTables,
          maintenanceTables,
          utilizationPercentage,
        },
      });
    } catch (error) {
      console.error(
        "Get Table Utilization Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message:
          "Failed to fetch table utilization",
        error: error.message,
      });
    }
  }
}


module.exports = new TableController();