
"use client"
import {  ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import store from "../store/store";
import { Provider } from "react-redux";

type ProviderProps = {
    children : ReactNode
}

export default function Providers({children}:ProviderProps){
    return(
        <>
        <SessionProvider>
            <Provider store = {store}>
                {children}
            </Provider>
        </SessionProvider>
        </>
    )
}