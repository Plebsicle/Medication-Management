import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, User, Mail, Shield, Bell} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AppLayout } from "@/components/layout/AppLayout";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/"

export default function Profile() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [updatedValue, setUpdatedValue] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  interface ProfileData {
    name: string;
    email: string;
    role: string;
    path: string | null;
    email_notifications: boolean;
    sms_notifications: boolean;
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem("jwt");
    if (!token) throw new Error("JWT token is missing");
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    // Add animation effect
    setIsVisible(true);
    
    const fetchProfileData = async () => {
      try {
        const { data } = await axios.get(`${BACKEND_URL}/serveProfile`, {
          headers: getAuthHeaders(),
        });

        setProfileData({
          name: data.name,
          email: data.email,
          role: data.role,
          path: data.path,
          email_notifications: data.email_notifications ?? true,
          sms_notifications: data.sms_notifications ?? true,
        });

        if (data.path) {
          const imageUrlRes = await axios.get(`${BACKEND_URL}/serveProfile/getPhotoUrl`, {
            headers: getAuthHeaders(),
          });
          if (imageUrlRes.data.url) setImagePreview(imageUrlRes.data.url);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch profile data");
      }
    };

    fetchProfileData();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) return toast.error("Only JPEG, JPG, PNG allowed");
    if (file.size > 5 * 1024 * 1024) return toast.error("File too large (max 5MB)");

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      setIsUploading(true);

      // Step 1: Request a presigned URL from the backend
      const { data } = await axios.post(
        `${BACKEND_URL}/serveProfile/profilePhoto`,
        { fileType: file.type },
        { headers: getAuthHeaders() }
      );

      if (!data.uploadUrl) {
        toast.error("Failed to get upload URL");
        return;
      }

      // Step 2: Upload file directly to S3 using the presigned URL
      const uploadResponse = await fetch(data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        }
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload to S3");
      }

      // Step 3: Get a signed URL for viewing the uploaded image
      const { data: urlData } = await axios.get(
        `${BACKEND_URL}/serveProfile/getPhotoUrl`,
        { headers: getAuthHeaders() }
      );

      if (urlData.url) {
        setImagePreview(urlData.url);
      }

      setProfileData(prev => prev ? { ...prev, path: data.path } : null);
      toast.success("Profile photo updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload profile photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditClick = (field: string) => {
    setEditingField(field);
    setUpdatedValue(profileData?.[field as keyof ProfileData] as string || "");
  };

  const handleSaveClick = async (field: string) => {
    try {
      await axios.post(`${BACKEND_URL}/serveProfile`, {
        [field]: updatedValue,
      }, {
        headers: getAuthHeaders(),
      });

      setProfileData(prev => prev ? { ...prev, [field]: updatedValue } : null);
      setEditingField(null);
      toast.success("Profile updated");
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  const handleNotificationToggle = async (type: "email_notifications" | "sms_notifications") => {
    if (!profileData) return;
    const newValue = !profileData[type];

    setProfileData(prev => prev ? { ...prev, [type]: newValue } : null);

    try {
      const { data } = await axios.post(`${BACKEND_URL}/serveProfile/updateNotificationPreferences`, {
        [type]: newValue,
      }, {
        headers: getAuthHeaders(),
      });

      if (!data.success) throw new Error();
      toast.success("Notification preferences updated");
    } catch (err) {
      setProfileData(prev => prev ? { ...prev, [type]: !newValue } : null);
      toast.error(`Failed to update ${type.replace("_", " ")}`);
    }
  };

  const handleUploadClick = () => {
    document.getElementById("file-input")?.click();
  };
  
  return (
    <AppLayout>
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-12">
        {/* Header Section */}
        <section className={`relative pt-8 pb-10 px-4 md:px-6 lg:px-8 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-full space-y-4">
                <div className="inline-block bg-blue-100 text-blue-700 rounded-full px-4 py-1 text-sm font-medium mb-2">
                  Your Profile
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  Manage Your <span className="text-blue-600">MediTrack</span> Profile
                </h1>
                <p className="text-lg text-gray-600 max-w-xl">
                  Update your personal information and notification preferences.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className={`container mx-auto px-4 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Card className="max-w-2xl mx-auto border-0 shadow-lg bg-white overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-blue-600">Profile Settings</CardTitle>
              <CardDescription>Manage your account settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div
                  className={`relative w-32 h-32 rounded-full overflow-hidden cursor-pointer group shadow-md transition-transform duration-300 ${isVisible ? 'scale-100' : 'scale-90'}`}
                  onClick={handleUploadClick}
                  style={{ transitionDelay: '100ms' }}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                      <User className="h-12 w-12 text-blue-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploading ? (
                      <div className="animate-spin h-6 w-6 border-2 border-white rounded-full border-t-transparent"></div>
                    ) : (
                      <Camera className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  {isUploading ? "Uploading..." : "Click to change profile photo"}
                </p>
              </div>

              <div className="space-y-4">
                <div className={`space-y-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '200ms' }}>
                  <Label className="capitalize text-blue-600">Name</Label>
                  {editingField === "name" ? (
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="text"
                        value={updatedValue}
                        onChange={(e) => setUpdatedValue(e.target.value)}
                        className="rounded-xl"
                      />
                      <Button
                        onClick={() => handleSaveClick("name")}
                        className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-gray-800">
                          {profileData
                            ? profileData.name
                            : "Loading..."}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick("name")}
                        className="text-blue-600 hover:bg-blue-50 rounded-xl"
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>

                <div className={`space-y-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '300ms' }}>
                  <Label className="text-blue-600">Role</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Shield className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="text-gray-800">{profileData?.role || "Loading..."}</p>
                  </div>
                </div>

                <div className={`space-y-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '400ms' }}>
                  <Label className="text-blue-600">Email</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Mail className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="text-gray-800">{profileData?.email || "Loading..."}</p>
                  </div>
                </div>
                
                <div className={`pt-4 mt-6 border-t transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '500ms' }}>
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Bell className="h-4 w-4 text-blue-500" />
                        </div>
                        <Label htmlFor="email-notifications" className="text-gray-800">Email Notifications</Label>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={profileData?.email_notifications || false}
                        onCheckedChange={() => handleNotificationToggle("email_notifications")}
                        className="data-[state=checked]:bg-blue-500"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Bell className="h-4 w-4 text-blue-500" />
                        </div>
                        <Label htmlFor="sms-notifications" className="text-gray-800">SMS Notifications</Label>
                      </div>
                      <Switch
                        id="sms-notifications"
                        checked={profileData?.sms_notifications || false}
                        onCheckedChange={() => handleNotificationToggle("sms_notifications")}
                        className="data-[state=checked]:bg-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </AppLayout>
  );
}
