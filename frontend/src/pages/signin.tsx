import { GoogleLogin } from "@react-oauth/google"
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { dataCredential } from "./signup";
import { jwtDecode } from "jwt-decode";

export default function Signin(){
    const [email,Setemail] = useState<string>("");
    const [password , Setpassword] = useState<string>("");

    const navigate = useNavigate();

    const LoginHandlerManual = async ()=>{
        try{
            const res = await axios.post('http://localhost:8000/signin', {
                email, password
            });
            if(res){
              localStorage.setItem('token', res.data.token);
              navigate('/dashboard');
            }
            else{
              navigate('/signin');
            }
        }
        catch(error){
            console.log("Error in LoginHandlerManual" , error);
        }
    }

    const GoogleLoginHandler =  async(response : any)=>{
        try{
            if(response && response.credential){
              const userInfo:dataCredential = jwtDecode(response.credential);
              const {name , email } = userInfo;
              const res = await axios.post('http://localhost:8000/signup',{
                name , email
              },{
                headers : {
                  Authorization : `${response.credential}`
                }
              })
              if(res){
                localStorage.setItem('token', res.data.token);
                navigate('/dashboard')
              }
              else{
                navigate('/signin')
              }
            }
        }   
        catch(error){
            console.log("Error is in GoogleLoginHandler" ,error );
        }
    }

    return(
        <div>
            <div>
            <form className="space-y-6">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => Setemail(e.target.value)}
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => Setpassword(e.target.value)}
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center justify-between">
                <a href="/forgetpassword" className="text-sm text-blue-500 hover:underline">Forgot password?</a>
              </div>
              <button
                type="button"
                onClick={LoginHandlerManual}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Sign In
              </button>
            </form>
            </div>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={GoogleLoginHandler}
                onError={() => console.log("Google Login Failed")}
                logo_alignment="center"
                size="medium"
                text="signin_with"
                shape="pill"
                type="standard"
              />
            </div>
        </div>
    )
}