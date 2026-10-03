import { NextRequest, NextResponse } from "next/server";

export function middleware (request:NextRequest){
    const token = request.cookies.get("token")

    if(!token){
        const url = new URL("/auth/signIn", request.url)

        url.searchParams.set("message","login_required")

        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config={
    matcher:[]        //which url will be protected it will be here mentioned inside the [" ", " "] 
}