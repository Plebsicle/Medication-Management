import { useState, useEffect } from "react";
import DashboardTopBar from "../components/dashboardNavbar";
import axios from "axios";
import Sidebar from "../components/sidebar";

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
      } catch (error) {
        console.error("Error uploading profile photo:", error);
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
        return;
      }

      await axios.post(
        `${BASE_URL}/serveProfile`,
        { [field]: updatedValue },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfileData((prev) =>
        prev ? { ...prev, [field]: updatedValue } : null
      );
      setEditingField(null);
    } catch (error) {
      console.error("Error updating profile data:", error);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-20 pt-12 w-full">
        <DashboardTopBar />
        <div className="ml-20 pt-12 w-full">
          <div className="flex">
            <div
              className="w-40 h-40 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center cursor-pointer relative"
              style={{
                border: "2px solid #ccc",
              }}
              onClick={handleUploadClick}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500">No Image</span>
              )}
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div className="ml-10 flex flex-col gap-4">
              {["name", "role"].map((field) => (
                <div key={field} className="flex items-center gap-4">
                  <p className="text-lg font-semibold capitalize w-32">
                    {field}:
                  </p>
                  {editingField === field ? (
                    <>
                      {field === "role" ? (
                        <select
                          value={updatedValue}
                          onChange={(e) => setUpdatedValue(e.target.value)}
                          className="border rounded px-2 py-1 w-64"
                        >
                          <option value="patient">Patient</option>
                          <option value="caregiver">Caregiver</option>
                          <option value="doctor">Doctor</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={updatedValue}
                          onChange={(e) => setUpdatedValue(e.target.value)}
                          className="border rounded px-2 py-1 w-64"
                        />
                      )}
                      <button
                        onClick={() => handleSaveClick(field)}
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="w-64">
                        {profileData
                          ? profileData[field as keyof typeof profileData]
                          : "Loading..."}
                      </p>
                      <button
                        onClick={() => handleEditClick(field)}
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
