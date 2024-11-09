import { GoogleLogin } from "@react-oauth/google"
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from 'jwt-decode';

export type dataCredential = {
  aud: string,
  azp: string,
  email: string,
  email_verified: boolean,
  exp: number,
  family_name: string,
  given_name: string,
  iss: string,
  jti: string,
  name: string,
  nbf: number,
  picture: string,
  sub: string
}

export default function Signin(){
  const [name , Setname] = useState<string>("");
  const [email,Setemail] = useState<string>("");
  const [password , Setpassword] = useState<string>("");
  const navigate = useNavigate();
  const GoogleLoginHandler = async (response : any) => {
      if(response && response.credential){
        try{
          const userInfo:dataCredential = jwtDecode(response.credential);
          console.log(userInfo);
          const {name , email } = userInfo;
          console.log(name); console.log(email);
          localStorage.setItem('token' , response.credential);
          navigate('/dashboard')
        }
        catch(error){
          console.log("GoogleLoginHandler Error" ,  error);
        }
      }
  }
    const LoginHandlerManual = async () => {
      try{
        const response = await axios.post('http://localhost:8000/signup',{
          name , email , password 
        });
        localStorage.setItem('token' , response.data);
        navigate('/dashboard')
      }
      catch(error){
        console.error("LoginHandlerManual Error:", error);
      }
    }

      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-white">
            <h2 className="text-3xl font-bold text-center mb-8">Sign Up</h2>
            <form className="space-y-6">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => Setname(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => Setemail(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => Setpassword(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center justify-between">
                <a href="#" className="text-sm text-blue-500 hover:underline">Forgot password?</a>
              </div>
              <button
                type="button"
                onClick={LoginHandlerManual}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Sign Up
              </button>
            </form>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gray-800 px-4 text-gray-400">or</span>
              </div>
            </div>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={GoogleLoginHandler}
                onError={() => console.log("Google Login Failed")}
                logo_alignment="center"
                size="medium"
                text="signup_with"
                shape="pill"
                type="standard"
              />
            </div>
          </div>
        </div>
      );
  } 