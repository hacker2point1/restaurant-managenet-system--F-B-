
import axios from "axios"
import { Cookies } from "react-cookie"



export const baseURL = `http://localhost:3009`

const cookies = new Cookies()

const AxiosInstance = axios.create({
    baseURL
})

AxiosInstance.interceptors.request.use(
    function(config){
        const token = cookies.get("token")
        console.log("token:", token)
        if(token){
            config.headers = config.headers || {}
            config.headers['x-access-token'] = token
        }
        return config
    }, 
    function(error){
        return Promise.reject(error)
    }
)

export default AxiosInstance