import zod from 'zod';

enum roles {
    patient,
    caregiver,
    doctor
}

const userSchema = zod.object({
    name: zod.string(),
    email: zod.string().min(1, { message: "This field has to be filled." }).email("This is not a valid email"),
    role: zod.nativeEnum(roles) 
});

const passwordSchema = zod.string().min(8, { message: "Password must be at least 8 characters long" })
.regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
.regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
.regex(/[0-9]/, { message: "Password must contain at least one number" })
.regex(/[\W_]/, { message: "Password must contain at least one special character" });

export  async function verifyUserDetails(name: string, email: string, role: roles , password : string) {
    try {
        const validationResult = userSchema.safeParse({ name, email, role });
        const passwordResult = passwordSchema.safeParse(password);
        if(validationResult && passwordResult) return true
        else return false
    } catch (error) {
        console.log("Error in Zod Verification:", error);
    }
}

export async function verifyGoogleDetails(name : string , email : string , role : roles){
    try {
        const validationResult = userSchema.safeParse({name , email , role});
        return validationResult;
    }
    catch(error){
        console.log("Error in Google Zod Verification" , error);
    }
}

