const Restaurant = require("../../models/resturant.model");
const Review = require("../../models/review.model");
const Reservation = require("../../models/reservation.model");
const Order = require("../../models/order.Model");

const getHomepageStats = async (req, res) => {
  try {
    const [
      restaurantCount,
      reviewResults,
      reservationResults,
      paymentResults,
    ] = await Promise.all([
      // Active restaurants that have not been deleted.
      Restaurant.countDocuments({
        isActive: true,
        isDeleted: { $ne: true },
      }),

      // Average rating from approved, non-deleted reviews.
      Review.aggregate([
        {
          $match: {
            status: "approved",
            isDeleted: { $ne: true },
          },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]),

      // Number of guests across completed reservations.
      Reservation.aggregate([
        {
          $match: {
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            happyDiners: { $sum: "$guestCount" },
          },
        },
      ]),

      // Payment success rate based on final paid/failed order statuses.
      Order.aggregate([
        {
          $match: {
            paymentStatus: {
              $in: ["paid", "failed"],
            },
          },
        },
        {
          $group: {
            _id: null,

            paidOrders: {
              $sum: {
                $cond: [
                  { $eq: ["$paymentStatus", "paid"] },
                  1,
                  0,
                ],
              },
            },

            failedOrders: {
              $sum: {
                $cond: [
                  { $eq: ["$paymentStatus", "failed"] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const reviewStats = reviewResults[0] || {};
    const reservationStats = reservationResults[0] || {};
    const paymentStats = paymentResults[0] || {};

    const averageRating =
      reviewStats.averageRating == null
        ? null
        : Number(reviewStats.averageRating.toFixed(1));

    const totalReviews = reviewStats.totalReviews || 0;

    const happyDiners = reservationStats.happyDiners || 0;

    const paidOrders = paymentStats.paidOrders || 0;
    const failedOrders = paymentStats.failedOrders || 0;
    const totalPaymentOrders = paidOrders + failedOrders;

    const paymentSuccessRate =
      totalPaymentOrders > 0
        ? Number(
            ((paidOrders / totalPaymentOrders) * 100).toFixed(1)
          )
        : null;

    return res.status(200).json({
      success: true,
      data: {
        averageRating,
        totalReviews,
        restaurantCount,
        happyDiners,
        paymentSuccessRate,
      },
    });
  } catch (error) {
    console.error("Homepage statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load homepage statistics.",
    });
  }
};

module.exports = {
  getHomepageStats,
};