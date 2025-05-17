
import 'express';


declare module 'express' {
  export interface Request {
    userId?: number;
    userEmail?: string;
    userRole ? : 'patient' | 'caregiver' | 'doctor';
    userName ? : string;
  }
}
