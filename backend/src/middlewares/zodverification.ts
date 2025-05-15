import zod from 'zod';

enum roles {
    patient = "patient",
    caregiver = "caregiver",
    doctor = "doctor"
}

const userSchema = zod.object({
  name: zod.string(),
  email: zod.string().min(1, { message: "This field has to be filled." }).email("This is not a valid email"),
  role: zod.nativeEnum(roles),
  phone_number: zod.string().min(10, { message: "Phone number must be at least 10 digits" }).max(15, { message: "Phone number is too long" }).regex(/^\+?[0-9\s\-\(\)]+$/, { message: "Invalid phone number format" }),
});

const userSigninSchema = zod.object({
  email: zod.string().min(1, { message: "This field has to be filled." }).email("This is not a valid email"),
});

const passwordSchema = zod.string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .regex(/[\W_]/, { message: "Password must contain at least one special character" });

export async function verifyUserDetails(name: string, email: string, role: roles, password: string, phone_number: string) {
  try {
    const validationResult = userSchema.safeParse({ name, email, role, phone_number });
    const passwordResult = passwordSchema.safeParse(password);
    if (validationResult.success && passwordResult.success) {
      return true;
    } else {
      console.log("User validation failed:", validationResult.error?.errors, passwordResult.error?.errors);
      return false;
    }
  } catch (error) {
    console.log("Error in Zod Verification:", error);
    return false;
  }
}

export async function verifySigninManualDetails(email: string, password: string) {
  try {
    const validationResultEmail = userSigninSchema.safeParse({ email });
    const passwordResult = passwordSchema.safeParse(password);
    
    if (validationResultEmail.success && passwordResult.success) {
      return true;
    } else {
      console.log("Signin validation failed:", validationResultEmail.error?.errors, passwordResult.error?.errors);
      return false;
    }
  } catch (error) {
    console.log("Error in Zod Verification Signin Manual", error);
    return false;
  }
}

export async function verifyEmailAlone(email : string){
    try{
        const validationResultEmail = userSigninSchema.safeParse({ email });
        if(validationResultEmail.success){
            return true;
        }
        else{
            console.log("Signin validation failed:", validationResultEmail.error?.errors);
      return false;
        }
    }
    catch(e){
        console.log("Error in Alone EMail",e);
    }
}

export async function verifyGoogleDetails(name: string, email: string, role: roles, phone_number: string) {
  try {
    const validationResult = userSchema.safeParse({ name, email, role, phone_number });
    if (validationResult.success) {
      return true;
    } else {
      console.log("Google validation failed:", validationResult.error?.errors);
      return false;
    }
  } catch (error) {
    console.log("Error in Google Zod Verification", error);
    return false;
  }
}

export function validatePhoneNumber(phone_number: string) {
  return userSchema.shape.phone_number.safeParse(phone_number);
}
