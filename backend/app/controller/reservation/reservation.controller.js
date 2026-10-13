const mongoose = require("mongoose");

const Reservation = require("../../models/reservation.model");
const Branch = require("../../models/branch.model");
const Table = require("../../models/table.model");
const Customer = require("../../models/customer.model");
const User = require("../../models/users.model");

class ReservationController {
  // ============================================================
  // CREATE RESERVATION
  // POST /api/branches/:branchId/reservations
  // ============================================================

  async createReservation(req, res) {
    try {
      const { branchId } = req.params;

      const {
        customer,
        table,
        reservationDate,
        startTime,
        endTime,
        guestCount,
        specialRequest,
      } = req.body;
      let reservationCustomerId = customer;

      if (req.user?.role === "customer") {
        const user = await User.findById(req.user.id).select(
          "name email phone"
        );

        if (!user) {
          return res.status(401).json({
            status: false,
            message: "Authenticated customer not found",
          });
        }

        const customerProfile = await Customer.findOneAndUpdate(
          { user: user._id },
          {
            $set: {
              name: user.name,
              email: user.email,
              phone: user.phone,
              isActive: true,
              isDeleted: false,
            },
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
          }
        );

        reservationCustomerId = customerProfile._id;
      }

      // --------------------------------------------------------
      // Validate Branch ID
      // --------------------------------------------------------

      if (!mongoose.Types.ObjectId.isValid(branchId)) {
        return res.status(400).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      // --------------------------------------------------------
      // Validate Customer
      // --------------------------------------------------------

      if (!reservationCustomerId) {
        return res.status(400).json({
          status: false,
          message: "Customer is required",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(reservationCustomerId)) {
        return res.status(400).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      // --------------------------------------------------------
      // Validate Table
      // --------------------------------------------------------

      if (!table) {
        return res.status(400).json({
          status: false,
          message: "Table is required",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(table)) {
        return res.status(400).json({
          status: false,
          message: "Invalid table ID",
        });
      }

      // --------------------------------------------------------
      // Validate Date / Time
      // --------------------------------------------------------

      if (!reservationDate) {
        return res.status(400).json({
          status: false,
          message: "Reservation date is required",
        });
      }

      if (!startTime || !endTime) {
        return res.status(400).json({
          status: false,
          message:
            "Start time and end time are required",
        });
      }

      if (!guestCount || Number(guestCount) < 1) {
        return res.status(400).json({
          status: false,
          message:
            "Guest count must be at least 1",
        });
      }

      // --------------------------------------------------------
      // Convert Date / Time
      // --------------------------------------------------------

      const reservationDateObject =
        new Date(reservationDate);

      const reservationStart =
        new Date(startTime);

      const reservationEnd =
        new Date(endTime);

      if (
        Number.isNaN(
          reservationDateObject.getTime()
        ) ||
        Number.isNaN(
          reservationStart.getTime()
        ) ||
        Number.isNaN(
          reservationEnd.getTime()
        )
      ) {
        return res.status(400).json({
          status: false,
          message:
            "Invalid reservation date or time",
        });
      }

      if (reservationEnd <= reservationStart) {
        return res.status(400).json({
          status: false,
          message:
            "End time must be greater than start time",
        });
      }

      // --------------------------------------------------------
      // Check Branch using Aggregation
      // --------------------------------------------------------

      const branchResult =
        await Branch.aggregate([
          {
            $match: {
              _id: new mongoose.Types.ObjectId(
                branchId
              ),
              isDeleted: false,
              isActive: true,
            },
          },

          {
            $project: {
              _id: 1,
              name: 1,
              branchCode: 1,
            },
          },

          {
            $limit: 1,
          },
        ]);

      if (branchResult.length === 0) {
        return res.status(404).json({
          status: false,
          message:
            "Branch not found or inactive",
        });
      }

      // --------------------------------------------------------
      // Check Customer using Aggregation
      // --------------------------------------------------------

      const customerResult =
        await Customer.aggregate([
          {
            $match: {
              _id: new mongoose.Types.ObjectId(
                reservationCustomerId
              ),
            },
          },

          {
            $limit: 1,
          },
        ]);

      if (customerResult.length === 0) {
        return res.status(404).json({
          status: false,
          message: "Customer not found",
        });
      }

      // --------------------------------------------------------
      // Check Table using Aggregation
      // --------------------------------------------------------

      const tableResult =
        await Table.aggregate([
          {
            $match: {
              _id: new mongoose.Types.ObjectId(
                table
              ),

              branch:
                new mongoose.Types.ObjectId(
                  branchId
                ),

              isActive: true,
              isDeleted: false,
            },
          },

          {
            $project: {
              _id: 1,
              tableNumber: 1,
              capacity: 1,
              location: 1,
              status: 1,
            },
          },

          {
            $limit: 1,
          },
        ]);

      if (tableResult.length === 0) {
        return res.status(404).json({
          status: false,
          message:
            "Table not found or does not belong to this branch",
        });
      }

      const selectedTable = tableResult[0];

      // --------------------------------------------------------
      // Check Table Capacity
      // --------------------------------------------------------

      if (
        selectedTable.capacity <
        Number(guestCount)
      ) {
        return res.status(400).json({
          status: false,
          message:
            "Table capacity is insufficient for guest count",
        });
      }

      // --------------------------------------------------------
      // Check Table Status
      // --------------------------------------------------------

      if (
        selectedTable.status === "maintenance"
      ) {
        return res.status(400).json({
          status: false,
          message:
            "Table is currently under maintenance",
        });
      }

      // --------------------------------------------------------
      // Check Overlapping Reservation
      // --------------------------------------------------------

      const overlappingReservations =
        await Reservation.aggregate([
          {
            $match: {
              branch:
                new mongoose.Types.ObjectId(
                  branchId
                ),

              table:
                new mongoose.Types.ObjectId(
                  table
                ),

              reservationDate:
                reservationDateObject,

              status: {
                $in: [
                  "pending",
                  "confirmed",
                ],
              },
            },
          },

          {
            $match: {
              $expr: {
                $and: [
                  {
                    $lt: [
                      "$startTime",
                      reservationEnd,
                    ],
                  },

                  {
                    $gt: [
                      "$endTime",
                      reservationStart,
                    ],
                  },
                ],
              },
            },
          },

          {
            $limit: 1,
          },
        ]);

      if (overlappingReservations.length > 0) {
        return res.status(409).json({
          status: false,
          message:
            "Table is already reserved for the selected time",
        });
      }

      // --------------------------------------------------------
      // Create Reservation
      // --------------------------------------------------------

      const reservationData = {
        customer: reservationCustomerId,
        branch: branchId,
        table,

        reservationDate:
          reservationDateObject,

        startTime: reservationStart,
        endTime: reservationEnd,

        guestCount: Number(guestCount),

        status: "pending",

        specialRequest:
          specialRequest || "",
      };

      // --------------------------------------------------------
      // Add Created By
      // --------------------------------------------------------

      if (req.user?.id) {
        reservationData.createdBy =
          req.user.id;
      }

      // --------------------------------------------------------
      // Create
      // --------------------------------------------------------

      const reservation =
        await Reservation.create(
          reservationData
        );

      return res.status(201).json({
        status: true,
        message:
          "Reservation created successfully",
        data: reservation,
      });
    } catch (error) {
      console.error(
        "Create Reservation Error:",
        error
      );

      return res.status(500).json({
        status: false,
        message:
          "Failed to create reservation",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET RESERVATIONS
  // GET /api/branches/:branchId/reservations
  // ============================================================

  async getAdminReservations(req, res) {
    try {
      const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.min(
        Math.max(Number.parseInt(req.query.limit, 10) || 20, 1),
        100
      );
      const filter = {};
      const { status, branchId, date } = req.query;

      if (status && status !== "all") {
        filter.status = status;
      }

      if (branchId) {
        if (!mongoose.Types.ObjectId.isValid(branchId)) {
          return res.status(400).json({
            status: false,
            message: "Invalid branch ID",
          });
        }

        filter.branch = new mongoose.Types.ObjectId(branchId);
      }

      if (date) {
        const dateObject = new Date(date);

        if (Number.isNaN(dateObject.getTime())) {
          return res.status(400).json({
            status: false,
            message: "Invalid date",
          });
        }

        filter.reservationDate = dateObject;
      }

      const [reservations, total, statusCounts] = await Promise.all([
        Reservation.find(filter)
          .populate("customer", "name email phone")
          .populate("branch", "name branchCode")
          .populate("table", "tableNumber capacity location")
          .populate("createdBy", "role")
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Reservation.countDocuments(filter),
        Reservation.aggregate([
          { $match: filter },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
      ]);

      const countsByStatus = Object.fromEntries(
        statusCounts.map(({ _id, count }) => [_id, count])
      );

      return res.status(200).json({
        status: true,
        message: "Reservations fetched successfully",
        data: reservations.map((reservation) => ({
          ...reservation,
          bookingSource:
            reservation.createdBy?.role === "customer"
              ? "online"
              : "on-the-spot",
        })),
        stats: {
          total,
          confirmed: countsByStatus.confirmed || 0,
          pending: countsByStatus.pending || 0,
          completed: countsByStatus.completed || 0,
          cancelled:
            (countsByStatus.cancelled || 0) +
            (countsByStatus.rejected || 0),
        },
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get Admin Reservations Error:", error);

      return res.status(500).json({
        status: false,
        message: "Failed to fetch reservations",
      });
    }
  }

  async getReservations(req, res) {
    try {
      const { branchId } = req.params;

      const {
        status,
        date,
        page = 1,
        limit = 10,
      } = req.query;

      if (!mongoose.Types.ObjectId.isValid(branchId)) {
        return res.status(400).json({
          status: false,
          message: "Invalid branch ID",
        });
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
      // Match
      // --------------------------------------------------------

      const matchStage = {
        branch:
          new mongoose.Types.ObjectId(
            branchId
          ),
      };

      if (status) {
        matchStage.status = status;
      }

      if (date) {
        const dateObject = new Date(date);

        if (
          Number.isNaN(dateObject.getTime())
        ) {
          return res.status(400).json({
            status: false,
            message: "Invalid date",
          });
        }

        matchStage.reservationDate =
          dateObject;
      }

      // --------------------------------------------------------
      // Aggregation
      // --------------------------------------------------------

      const result =
        await Reservation.aggregate([
          // Match
          {
            $match: matchStage,
          },

          // Customer
          {
            $lookup: {
              from: "customers",
              localField: "customer",
              foreignField: "_id",
              as: "customer",
            },
          },

          {
            $unwind: {
              path: "$customer",
              preserveNullAndEmptyArrays: true,
            },
          },

          // Branch
          {
            $lookup: {
              from: "branches",
              localField: "branch",
              foreignField: "_id",
              as: "branch",
            },
          },

          {
            $unwind: {
              path: "$branch",
              preserveNullAndEmptyArrays: true,
            },
          },

          // Table
          {
            $lookup: {
              from: "tables",
              localField: "table",
              foreignField: "_id",
              as: "table",
            },
          },

          {
            $unwind: {
              path: "$table",
              preserveNullAndEmptyArrays: true,
            },
          },

          // Reservation creator, used to identify online customer bookings.
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "creator",
            },
          },

          {
            $unwind: {
              path: "$creator",
              preserveNullAndEmptyArrays: true,
            },
          },

          // Sort
          {
            $sort: {
              reservationDate: -1,
              startTime: 1,
            },
          },

          // Pagination
          {
            $facet: {
              data: [
                {
                  $skip: skip,
                },

                {
                  $limit: limitNumber,
                },

                {
                  $project: {
                    _id: 1,

                    reservationDate: 1,
                    startTime: 1,
                    endTime: 1,

                    guestCount: 1,

                    status: 1,

                    specialRequest: 1,

                    cancelledAt: 1,

                    createdBy: 1,

                    bookingSource: {
                      $cond: [
                        { $eq: ["$creator.role", "customer"] },
                        "online",
                        "on-the-spot",
                      ],
                    },

                    createdAt: 1,
                    updatedAt: 1,

                    customer: {
                      _id: "$customer._id",
                      name: "$customer.name",
                      email:
                        "$customer.email",
                      phone:
                        "$customer.phone",
                    },

                    branch: {
                      _id: "$branch._id",
                      name: "$branch.name",
                      branchCode:
                        "$branch.branchCode",
                    },

                    table: {
                      _id: "$table._id",
                      tableNumber:
                        "$table.tableNumber",
                      capacity:
                        "$table.capacity",
                      location:
                        "$table.location",
                    },
                  },
                },
              ],

              total: [
                {
                  $count: "count",
                },
              ],
            },
          },
        ]);

      const reservations =
        result[0]?.data || [];

      const total =
        result[0]?.total?.[0]?.count || 0;

      return res.status(200).json({
        status: true,
        message:
          "Reservations fetched successfully",

        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(
            total / limitNumber
          ),
        },

        data: reservations,
      });
    } catch (error) {
      console.error(
        "Get Reservations Error:",
        error
      );

      return res.status(500).json({
        status: false,
        message:
          "Failed to fetch reservations",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET RESERVATION BY ID
  // GET /api/reservations/:id
  // ============================================================

  async getReservationById(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid reservation ID",
        });
      }

      // --------------------------------------------------------
      // Aggregation
      // --------------------------------------------------------

      const result =
        await Reservation.aggregate([
          {
            $match: {
              _id:
                new mongoose.Types.ObjectId(
                  id
                ),
            },
          },

          // Customer
          {
            $lookup: {
              from: "customers",
              localField: "customer",
              foreignField: "_id",
              as: "customer",
            },
          },

          {
            $unwind: {
              path: "$customer",
              preserveNullAndEmptyArrays: true,
            },
          },

          // Branch
          {
            $lookup: {
              from: "branches",
              localField: "branch",
              foreignField: "_id",
              as: "branch",
            },
          },

          {
            $unwind: {
              path: "$branch",
              preserveNullAndEmptyArrays: true,
            },
          },

          // Table
          {
            $lookup: {
              from: "tables",
              localField: "table",
              foreignField: "_id",
              as: "table",
            },
          },

          {
            $unwind: {
              path: "$table",
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $project: {
              _id: 1,

              reservationDate: 1,
              startTime: 1,
              endTime: 1,

              guestCount: 1,

              status: 1,

              specialRequest: 1,

              cancelledAt: 1,

              createdBy: 1,

              createdAt: 1,
              updatedAt: 1,

              customer: {
                _id: "$customer._id",
                name: "$customer.name",
                email: "$customer.email",
                phone: "$customer.phone",
              },

              branch: {
                _id: "$branch._id",
                name: "$branch.name",
                branchCode:
                  "$branch.branchCode",
              },

              table: {
                _id: "$table._id",
                tableNumber:
                  "$table.tableNumber",
                capacity:
                  "$table.capacity",
                location:
                  "$table.location",
              },
            },
          },

          {
            $limit: 1,
          },
        ]);

      if (result.length === 0) {
        return res.status(404).json({
          status: false,
          message: "Reservation not found",
        });
      }

      return res.status(200).json({
        status: true,
        message:
          "Reservation fetched successfully",
        data: result[0],
      });
    } catch (error) {
      console.error(
        "Get Reservation By ID Error:",
        error
      );

      return res.status(500).json({
        status: false,
        message:
          "Failed to fetch reservation",
        error: error.message,
      });
    }
  }

  // ============================================================
  // UPDATE RESERVATION
  // PATCH /api/reservations/:id
  // ============================================================

  async updateReservation(req, res) {
    try {
      const { id } = req.params;

      const {
        reservationDate,
        startTime,
        endTime,
        guestCount,
        specialRequest,
        table,
      } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid reservation ID",
        });
      }

      // --------------------------------------------------------
      // Find reservation
      // --------------------------------------------------------

      const reservation =
        await Reservation.findById(id);

      if (!reservation) {
        return res.status(404).json({
          status: false,
          message: "Reservation not found",
        });
      }

      // --------------------------------------------------------
      // Check status
      // --------------------------------------------------------

      if (
        [
          "completed",
          "cancelled",
          "no-show",
        ].includes(reservation.status)
      ) {
        return res.status(400).json({
          status: false,
          message:
            "This reservation cannot be updated",
        });
      }

      // --------------------------------------------------------
      // Final values
      // --------------------------------------------------------

      const finalDate =
        reservationDate
          ? new Date(reservationDate)
          : reservation.reservationDate;

      const finalStart =
        startTime
          ? new Date(startTime)
          : reservation.startTime;

      const finalEnd =
        endTime
          ? new Date(endTime)
          : reservation.endTime;

      if (
        Number.isNaN(finalDate.getTime()) ||
        Number.isNaN(finalStart.getTime()) ||
        Number.isNaN(finalEnd.getTime())
      ) {
        return res.status(400).json({
          status: false,
          message:
            "Invalid reservation date or time",
        });
      }

      if (finalEnd <= finalStart) {
        return res.status(400).json({
          status: false,
          message:
            "End time must be greater than start time",
        });
      }

      // --------------------------------------------------------
      // Validate guest count
      // --------------------------------------------------------

      const finalGuestCount =
        guestCount !== undefined
          ? Number(guestCount)
          : reservation.guestCount;

      if (finalGuestCount < 1) {
        return res.status(400).json({
          status: false,
          message:
            "Guest count must be at least 1",
        });
      }

      // --------------------------------------------------------
      // Validate Table if changed
      // --------------------------------------------------------

      const finalTable =
        table || reservation.table;

      if (
        !mongoose.Types.ObjectId.isValid(
          finalTable
        )
      ) {
        return res.status(400).json({
          status: false,
          message: "Invalid table ID",
        });
      }

      const tableResult =
        await Table.aggregate([
          {
            $match: {
              _id:
                new mongoose.Types.ObjectId(
                  finalTable
                ),

              branch: reservation.branch,

              isActive: true,
              isDeleted: false,
            },
          },

          {
            $project: {
              _id: 1,
              capacity: 1,
              status: 1,
            },
          },

          {
            $limit: 1,
          },
        ]);

      if (tableResult.length === 0) {
        return res.status(404).json({
          status: false,
          message:
            "Table not found or inactive",
        });
      }

      if (
        tableResult[0].capacity <
        finalGuestCount
      ) {
        return res.status(400).json({
          status: false,
          message:
            "Table capacity is insufficient for guest count",
        });
      }

      // --------------------------------------------------------
      // Check overlapping reservation
      // --------------------------------------------------------

      const conflict =
        await Reservation.aggregate([
          {
            $match: {
              _id: {
                $ne: reservation._id,
              },

              branch: reservation.branch,

              table:
                new mongoose.Types.ObjectId(
                  finalTable
                ),

              reservationDate: finalDate,

              status: {
                $in: [
                  "pending",
                  "confirmed",
                ],
              },
            },
          },

          {
            $match: {
              $expr: {
                $and: [
                  {
                    $lt: [
                      "$startTime",
                      finalEnd,
                    ],
                  },

                  {
                    $gt: [
                      "$endTime",
                      finalStart,
                    ],
                  },
                ],
              },
            },
          },

          {
            $limit: 1,
          },
        ]);

      if (conflict.length > 0) {
        return res.status(409).json({
          status: false,
          message:
            "Table is already reserved for the selected time",
        });
      }

      // --------------------------------------------------------
      // Update
      // --------------------------------------------------------

      reservation.reservationDate =
        finalDate;

      reservation.startTime =
        finalStart;

      reservation.endTime =
        finalEnd;

      reservation.guestCount =
        finalGuestCount;

      reservation.table =
        finalTable;

      if (specialRequest !== undefined) {
        reservation.specialRequest =
          specialRequest;
      }

      await reservation.save();

      return res.status(200).json({
        status: true,
        message:
          "Reservation updated successfully",
        data: reservation,
      });
    } catch (error) {
      console.error(
        "Update Reservation Error:",
        error
      );

      return res.status(500).json({
        status: false,
        message:
          "Failed to update reservation",
        error: error.message,
      });
    }
  }

  // ============================================================
  // CANCEL RESERVATION
  // PATCH /api/reservations/:id/cancel
  // ============================================================

  async cancelReservation(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid reservation ID",
        });
      }

      const reservation =
        await Reservation.findById(id);

      if (!reservation) {
        return res.status(404).json({
          status: false,
          message: "Reservation not found",
        });
      }

      if (req.user?.role === "customer") {
        const customer = await Customer.findOne({
          user: req.user.id,
          isDeleted: false,
        }).select("_id");

        if (!customer || reservation.customer.toString() !== customer._id.toString()) {
          return res.status(403).json({
            status: false,
            message: "You can only cancel your own reservations",
          });
        }
      }

      if (
        [
          "completed",
          "cancelled",
          "no-show",
        ].includes(reservation.status)
      ) {
        return res.status(400).json({
          status: false,
          message:
            "Reservation cannot be cancelled",
        });
      }

      reservation.status = "cancelled";
      reservation.cancelledAt =
        new Date();

      await reservation.save();

      return res.status(200).json({
        status: true,
        message:
          "Reservation cancelled successfully",
        data: reservation,
      });
    } catch (error) {
      console.error(
        "Cancel Reservation Error:",
        error
      );

      return res.status(500).json({
        status: false,
        message:
          "Failed to cancel reservation",
        error: error.message,
      });
    }
  }

  // ============================================================
  // CONFIRM RESERVATION
  // PATCH /api/reservations/:id/confirm
  // ============================================================

  async rejectReservation(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid reservation ID",
        });
      }

      const reservation = await Reservation.findOne({
        _id: id,
        status: "pending",
      });

      if (!reservation) {
        return res.status(404).json({
          status: false,
          message: "Pending reservation not found",
        });
      }

      reservation.status = "rejected";
      reservation.rejectedAt = new Date();
      await reservation.save();

      return res.status(200).json({
        status: true,
        message: "Reservation rejected",
        data: reservation,
      });
    } catch (error) {
      console.error("Reject Reservation Error:", error);

      return res.status(500).json({
        status: false,
        message: "Failed to reject reservation",
      });
    }
  }

  async confirmReservation(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid reservation ID",
        });
      }

      const reservation =
        await Reservation.findOne({
          _id: id,
          status: "pending",
        });

      if (!reservation) {
        return res.status(404).json({
          status: false,
          message:
            "Pending reservation not found",
        });
      }

      reservation.status = "confirmed";

      await reservation.save();

      return res.status(200).json({
        status: true,
        message:
          "Reservation confirmed successfully",
        data: reservation,
      });
    } catch (error) {
      console.error(
        "Confirm Reservation Error:",
        error
      );

      return res.status(500).json({
        status: false,
        message:
          "Failed to confirm reservation",
        error: error.message,
      });
    }
  }

  // ============================================================
  // COMPLETE RESERVATION
  // PATCH /api/reservations/:id/complete
  // ============================================================

  async completeReservation(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid reservation ID",
        });
      }

      const reservation =
        await Reservation.findOne({
          _id: id,
          status: "confirmed",
        });

      if (!reservation) {
        return res.status(404).json({
          status: false,
          message:
            "Confirmed reservation not found",
        });
      }

      reservation.status = "completed";

      await reservation.save();

      // --------------------------------------------------------
      // Release Table
      // --------------------------------------------------------

      await Table.findOneAndUpdate(
        {
          _id: reservation.table,

          status: {
            $in: [
              "occupied",
              "reserved",
            ],
          },
        },
        {
          $set: {
            status: "available",
          },
        }
      );

      return res.status(200).json({
        status: true,
        message:
          "Reservation completed successfully",
        data: reservation,
      });
    } catch (error) {
      console.error(
        "Complete Reservation Error:",
        error
      );

      return res.status(500).json({
        status: false,
        message:
          "Failed to complete reservation",
        error: error.message,
      });
    }
  }

  // ============================================================
  // MARK NO SHOW
  // PATCH /api/reservations/:id/no-show
  // ============================================================

  async markNoShow(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid reservation ID",
        });
      }

      const reservation =
        await Reservation.findOne({
          _id: id,
          status: "confirmed",
        });

      if (!reservation) {
        return res.status(404).json({
          status: false,
          message:
            "Confirmed reservation not found",
        });
      }

      reservation.status = "no-show";

      await reservation.save();

      // --------------------------------------------------------
      // Release Table
      // --------------------------------------------------------

      await Table.findOneAndUpdate(
        {
          _id: reservation.table,

          status: {
            $in: [
              "occupied",
              "reserved",
            ],
          },
        },
        {
          $set: {
            status: "available",
          },
        }
      );

      return res.status(200).json({
        status: true,
        message:
          "Reservation marked as no-show",
        data: reservation,
      });
    } catch (error) {
      console.error(
        "Mark No Show Error:",
        error
      );

      return res.status(500).json({
        status: false,
        message:
          "Failed to mark reservation as no-show",
        error: error.message,
      });
    }
  }

  // ============================================================
  // ASSIGN TABLE
  // PATCH /api/reservations/:id/assign-table
  // ============================================================

  async assignTable(req, res) {
    try {
      const { id } = req.params;
      const { tableId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid reservation ID",
        });
      }

      if (!tableId) {
        return res.status(400).json({
          status: false,
          message: "Table ID is required",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(tableId)) {
        return res.status(400).json({
          status: false,
          message: "Invalid table ID",
        });
      }

      // --------------------------------------------------------
      // Get Reservation
      // --------------------------------------------------------

      const reservation =
        await Reservation.findById(id);

      if (!reservation) {
        return res.status(404).json({
          status: false,
          message: "Reservation not found",
        });
      }

      if (
        [
          "completed",
          "cancelled",
          "no-show",
        ].includes(reservation.status)
      ) {
        return res.status(400).json({
          status: false,
          message:
            "Table cannot be assigned to this reservation",
        });
      }

      // --------------------------------------------------------
      // Get Table
      // --------------------------------------------------------

      const tableResult =
        await Table.aggregate([
          {
            $match: {
              _id:
                new mongoose.Types.ObjectId(
                  tableId
                ),

              branch: reservation.branch,

              isActive: true,
              isDeleted: false,
            },
          },

          {
            $project: {
              _id: 1,
              tableNumber: 1,
              capacity: 1,
              status: 1,
            },
          },

          {
            $limit: 1,
          },
        ]);

      if (tableResult.length === 0) {
        return res.status(404).json({
          status: false,
          message:
            "Table not found or does not belong to this branch",
        });
      }

      const selectedTable =
        tableResult[0];

      // --------------------------------------------------------
      // Capacity
      // --------------------------------------------------------

      if (
        selectedTable.capacity <
        reservation.guestCount
      ) {
        return res.status(400).json({
          status: false,
          message:
            "Table capacity is insufficient for this reservation",
        });
      }

      // --------------------------------------------------------
      // Check overlapping reservation
      // --------------------------------------------------------

      const conflict =
        await Reservation.aggregate([
          {
            $match: {
              _id: {
                $ne: reservation._id,
              },

              branch: reservation.branch,

              table:
                new mongoose.Types.ObjectId(
                  tableId
                ),

              reservationDate:
                reservation.reservationDate,

              status: {
                $in: [
                  "pending",
                  "confirmed",
                ],
              },
            },
          },

          {
            $match: {
              $expr: {
                $and: [
                  {
                    $lt: [
                      "$startTime",
                      reservation.endTime,
                    ],
                  },

                  {
                    $gt: [
                      "$endTime",
                      reservation.startTime,
                    ],
                  },
                  ],
              },
            },
          },

          {
            $limit: 1,
          },
        ]);

      if (conflict.length > 0) {
        return res.status(409).json({
          status: false,
          message:
            "Table is already reserved during this time",
        });
      }

      // --------------------------------------------------------
      // Assign Table
      // --------------------------------------------------------

      reservation.table = tableId;

      await reservation.save();

      return res.status(200).json({
        status: true,
        message:
          "Table assigned successfully",
        data: reservation,
      });
    } catch (error) {
      console.error(
        "Assign Table Error:",
        error
      );

      return res.status(500).json({
        status: false,
        message:
          "Failed to assign table",
        error: error.message,
      });
    }
  }

  // ============================================================
  // CHECK RESERVATION AVAILABILITY
  // GET /api/branches/:branchId/reservations/check-availability
  // ============================================================

  async checkReservationAvailability(
    req,
    res
  ) {
    try {
      const { branchId } = req.params;

      const {
        reservationDate,
        startTime,
        endTime,
        guestCount,
      } = req.query;

      // --------------------------------------------------------
      // Validate
      // --------------------------------------------------------

      if (!mongoose.Types.ObjectId.isValid(branchId)) {
        return res.status(400).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      const branch = await Branch.findOne({
        _id: branchId,
        isActive: true,
        isDeleted: false,
      }).select("_id");

      if (!branch) {
        return res.status(404).json({
          status: false,
          message: "Branch not found or inactive",
        });
      }

      if (
        !reservationDate ||
        !startTime ||
        !endTime ||
        !guestCount
      ) {
        return res.status(400).json({
          status: false,
          message:
            "reservationDate, startTime, endTime and guestCount are required",
        });
      }

      const numberOfGuests =
        Number(guestCount);

      if (numberOfGuests < 1) {
        return res.status(400).json({
          status: false,
          message:
            "Guest count must be at least 1",
        });
      }

      const requestedDate =
        new Date(reservationDate);

      const requestedStart =
        new Date(startTime);

      const requestedEnd =
        new Date(endTime);

      if (
        Number.isNaN(
          requestedDate.getTime()
        ) ||
        Number.isNaN(
          requestedStart.getTime()
        ) ||
        Number.isNaN(
          requestedEnd.getTime()
        )
      ) {
        return res.status(400).json({
          status: false,
          message:
            "Invalid reservation date or time",
        });
      }

      if (requestedEnd <= requestedStart) {
        return res.status(400).json({
          status: false,
          message:
            "End time must be greater than start time",
        });
      }

      // --------------------------------------------------------
      // Find Reserved Tables
      // --------------------------------------------------------

      const bookedTables =
        await Reservation.aggregate([
          {
            $match: {
              branch:
                new mongoose.Types.ObjectId(
                  branchId
                ),

              reservationDate:
                requestedDate,

              status: {
                $in: [
                  "pending",
                  "confirmed",
                ],
              },
            },
          },

          {
            $match: {
              $expr: {
                $and: [
                  {
                    $lt: [
                      "$startTime",
                      requestedEnd,
                    ],
                  },

                  {
                    $gt: [
                      "$endTime",
                      requestedStart,
                    ],
                  },
                ],
              },
            },
          },

          {
            $group: {
              _id: "$table",
            },
          },
        ]);

      const bookedTableIds =
        bookedTables
          .filter((item) => item._id)
          .map((item) => item._id);

      // --------------------------------------------------------
      // Find Available Tables
      // --------------------------------------------------------

      const availableTables =
        await Table.aggregate([
          {
            $match: {
              branch:
                new mongoose.Types.ObjectId(
                  branchId
                ),

              isActive: true,
              isDeleted: false,

              capacity: numberOfGuests,

              _id: {
                $nin: bookedTableIds,
              },

              status: {
                $in: [
                  "available",
                  "reserved",
                ],
              },
            },
          },

          {
            $lookup: {
              from: "branches",
              localField: "branch",
              foreignField: "_id",
              as: "branch",
            },
          },

          {
            $unwind: {
              path: "$branch",
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $project: {
              _id: 1,
              tableNumber: 1,
              capacity: 1,
              location: 1,
              status: 1,

              branch: {
                _id: "$branch._id",
                name: "$branch.name",
                branchCode:
                  "$branch.branchCode",
              },
            },
          },

          {
            $sort: {
              capacity: 1,
            },
          },
        ]);

      return res.status(200).json({
        status: true,
        message:
          "Reservation availability checked",

        data: {
          available:
            availableTables.length > 0,

          availableCount:
            availableTables.length,

          tables: availableTables,
        },
      });
    } catch (error) {
      console.error(
        "Check Reservation Availability Error:",
        error
      );

      return res.status(500).json({
        status: false,
        message:
          "Failed to check reservation availability",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET RESERVATION HISTORY
  // GET /api/customers/:customerId/reservations/history
  // ============================================================

  async getReservationHistory(
    req,
    res
  ) {
    try {
      let { customerId } = req.params;

      if (req.user?.role === "customer") {
        const customer = await Customer.findOne({
          user: req.user.id,
          isDeleted: false,
        }).select("_id");

        if (!customer) {
          return res.status(200).json({
            status: true,
            message: "Reservation history fetched successfully",
            pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
            data: [],
          });
        }

        customerId = customer._id.toString();
      }

      const {
        page = 1,
        limit = 10,
      } = req.query;

      if (
        !mongoose.Types.ObjectId.isValid(
          customerId
        )
      ) {
        return res.status(400).json({
          status: false,
          message: "Invalid customer ID",
        });
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
        (pageNumber - 1) *
        limitNumber;

      // --------------------------------------------------------
      // Aggregation
      // --------------------------------------------------------

      const result =
        await Reservation.aggregate([
          {
            $match: {
              customer:
                new mongoose.Types.ObjectId(
                  customerId
                ),
            },
          },

          // Branch
          {
            $lookup: {
              from: "branches",
              localField: "branch",
              foreignField: "_id",
              as: "branch",
            },
          },

          {
            $unwind: {
              path: "$branch",
              preserveNullAndEmptyArrays: true,
            },
          },

          // Table
          {
            $lookup: {
              from: "tables",
              localField: "table",
              foreignField: "_id",
              as: "table",
            },
          },

          {
            $unwind: {
              path: "$table",
              preserveNullAndEmptyArrays: true,
            },
          },

          // Sort
          {
            $sort: {
              reservationDate: -1,
              startTime: -1,
            },
          },

          // Pagination
          {
            $facet: {
              data: [
                {
                  $skip: skip,
                },

                {
                  $limit: limitNumber,
                },

                {
                  $project: {
                    _id: 1,

                    reservationDate: 1,
                    startTime: 1,
                    endTime: 1,

                    guestCount: 1,

                    status: 1,

                    specialRequest: 1,

                    cancelledAt: 1,

                    createdBy: 1,

                    createdAt: 1,
                    updatedAt: 1,

                    branch: {
                      _id: "$branch._id",
                      name: "$branch.name",
                      branchCode:
                        "$branch.branchCode",
                    },

                    table: {
                      _id: "$table._id",
                      tableNumber:
                        "$table.tableNumber",
                      capacity:
                        "$table.capacity",
                      location:
                        "$table.location",
                    },
                  },
                },
              ],

              total: [
                {
                  $count: "count",
                },
              ],
            },
          },
        ]);

      const reservations =
        result[0]?.data || [];

      const total =
        result[0]?.total?.[0]?.count || 0;

      return res.status(200).json({
        status: true,
        message:
          "Reservation history fetched successfully",

        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(
            total / limitNumber
          ),
        },

        data: reservations,
      });
    } catch (error) {
      console.error(
        "Get Reservation History Error:",
        error
      );

      return res.status(500).json({
        status: false,
        message:
          "Failed to fetch reservation history",
        error: error.message,
      });
    }
  }
}

module.exports = new ReservationController();