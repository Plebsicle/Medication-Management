import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, User, Mail, Shield } from "lucide-react";
// import { MainLayout } from "@/components/layout/MainLayout";

export default function Profile() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<{
    name: string;
    email: string;
    role: string;
    path: string | null;
  } | null>(null);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [updatedValue, setUpdatedValue] = useState<string>("");

  const BASE_URL = "http://localhost:8000";

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) {
          console.error("JWT token is missing");
          toast.error("Please sign in to view your profile");
          return;
        }

        const response = await axios.get(`${BASE_URL}/serveProfile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;
        setProfileData({
          name: data.name,
          email: data.email,
          role: data.role,
          path: data.path,
        });

        if (data.path) {
          setImagePreview(`${BASE_URL}${data.path}`);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to fetch profile data");
      }
    };

    fetchProfileData();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);

      try {
        const token = localStorage.getItem("jwt");
        if (!token) {
          console.error("JWT token is missing");
          toast.error("Please sign in to update your profile");
          return;
        }
        const formData = new FormData();
        formData.append("profilePhoto", file);
        const response = await axios.post(`${BASE_URL}/profilePhoto`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        const imagePath = `${BASE_URL}${response.data.path}`;
        setImagePreview(imagePath);
        setProfileData((prev) =>
          prev ? { ...prev, path: response.data.path } : null
        );
        toast.success("Profile photo updated successfully");
      } catch (error) {
        console.error("Error uploading profile photo:", error);
        toast.error("Failed to upload profile photo");
      }
    }
  };

  const handleUploadClick = () => {
    const fileInput = document.getElementById("file-input") as HTMLInputElement;
    fileInput.click();
  };

  const handleEditClick = (field: string) => {
    setEditingField(field);
    setUpdatedValue(
      profileData && profileData[field as keyof typeof profileData]
        ? (profileData[field as keyof typeof profileData] as string)
        : ""
    );
  };

  const handleSaveClick = async (field: string) => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        console.error("JWT token is missing");
        toast.error("Please sign in to update your profile");
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/serveProfile`,
        { [field]: updatedValue },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        toast.success("Profile updated successfully");
        setProfileData((prev) =>
          prev ? { ...prev, [field]: updatedValue } : null
        );
        setEditingField(null);
      }
    } catch (error) {
      console.error("Error updating profile data:", error);
      toast.error("Failed to update profile");
    }
  };

  return (
    
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Manage your account settings and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div
                className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer group"
                onClick={handleUploadClick}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-muted-foreground">Click to change profile photo</p>
            </div>

            <div className="space-y-4">
              {["name", "role"].map((field) => (
                <div key={field} className="space-y-2">
                  <Label className="capitalize">{field}</Label>
                  {editingField === field ? (
                    <div className="flex gap-2">
                      {field === "role" ? (
                        <Select
                          value={updatedValue}
                          onValueChange={setUpdatedValue}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="patient">Patient</SelectItem>
                            <SelectItem value="caregiver">Caregiver</SelectItem>
                            <SelectItem value="doctor">Doctor</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type="text"
                          value={updatedValue}
                          onChange={(e) => setUpdatedValue(e.target.value)}
                        />
                      )}
                      <Button
                        variant="outline"
                        onClick={() => handleSaveClick(field)}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {field === "name" ? (
                          <User className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Shield className="h-4 w-4 text-muted-foreground" />
                        )}
                        <p className="text-sm">
                          {profileData
                            ? profileData[field as keyof typeof profileData]
                            : "Loading..."}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(field)}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{profileData?.email}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    
  );
}
