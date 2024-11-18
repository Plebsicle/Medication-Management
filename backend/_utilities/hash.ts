import bcrypt from 'bcrypt'
import { hash } from 'crypto';

const saltRounds = 10;

export async function hashPassword(password : string){
    try{
        const hashedPassword = await bcrypt.hash(password , saltRounds);
        return hashedPassword;
    }
    catch(error){
        console.log("Error in Pasword Ecryption" , error)
    }
}

export async function verifyPassword(storedHash : string , enteredPassword : string){
    try{
        const isMatch = await bcrypt.compare(enteredPassword , storedHash);
        return isMatch;
    }   
    catch(error){
        console.log("Error in Password Verification" , error);
    }
}