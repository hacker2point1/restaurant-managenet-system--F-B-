import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../slice/authSlice";
import homepageStatsSlice from "../slice/homePageStatSlice";
import menuCategoryReducer from "../slice/menuCategorySlice";
import restaurantReducer from "../slice/restaurantSlice";



const store = configureStore({
    reducer:{
        auth:authSlice,
        homepageStats: homepageStatsSlice,
        menuCategories: menuCategoryReducer,
        restaurants: restaurantReducer,

      
       
    }
})

export default store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;