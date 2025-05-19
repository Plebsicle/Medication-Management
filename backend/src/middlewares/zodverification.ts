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
    
    // Collect all validation errors
    const errors: { field: string; message: string }[] = [];
    
    if (!validationResult.success) {
      validationResult.error.errors.forEach(err => {
        errors.push({
          field: err.path.join('.'),
          message: err.message
        });
      });
    }
    
    if (!passwordResult.success) {
      passwordResult.error.errors.forEach(err => {
        errors.push({
          field: 'password',
          message: err.message
        });
      });
    }
    
    if (errors.length > 0) {
      return { success: false, errors };
    }
    
    return { success: true };
  } catch (error) {
    console.log("Error in Zod Verification:", error);
    return { 
      success: false, 
      errors: [{ field: "general", message: "Validation failed due to an unexpected error" }] 
    };
  }
}

export async function verifySigninManualDetails(email: string, password: string) {
  try {
    const validationResultEmail = userSigninSchema.safeParse({ email });
    const passwordResult = passwordSchema.safeParse(password);
    
    const errors: { field: string; message: string }[] = [];
    
    if (!validationResultEmail.success) {
      validationResultEmail.error.errors.forEach(err => {
        errors.push({
          field: err.path.join('.'),
          message: err.message
        });
      });
    }
    
    if (!passwordResult.success) {
      passwordResult.error.errors.forEach(err => {
        errors.push({
          field: 'password',
          message: err.message
        });
      });
    }
    
    if (errors.length > 0) {
      return { success: false, errors };
    }
    
    return { success: true };
  } catch (error) {
    console.log("Error in Zod Verification Signin Manual", error);
    return { 
      success: false, 
      errors: [{ field: "general", message: "Validation failed due to an unexpected error" }] 
    };
  }
}

export async function verifyEmailAlone(email: string) {
  try {
    const validationResultEmail = userSigninSchema.safeParse({ email });
    
    if (!validationResultEmail.success) {
      const errors = validationResultEmail.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return { success: false, errors };
    }
    
    return { success: true };
  } catch (e) {
    console.log("Error in Alone Email", e);
    return { 
      success: false, 
      errors: [{ field: "email", message: "Email validation failed" }] 
    };
  }
}

export async function verifyGoogleDetails(name: string, email: string, role: roles, phone_number: string) {
  try {
    const validationResult = userSchema.safeParse({ name, email, role, phone_number });
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return { success: false, errors };
    }
    
    return { success: true };
  } catch (error) {
    console.log("Error in Google Zod Verification", error);
    return { 
      success: false, 
      errors: [{ field: "general", message: "Validation failed due to an unexpected error" }] 
    };
  }
}

export function validatePhoneNumber(phone_number: string) {
  const result = userSchema.shape.phone_number.safeParse(phone_number);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors.map(err => ({
        field: 'phone_number',
        message: err.message
      }))
    };
  }
  return { success: true };
}