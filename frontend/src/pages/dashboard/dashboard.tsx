import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Bell, Trash2, Clock, MessageSquare, ArrowRight, Calendar } from "lucide-react";
import { AppLayout } from '@/components/layout/AppLayout';
import formatIntakeTime from "@/lib/formatIntakeTime";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

type MedicationType = {
  medication_id: number;
  name: string;
  type: string;
  dosage: string;
  startDate: string;
  endDate: string;
  frequency: number;
  intakeTimes: string[];
  instructions: string;
  notifications: boolean;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [medications, setMedications] = useState<MedicationType[]>([]);
  const [isMedication, setIsMedication] = useState(false);
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
      verifyJwtToken(jwt);
    };
    checkAuth();
  }, []);

  async function verifyJwtToken(jwt: string) {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/verifyToken`,
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

      const medicationResponse = await axios.get(`${BACKEND_URL}/addMedication`, {
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

  const formatDate = (dateString : any) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const toggleNotification = async (index: number) => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;

    const medication = medications[index];
    try {
      const updatedNotification = !medication.notifications;
      await axios.put(
        `${BACKEND_URL}/toggleNotification`,
        { notifications: updatedNotification, medication },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      setMedications((prev) =>
        prev.map((med, i) =>
          i === index ? { ...med, notifications: updatedNotification } : med
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
        `${BACKEND_URL}/deleteMedication`,
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

  return (
    <AppLayout>
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-12">
        {/* Hero Section - Mobile Optimized */}
        <section className={`relative pt-4 sm:pt-8 pb-6 sm:pb-10 px-3 sm:px-4 md:px-6 lg:px-8 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 space-y-3 sm:space-y-4">
                <div className="inline-block bg-blue-100 text-blue-700 rounded-full px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium mb-2">
                  Your Health Dashboard
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  Welcome to your <span className="text-blue-600">MediTrack</span> Dashboard
                </h1>
                <p className="text-base sm:text-lg text-gray-600 max-w-xl">
                  Track your medications, connect with doctors, and take control of your health journey.
                </p>
              </div>
              <div className="lg:w-1/2 mt-4 sm:mt-6 lg:mt-0 flex justify-center">
                <div className="relative w-48 sm:w-64 md:w-full max-w-md aspect-square bg-blue-100/50 rounded-full flex items-center justify-center shadow-xl">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 opacity-50" />
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-3xl sm:text-4xl md:text-5xl font-bold">M</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Access Cards - Mobile Optimized */}
        <div className={`w-full px-3 sm:px-4 md:px-6 lg:px-8 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                <CardHeader className="pb-2 px-4 sm:px-6">
                  <CardTitle className="text-xl sm:text-2xl text-blue-600">My Medications</CardTitle>
                  <CardDescription className="text-sm sm:text-base">Manage your medications and reminders</CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <p className="text-gray-600 text-sm sm:text-base">Track your medications, set reminders, and manage your health routine.</p>
                </CardContent>
                <CardFooter className="px-4 sm:px-6">
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl w-full sm:w-auto">
                    <Link to="/addMedication" className="flex items-center justify-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Add Medication</span>
                      <span className="sm:hidden">Add</span>
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                <CardHeader className="pb-2 px-4 sm:px-6">
                  <CardTitle className="text-xl sm:text-2xl text-blue-600">Doctor Consultations</CardTitle>
                  <CardDescription className="text-sm sm:text-base">Connect with doctors</CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <p className="text-gray-600 text-sm sm:text-base">Consult with doctors to get professional medical advice and guidance.</p>
                </CardContent>
                <CardFooter className="px-4 sm:px-6">
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl w-full sm:w-auto">
                    <Link to="/patient/chats" className="flex items-center justify-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span className="hidden sm:inline">Chat with Doctors</span>
                      <span className="sm:hidden">Chat</span>
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Medications Section - Mobile Optimized */}
            <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                <div className="flex items-center flex-grow">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">My Medications</h2>
                  <div className="ml-4 h-1 bg-blue-100 flex-grow rounded-full"></div>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl w-full sm:w-auto">
                  <Link to="/addMedication" className="flex items-center justify-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Medication</span>
                    <span className="sm:hidden">Add</span>
                  </Link>
                </Button>
              </div>

              {isMedication ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {medications.map((medication, index) => (
                    <Card key={index} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                      <CardHeader 
                        className="cursor-pointer px-4 sm:px-6"
                        onClick={() => {navigate(`/medicationDetails/${medication.medication_id}`)}}
                      >
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 flex-1 pr-2">
                            <CardTitle className="text-lg sm:text-xl text-blue-600 truncate">{medication.name}</CardTitle>
                            <CardDescription className="text-sm sm:text-base">{medication.type}</CardDescription>
                          </div>
                          <Badge variant={medication.notifications ? "default" : "secondary"} className={`${medication.notifications ? "bg-blue-500" : ""} text-xs whitespace-nowrap`}>
                            {medication.notifications ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span className="text-sm text-gray-600">
                              {medication.frequency} times per day
                            </span>
                          </div>
                          <div className="text-sm text-gray-700">
                            <strong>Dosage:</strong> <span className="break-words">{medication.dosage}</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm text-gray-700">
                            <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <strong>Duration:</strong>
                              <div className="break-words">
                                {formatDate(medication.startDate)} - {formatDate(medication.endDate)}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-700">
                            <strong>Instructions:</strong> <span className="break-words">{medication.instructions}</span>
                          </div>
                          <div className="text-sm text-gray-700">
                            <strong>Intake Times:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              {medication.intakeTimes.map((time, i) => (
                                <li key={i} className="break-words">{formatIntakeTime(time)}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between bg-gray-50 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <Bell className={`h-4 w-4 ${medication.notifications ? "text-blue-500" : "text-gray-400"}`} />
                          <Switch
                            checked={medication.notifications}
                            onCheckedChange={() => toggleNotification(index)}
                            className="data-[state=checked]:bg-blue-500"
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deleteMedication(index)}
                          className="rounded-full h-8 w-8 flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center p-6 sm:p-8 border-0 shadow-md bg-white">
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-xl sm:text-2xl text-blue-600">No Medications Added</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Start by adding your first medication to track your health journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="flex justify-center my-4 sm:my-6">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-100 rounded-full flex items-center justify-center">
                        <PlusCircle className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />
                      </div>
                    </div>
                    <Button asChild className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl w-full sm:w-auto">
                      <Link to="/addMedication" className="flex items-center justify-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">Add Your First Medication</span>
                        <span className="sm:hidden">Add Medication</span>
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}