require("dotenv").config();

const express = require("express");
const ConnectDB = require("./app/config/db");

const cookieParser = require("cookie-parser");
const session = require("express-session");
const connectFlash = require("connect-flash");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");

const { connectRedis, redisClient } = require("./app/config/redis");

// Config
const corsOptions = require("./app/config/cors");

// Admin creation
const createAdmin = require("./app/seed/adminSeeder");
const { default: chalk } = require("chalk");

const app = express();

// ==============================
// Middleware
// ==============================

app.use(cors(corsOptions));

app.use(helmet());
app.use(morgan("dev"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(cookieParser());
app.use(connectFlash());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ==============================
// Routes
// ==============================

const authRoute = require("./app/routes/auth/auth.routes");
app.use("/api/v1/auth", authRoute);

const userRoute = require("./app/routes/user/user.route");
app.use("/api/v1/user", userRoute);

const restaurentRoute = require('./app/routes/restaurent/reastaurent.route')
app.use("/api/v1/restaurent", restaurentRoute)

const branchRoute = require('./app/routes/branch/branch.route')
app.use("/api/v1/branch", branchRoute)

const menuCategoryRoute = require('./app/routes/menuCategory/menu.categories.route')
app.use("/api/v1/menuCategory", menuCategoryRoute)

const reservationRoute = require('./app/routes/reservation/reservation.route')
app.use("/api/v1/branch", reservationRoute)

const menuItemsRoute = require('./app/routes/menueItems/menuItems.route')
app.use("/api/v1/menuItems", menuItemsRoute)

const inventoryItems = require('./app/routes/inventoryItem/inventoryItem.route')
app.use("/api/v1/inventoryItem", inventoryItems)

const customers = require('./app/routes/customer/coustomer.route')
app.use("/api/v1/customer", customers)

const orders = require('./app/routes/order/order.route')
app.use("/api/v1/order", orders)

const tables = require('./app/routes/table/table.route')
app.use("/api/v1/table", tables)

const coupons = require('./app/routes/coupon/coupon.route')
app.use("/api/v1/coupon", coupons)

const reviews = require('./app/routes/review/review.router')
app.use("/api/v1/review", reviews)

const loyality = require('./app/routes/review/review.router')
app.use("/api/v1/loyalities", loyality)

// ==============================
// Server
// ==============================

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await connectRedis()
    await ConnectDB();
    await createAdmin();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(
      chalk.red.bold("Server failed to start:", error)
    );

    process.exit(1);
  }
};

startServer();