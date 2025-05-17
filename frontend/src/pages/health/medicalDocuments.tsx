import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/components/file/FileUploader";
import { FileIcon, FileTextIcon, ImageIcon, Trash2Icon, EyeIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

interface Document {
  id: string;
  name: string;
  type: string;
  filename: string;
  url: string;
  uploadDate: string;
}

export default function HealthRecords() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState("medical_report");
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const BASE_URL = "http://localhost:8000";

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("jwt");
      if (!token) {
        toast.error("Please sign in to view your health records");
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`${BASE_URL}/medicalDocuments`, {
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
        `${BASE_URL}/medicalDocuments/getUploadUrl`,
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
          'Content-Type': selectedFile.type, // optional, but must match presigned URL
        }
      });

      if (!uploadedResponse.ok) {
        toast.error("Failed to upload document to storage");
        return;
      }


      // Step 3: Confirm the upload completion to the backend
      await axios.post(
        `${BASE_URL}/medicalDocuments/${documentId}/confirmUpload`,
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

  const handleDelete = async (document: Document) => {
    if (!confirm(`Are you sure you want to delete "${document.name}"?`)) {
      return;
    }
    console.log(document);
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        toast.error("Please sign in to delete documents");
        return;
      }

      // Send the document ID and filename to the backend for deletion
      const response = await axios.delete(`${BASE_URL}/medicalDocuments/${document.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          filename: document.filename // Send the S3 filename for deletion
        }
      });

      if (response.data.success) {
        toast.success("Document deleted successfully");
        fetchDocuments();
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
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
        setPreviewUrl(document.url);
        window.open(document.url, '_blank');
        return;
      }

      // Otherwise, get a new signed URL
      const response = await axios.get(`${BASE_URL}/medicalDocuments/${document.id}/view`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.url) {
        setPreviewUrl(response.data.url);
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
      <div>
        <h1 className="text-3xl font-bold mb-6">Health Records</h1>
        
        <Tabs defaultValue="documents">
          <TabsList className="mb-6">
            <TabsTrigger value="documents">My Documents</TabsTrigger>
            <TabsTrigger value="upload">Upload Document</TabsTrigger>
          </TabsList>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>My Health Documents</CardTitle>
                <CardDescription>View and manage your medical records and documents</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center my-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>You haven't uploaded any health documents yet.</p>
                    <p className="mt-2">Upload your first document to keep track of your medical records.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((doc) => (
                      <Card key={doc.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            {getFileIcon(doc.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{doc.name}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(doc.uploadDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePreview(doc)}
                              className="flex items-center"
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(doc)}
                              className="flex items-center"
                            >
                              <Trash2Icon className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Health Document</CardTitle>
                <CardDescription>
                  Upload medical reports, prescriptions, lab results, and other health documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="document-name">Document Name</Label>
                  <Input
                    id="document-name"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="Enter a name for this document"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document-type">Document Type</Label>
                  <select
                    id="document-type"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {documentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Upload File</Label>
                  <div className="border rounded-md p-4">
                    <FileUploader
                      onFileSelect={handleFileChange}
                      acceptedFileTypes=".pdf,.jpg,.jpeg,.png"
                      maxFileSizeMB={5}
                    />
                    {selectedFile && (
                      <div className="mt-2 text-sm text-gray-500">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Accepted formats: PDF, JPG, JPEG, PNG. Maximum file size: 5MB.
                  </p>
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || !documentName || isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                      Uploading...
                    </>
                  ) : (
                    "Upload Document"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
} 