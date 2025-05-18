import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Bell, Trash2, Clock, MessageSquare, Stethoscope } from "lucide-react";
import { AppLayout } from '@/components/layout/AppLayout';
import formatIntakeTime from "@/lib/formatIntakeTime";

type FormDataType = {
  medication_id: number;
  name: string;
  type: string;
  dosage: string;
  start_date: string;
  end_date: string;
  frequency: number;
  intake_times: string[];
  instructions: string;
  notification_on: boolean;
};

interface Doctor {
  id: number;
  name: string;
  profile_photo_path: string | null;
  doctor: {
    speciality: string;
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [medications, setMedications] = useState<FormDataType[]>([]);
  const [isMedication, setIsMedication] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) {
        toast.error("Authentication Required", {
          description: "Please sign in to continue",
        });
        navigate('/signin');
        return;
      }
      verifyJwtToken(jwt);
    };
    checkAuth();
  }, []);

  async function verifyJwtToken(jwt: string) {
    try {
      const response = await axios.post(
        "http://localhost:8000/verifyToken",
        {},
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      if (!response || !response.data.isTokenPresent) {
        navigate("/signin");
        return;
      }

      if (response.data.userRole) {
        setUserRole(response.data.userRole);
        // Don't store user data in localStorage, we'll use the decoded JWT token via useAuth
        
        // If user is a patient, load available doctors
        if (response.data.userRole !== 'doctor') {
          loadAvailableDoctors(jwt);
        }
      }

      const medicationResponse = await axios.get("http://localhost:8000/addMedication", {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (medicationResponse.data.isMedication) {
        setMedications(medicationResponse.data.medications);
        setIsMedication(true);
      } else {
        setIsMedication(false);
      }
    } catch (error) {
      console.error("Error Verifying JWT:", error);
      navigate("/signin");
      toast.error("Error", {
        description: "Please sign up to continue",
      });
    }
  }

  async function loadAvailableDoctors(jwt: string) {
    try {
      setLoadingDoctors(true);
      const response = await axios.get("http://localhost:8000/chats/available-doctors", {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      
      if (response.data && response.data.doctors) {
        setDoctors(response.data.doctors);
      }
    } catch (error) {
      console.error("Error loading doctors:", error);
    } finally {
      setLoadingDoctors(false);
    }
  }

  const toggleNotification = async (index: number) => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;

    const medication = medications[index];
    try {
      const updatedNotification = !medication.notification_on;
      await axios.put(
        `http://localhost:8000/toggleNotification`,
        { notification_on: updatedNotification, medication },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      setMedications((prev) =>
        prev.map((med, i) =>
          i === index ? { ...med, notification_on: updatedNotification } : med
        )
      );
      toast.success("Notification settings updated");
    } catch (error) {
      console.error("Error toggling notification:", error);
      toast.error("Failed to update notification settings");
    }
  };

  const deleteMedication = async (index: number) => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;

    const medication = medications[index];
    try {
      await axios.post(
        `http://localhost:8000/deleteMedication`,
        { medicationFull: medication },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      setMedications((prev) => prev.filter((_, i) => i !== index));
      toast.success("Medication deleted successfully");
    } catch (error) {
      console.error("Error deleting medication:", error);
      toast.error("Failed to delete medication");
    }
  };

  const handleStartChat = async (doctorId: number) => {
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) return;
      
      const response = await axios.post(
        "http://localhost:8000/chats/initiate",
        { doctorId },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      
      if (response.data && response.data.chatId) {
        navigate(`/patient/chat/${response.data.chatId}`);
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Failed to start chat");
    }
  };

  // Helper to format intake time
  

  return (
    <AppLayout>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>My Medications</CardTitle>
              <CardDescription>Manage your medications and reminders</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Track your medications, set reminders, and manage your health routine.</p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link to="/addMedication" className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Medication
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Doctor Consultations</CardTitle>
              <CardDescription>Connect with doctors</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Consult with doctors to get professional medical advice and guidance.</p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link to="/patient/chats" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat with Doctors
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Available Doctors Section */}
        {userRole !== 'doctor' && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Available Doctors</h2>
            {loadingDoctors ? (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : doctors.length === 0 ? (
              <Card className="text-center p-8 mb-8">
                <CardContent>
                  <p className="text-gray-500">No doctors available at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {doctors.slice(0, 3).map((doctor) => (
                  <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                          <img
                            src={doctor.profile_photo_path || 'https://cdn-icons-png.flaticon.com/512/147/147142.png'}
                            alt={doctor.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{doctor.name}</CardTitle>
                          <CardDescription>{doctor.doctor?.speciality || 'Doctor'}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter className="pt-2 flex justify-between">
                      <Button onClick={() => handleStartChat(doctor.id)} className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Start Chat
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/patient/chats">
                          <Stethoscope className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
            {doctors.length > 3 && (
              <div className="flex justify-center mb-8">
                <Button variant="outline" asChild>
                  <Link to="/patient/chats">View All Doctors</Link>
                </Button>
              </div>
            )}
          </>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Medications</h1>
          <Button asChild>
            <Link to="/addMedication" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Medication
            </Link>
          </Button>
        </div>

        {isMedication ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medications.map((medication, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{medication.name}</CardTitle>
                      <CardDescription>{medication.type}</CardDescription>
                    </div>
                    <Badge variant={medication.notification_on ? "default" : "secondary"}>
                      {medication.notification_on ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {medication.frequency} times per day
                      </span>
                    </div>
                    <div className="text-sm">
                      <strong>Dosage:</strong> {medication.dosage}
                    </div>
                    <div className="text-sm">
                      <strong>Instructions:</strong> {medication.instructions}
                    </div>
                    <div className="text-sm">
                      <strong>Intake Times:</strong>
                      <ul className="list-disc list-inside">
                        {medication.intake_times.map((time, i) => (
                          <li key={i}>{formatIntakeTime(time)}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <Switch
                      checked={medication.notification_on}
                      onCheckedChange={() => toggleNotification(index)}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteMedication(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-8">
            <CardHeader>
              <CardTitle>No Medications Added</CardTitle>
              <CardDescription>
                Start by adding your first medication to track your health journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="mt-4">
                <Link to="/addMedication" className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Your First Medication
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
