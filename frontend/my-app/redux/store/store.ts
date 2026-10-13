import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../slice/authSlice";
import analyticsSlice from "../slice/analytics";
import restaurantSlice from "../slice/restaurentSlice";
import userSlice from "../slice/userSlice";
import tableSlice from "../slice/tableSlice";
import reservationSlice from "../slice/reservationSlice";
import branchReducer from "../slice/branchSlice";
import menuCategorySlice from "../slice/menuCategorySlice";
import menuItemSlice from "../slice/menuItemSlice";
import inventorySlice from "../slice/inventorySlice";
import inventoryTransactionSlice from "../slice/inventoryTransactionSlice";
import couponSlice from "../slice/couponSlice";
import reviewReducer from "@/redux/slice/reviewSlice";
import customerReducer from "@/redux/slice/customerSlice";



const store = configureStore({
    reducer:{
        auth:authSlice,
        analytics: analyticsSlice,
        restaurant: restaurantSlice,
        user: userSlice,
        table: tableSlice,
        reservation: reservationSlice,
        branch: branchReducer,
        menuCategory: menuCategorySlice,
        menuItems: menuItemSlice,
        inventory: inventorySlice,
        inventoryTransaction: inventoryTransactionSlice,
        coupon: couponSlice,
        review: reviewReducer,
        customer: customerReducer,
    }
})

export default store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;