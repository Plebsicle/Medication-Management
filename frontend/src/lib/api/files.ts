import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const fileApi = {
  getUploadUrl: async (doctorId: number, patientId: number, fileName: string, fileType: string) => {
    const token = localStorage.getItem('jwt');
    
    const response = await axios.post(
      `${API_URL}/files/upload`,
      {
        doctorId,
        patientId,
        fileName,
        fileType
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  },
  
  confirmFileUpload: async (doctorId: number, patientId: number, fileName: string, fileKey: string) => {
    const token = localStorage.getItem('jwt');
    
    const response = await axios.post(
      `${API_URL}/files/confirm`,
      {
        doctorId,
        patientId,
        fileName,
        fileKey
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  },
  
  uploadFile: async (file: File, doctorId: number, patientId: number) => {
    const token = localStorage.getItem('jwt');
    
    try {
      // Step 1: Get a presigned URL
      const urlData = await fileApi.getUploadUrl(doctorId, patientId, file.name, file.type);
      
      // Step 2: Upload the file to the presigned URL
      await fetch(urlData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });
      
      // Step 3: Confirm the upload with the server
      const result = await fileApi.confirmFileUpload(doctorId, patientId, file.name, urlData.fileKey);
      
      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },
  
  getSharedFiles: async (doctorId: number, patientId: number) => {
    const token = localStorage.getItem('jwt');
    
    const response = await axios.get(
      `${API_URL}/files?doctorId=${doctorId}&patientId=${patientId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data.files;
  },
  
  deleteFile: async (fileId: number) => {
    const token = localStorage.getItem('jwt');
    
    const response = await axios.delete(
      `${API_URL}/files/${fileId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  }
}; 