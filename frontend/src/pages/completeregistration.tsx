import {useState , useEffect} from 'react'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'

export default function CompleteRegistration(){
    const [password , Setpassword] = useState<string>("");
    const [role , Setrole] = useState<String>("patient");
    const [name , Setname] = useState<string>("");
    const [email , Setemail] =   useState<string>("");

    const navigate = useNavigate();
    useEffect(()=>{
        getExistingData();
    },[])
    const getExistingData = async ()=>{
        const res : any = await axios.get('/completeregistration');
        Setname(res.name);
        Setemail(res.email);
    }
    const sendNewData = async ()=>{
        const res = await axios.post('/checkdata' , {
            name , email , password , role
        });
        if(res){
            navigate('/');
        }
        else{
            navigate('/completeregistration');
        }
    }
    return (
        <div>
            <form>
                <input value={name} readOnly required className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"></input>
                <input value={email} readOnly required className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"></input>
                <input onChange={(e) => Setpassword(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"></input>
                <select>
                <option value="patient" onClick={()=>{Setrole('patient')}}>Patient</option>
                <option value="caregiver" onClick={()=>{Setrole('caregiver')}}>Caregiver</option>
                <option value="doctor" onClick={()=>{Setrole('doctor')}}>Doctor</option>
                </select>
                <button onClick={sendNewData}>Complete Signup</button>
            </form>
        </div>
    )
}   