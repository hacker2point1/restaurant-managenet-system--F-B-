
"use client"
import {  ReactNode } from "react";
import store from "../store/store";
import { Provider } from "react-redux";

type ProviderProps = {
    children : ReactNode
}

export default function Providers({children}:ProviderProps){
    return(
        <Provider store = {store}>
            {children}
        </Provider>
    )
}