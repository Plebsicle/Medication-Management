import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/file/FileUploader";
import { FileIcon, FileTextIcon, ImageIcon, Trash2Icon, EyeIcon, PlusCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// import { AnimatedButton } from "@/components/animated";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, fadeUp } from "@/components/animated/animations";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

interface Document {
  id: string;
  name: string;
  type: string;
  filename: string;
  url: string;
  uploadDate: string;
}

export default function HealthRecords() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState("medical_report");
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const checkAuth = async () => {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) {
        toast.error("Authentication Required", {
          description: "Please sign in to continue",
        });
        navigate('/signin');
        return;
      }
      fetchDocuments();
    };
    checkAuth();
  }, [navigate]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("jwt");
      if (!token) {
        toast.error("Please sign in to view your health records");
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/medicalDocuments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to fetch health records");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      setSelectedFile(file);
      // Auto-fill document name from file name (without extension)
      const nameWithoutExt = file.name.split('.').slice(0, -1).join('.');
      setDocumentName(nameWithoutExt || file.name);
    } else {
      setSelectedFile(null);
    }
  };

  const getFileExtension = (filename: string): string => {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!documentName.trim()) {
      toast.error("Please provide a document name");
      return;
    }

    try {
      setIsUploading(true);
      const token = localStorage.getItem("jwt");
      if (!token) {
        toast.error("Please sign in to upload documents");
        return;
      }

      // Get the file extension
      const fileExtension = getFileExtension(selectedFile.name);
      
      // Step 1: Get a presigned URL from the backend with the document name and type
      const presignedUrlResponse = await axios.post(
        `${BACKEND_URL}/medicalDocuments/getUploadUrl`,
        {
          name: documentName,
          type: documentType,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
          fileExtension: fileExtension
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!presignedUrlResponse.data.uploadUrl) {
        toast.error("Failed to get upload URL");
        return;
      }

      // Step 2: Upload the file directly to S3 using the presigned URL
      const uploadUrl = presignedUrlResponse.data.uploadUrl;
      const documentId = presignedUrlResponse.data.documentId;
      
      const uploadedResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        }
      });

      if (!uploadedResponse.ok) {
        toast.error("Failed to upload document to storage");
        return;
      }

      // Step 3: Confirm the upload completion to the backend
      await axios.post(
        `${BACKEND_URL}/medicalDocuments/${documentId}/confirmUpload`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Document uploaded successfully");
      setSelectedFile(null);
      setDocumentName("");
      fetchDocuments();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = (document: Document) => {
    setDocumentToDelete(document);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;
    
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        toast.error("Please sign in to delete documents");
        return;
      }

      // Send the document ID and filename to the backend for deletion
      const response = await axios.delete(`${BACKEND_URL}/medicalDocuments/${documentToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          filename: documentToDelete.filename
        }
      });

      if (response.data.success) {
        toast.success("Document deleted successfully");
        fetchDocuments();
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    } finally {
      setShowDeleteDialog(false);
      setDocumentToDelete(null);
    }
  };

  const handlePreview = async (document: Document) => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        toast.error("Please sign in to view documents");
        return;
      }

      // If we already have the URL, just use it
      if (document.url) {
        window.open(document.url, '_blank');
        return;
      }

      // Otherwise, get a new signed URL
      const response = await axios.get(`${BACKEND_URL}/medicalDocuments/${document.id}/view`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.url) {
        window.open(response.data.url, '_blank');
      }
    } catch (error) {
      console.error("Error viewing document:", error);
      toast.error("Failed to view document");
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) {
      return <FileTextIcon className="h-8 w-8 text-red-500" />;
    } else if (type.includes('image')) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    } else {
      return <FileIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const documentTypes = [
    { value: "medical_report", label: "Medical Report" },
    { value: "prescription", label: "Prescription" },
    { value: "lab_result", label: "Lab Result" },
    { value: "imaging", label: "Imaging (X-ray, MRI, etc.)" },
    { value: "vaccination", label: "Vaccination Record" },
    { value: "insurance", label: "Insurance Document" },
    { value: "other", label: "Other" },
  ];

  return (
    <AppLayout>
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-12">
        {/* Hero Section */}
        <section className={`relative pt-8 pb-10 px-4 md:px-6 lg:px-8 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 space-y-4">
                <div className="inline-block bg-blue-100 text-blue-700 rounded-full px-4 py-1 text-sm font-medium mb-2">
                  Your Medical History
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  Manage your <span className="text-blue-600">Health Records</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-xl">
                  Securely store, organize, and access your medical documents whenever you need them.
                </p>
              </div>
              <div className="lg:w-1/2 mt-6 lg:mt-0 flex justify-center">
                <div className="relative w-full max-w-md aspect-square bg-blue-100/50 rounded-full flex items-center justify-center shadow-xl">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 opacity-50" />
                  <div className="relative h-32 w-32 bg-blue-500 rounded-full flex items-center justify-center">
                    <FileTextIcon className="h-16 w-16 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className={`container mx-auto px-4 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Tabs defaultValue="documents" className="mb-12">
            <TabsList className="bg-white shadow-sm rounded-xl p-1 mb-6">
              <TabsTrigger value="documents" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 transition-colors">
                My Documents
              </TabsTrigger>
              <TabsTrigger value="upload" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 transition-colors">
                Upload Document
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="mt-0">
              <div className="flex items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">My Health Documents</h2>
                <div className="ml-4 h-1 bg-blue-100 flex-grow rounded-full"></div>
              </div>

              <Card className="border-0 shadow-lg bg-white mb-8">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-blue-600">Your Medical Records</CardTitle>
                  <CardDescription>View and manage your medical records and documents</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center my-8">
                      <motion.div 
                        className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="flex justify-center my-6">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileTextIcon className="h-10 w-10 text-blue-500" />
                        </div>
                      </div>
                      <p className="text-lg text-gray-600 mb-2">You haven't uploaded any health documents yet.</p>
                      <p className="text-sm text-gray-500 mb-6">Upload your first document to keep track of your medical records.</p>
                      <Button 
                        onClick={() => (document.querySelector('[data-state="inactive"][value="upload"]') as HTMLElement)?.click()}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 mx-auto"
                      >
                        <PlusCircle className="h-4 w-4" />
                        Upload Your First Document
                      </Button>
                    </div>
                  ) : (
                    <motion.div 
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      <AnimatePresence>
                        {documents.map((doc) => (
                          <motion.div key={doc.id} variants={fadeUp}>
                            <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
                              <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3 mb-3">
                                  {getFileIcon(doc.type)}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate text-blue-600">{doc.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(doc.uploadDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex justify-end space-x-2 mt-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePreview(doc)}
                                    className="flex items-center rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50"
                                  >
                                    <EyeIcon className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteClick(doc)}
                                    className="flex items-center rounded-lg"
                                  >
                                    <Trash2Icon className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upload" className="mt-0">
              <div className="flex items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Upload Health Document</h2>
                <div className="ml-4 h-1 bg-blue-100 flex-grow rounded-full"></div>
              </div>
              
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-blue-600">Upload Health Document</CardTitle>
                  <CardDescription>
                    Upload medical reports, prescriptions, lab results, and other health documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Label htmlFor="document-name">Document Name</Label>
                    <Input
                      id="document-name"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      placeholder="Enter a name for this document"
                      className="border-blue-200 focus:border-blue-500 focus-visible:ring-blue-500"
                    />
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Label htmlFor="document-type">Document Type</Label>
                    <select
                      id="document-type"
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-blue-200 bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {documentTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Label>Upload File</Label>
                    <div className="border rounded-md p-6 border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors">
                      <FileUploader
                        onFileSelect={handleFileChange}
                        acceptedFileTypes=".pdf,.jpg,.jpeg,.png"
                        maxFileSizeMB={5}
                      />
                      {selectedFile && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-4 text-sm text-gray-600 bg-white p-3 rounded-md shadow-sm border border-blue-100"
                        >
                          <div className="flex items-center">
                            {getFileIcon(selectedFile.type)}
                            <div className="ml-3">
                              <p className="font-medium">{selectedFile.name}</p>
                              <p className="text-xs text-gray-500">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Accepted formats: PDF, JPG, JPEG, PNG. Maximum file size: 5MB.
                    </p>
                  </motion.div>

                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || !documentName || isUploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl"
                  >
                    {isUploading ? (
                      <>
                        <motion.div 
                          className="mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Upload Document
                      </>
                    )}
                  </Button>
                </CardContent>
                <CardFooter className="border-t bg-gray-50 py-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Lock className="h-4 w-4 text-blue-600" />
                    </div>
                    Your files are encrypted and stored securely
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="border-red-100 bg-white">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-600">Delete Document</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{documentToDelete?.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-4">
                <AlertDialogCancel className="border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete} 
                  className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </motion.div>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </AppLayout>
  );
}

// Add missing Lock icon component
const Lock = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
};