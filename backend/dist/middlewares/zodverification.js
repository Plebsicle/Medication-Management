"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUserDetails = verifyUserDetails;
exports.verifySigninManualDetails = verifySigninManualDetails;
exports.verifyEmailAlone = verifyEmailAlone;
exports.verifyGoogleDetails = verifyGoogleDetails;
exports.validatePhoneNumber = validatePhoneNumber;
const zod_1 = __importDefault(require("zod"));
var roles;
(function (roles) {
    roles["patient"] = "patient";
    roles["caregiver"] = "caregiver";
    roles["doctor"] = "doctor";
})(roles || (roles = {}));
const userSchema = zod_1.default.object({
    name: zod_1.default.string(),
    email: zod_1.default.string().min(1, { message: "This field has to be filled." }).email("This is not a valid email"),
    role: zod_1.default.nativeEnum(roles),
    phone_number: zod_1.default.string().min(10, { message: "Phone number must be at least 10 digits" }).max(15, { message: "Phone number is too long" }).regex(/^\+?[0-9\s\-\(\)]+$/, { message: "Invalid phone number format" }),
});
const userSigninSchema = zod_1.default.object({
    email: zod_1.default.string().min(1, { message: "This field has to be filled." }).email("This is not a valid email"),
});
const passwordSchema = zod_1.default.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[\W_]/, { message: "Password must contain at least one special character" });
function verifyUserDetails(name, email, role, password, phone_number) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const validationResult = userSchema.safeParse({ name, email, role, phone_number });
            const passwordResult = passwordSchema.safeParse(password);
            // Collect all validation errors
            const errors = [];
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
        }
        catch (error) {
            console.log("Error in Zod Verification:", error);
            return {
                success: false,
                errors: [{ field: "general", message: "Validation failed due to an unexpected error" }]
            };
        }
    });
}
function verifySigninManualDetails(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const validationResultEmail = userSigninSchema.safeParse({ email });
            const passwordResult = passwordSchema.safeParse(password);
            const errors = [];
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
        }
        catch (error) {
            console.log("Error in Zod Verification Signin Manual", error);
            return {
                success: false,
                errors: [{ field: "general", message: "Validation failed due to an unexpected error" }]
            };
        }
    });
}
function verifyEmailAlone(email) {
    return __awaiter(this, void 0, void 0, function* () {
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
        }
        catch (e) {
            console.log("Error in Alone Email", e);
            return {
                success: false,
                errors: [{ field: "email", message: "Email validation failed" }]
            };
        }
    });
}
function verifyGoogleDetails(name, email, role, phone_number) {
    return __awaiter(this, void 0, void 0, function* () {
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
        }
        catch (error) {
            console.log("Error in Google Zod Verification", error);
            return {
                success: false,
                errors: [{ field: "general", message: "Validation failed due to an unexpected error" }]
            };
        }
    });
}
function validatePhoneNumber(phone_number) {
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
