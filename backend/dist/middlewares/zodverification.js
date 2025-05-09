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
function verifyUserDetails(name, email, role, password) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const validationResult = userSchema.safeParse({ name, email, role });
            const passwordResult = passwordSchema.safeParse(password);
            if (validationResult.success && passwordResult.success) {
                return true;
            }
            else {
                console.log("User validation failed:", (_a = validationResult.error) === null || _a === void 0 ? void 0 : _a.errors, (_b = passwordResult.error) === null || _b === void 0 ? void 0 : _b.errors);
                return false;
            }
        }
        catch (error) {
            console.log("Error in Zod Verification:", error);
            return false;
        }
    });
}
function verifySigninManualDetails(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const validationResultEmail = userSigninSchema.safeParse({ email });
            const passwordResult = passwordSchema.safeParse(password);
            if (validationResultEmail.success && passwordResult.success) {
                return true;
            }
            else {
                console.log("Signin validation failed:", (_a = validationResultEmail.error) === null || _a === void 0 ? void 0 : _a.errors, (_b = passwordResult.error) === null || _b === void 0 ? void 0 : _b.errors);
                return false;
            }
        }
        catch (error) {
            console.log("Error in Zod Verification Signin Manual", error);
            return false;
        }
    });
}
function verifyEmailAlone(email) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const validationResultEmail = userSigninSchema.safeParse({ email });
            if (validationResultEmail.success) {
                return true;
            }
            else {
                console.log("Signin validation failed:", (_a = validationResultEmail.error) === null || _a === void 0 ? void 0 : _a.errors);
                return false;
            }
        }
        catch (e) {
            console.log("Error in Alone EMail", e);
        }
    });
}
function verifyGoogleDetails(name, email, role) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const validationResult = userSchema.safeParse({ name, email, role });
            if (validationResult.success) {
                return true;
            }
            else {
                console.log("Google validation failed:", (_a = validationResult.error) === null || _a === void 0 ? void 0 : _a.errors);
                return false;
            }
        }
        catch (error) {
            console.log("Error in Google Zod Verification", error);
            return false;
        }
    });
}
