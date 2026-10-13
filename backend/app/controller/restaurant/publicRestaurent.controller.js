const Restaurant = require("../../models/resturant.model");
const Branch = require("../../models/branch.model");
const mongoose = require("mongoose");

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPublicRestaurants = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 9, 1),
      24
    );

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const cuisine =
      typeof req.query.cuisine === "string"
        ? req.query.cuisine.trim()
        : "";

    const sort = req.query.sort === "name" ? "name" : "newest";

    const filter = {
      isActive: true,
      isDeleted: { $ne: true },
    };

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), "i");

      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { cuisineTypes: searchRegex },
        { "address.city": searchRegex },
        { "address.state": searchRegex },
      ];
    }

    if (cuisine) {
      filter.cuisineTypes = {
        $regex: escapeRegex(cuisine),
        $options: "i",
      };
    }

    const sortOptions =
      sort === "name"
        ? { name: 1, _id: 1 }
        : { createdAt: -1, _id: -1 };

    const skip = (page - 1) * limit;

    const [restaurants, total, cuisines] = await Promise.all([
      Restaurant.find(filter)
        .select(
          "name description address cuisineTypes logo website images createdAt"
        )
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),

      Restaurant.countDocuments(filter),

      Restaurant.distinct("cuisineTypes", {
        isActive: true,
        isDeleted: { $ne: true },
      }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Restaurants fetched successfully",
      data: restaurants,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        cuisines: cuisines.filter(Boolean).sort((a, b) =>
          a.localeCompare(b)
        ),
      },
    });
  } catch (error) {
    console.error("Get Public Restaurants Error:", error);

    return res.status(500).json({
      status: false,
      message: "Failed to fetch restaurants",
    });
  }
};

const getPublicRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid restaurant ID",
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: id,
      isActive: true,
      isDeleted: { $ne: true },
    })
      .select(
        "name description email phone address cuisineTypes logo website images"
      )
      .lean();

    if (!restaurant) {
      return res.status(404).json({
        status: false,
        message: "Restaurant not found",
      });
    }

    const branches = await Branch.find({
      restaurant: restaurant._id,
      isActive: true,
      isDeleted: false,
    })
      .select("name branchCode contact address openingHours images")
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      status: true,
      message: "Restaurant details fetched successfully",
      data: { ...restaurant, branches },
    });
  } catch (error) {
    console.error("Get Public Restaurant Details Error:", error);

    return res.status(500).json({
      status: false,
      message: "Failed to fetch restaurant details",
    });
  }
};

module.exports = { getPublicRestaurants, getPublicRestaurantById };