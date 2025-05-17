import { Server } from 'socket.io';
import { configureDoctorPatientSocket } from './doctorPatientSocket';

/**
 * Configure all Socket.IO handlers
 * @param io - Socket.IO server instance
 */
export const configureSocketHandlers = (io: Server): void => {
  // Configure doctor-patient chat
  configureDoctorPatientSocket(io);
  
  // Add more socket configurations here as needed
}; 