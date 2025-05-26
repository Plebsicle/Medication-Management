import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, ArrowRight, Clipboard } from "lucide-react";
import { AppLayout } from '@/components/layout/AppLayout';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

interface Patient {
  id: number;
  name: string;
  profile_photo_path: string | null;
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
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
      loadPatients(jwt);
    };
    
    checkAuth();
  }, [navigate]);

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

      // Don't store user data in localStorage, we'll use the decoded JWT token via useAuth

    } catch (error) {
      console.error("Error Verifying JWT:", error);
      navigate("/signin");
      toast.error("Error", {
        description: "Please sign in to continue",
      });
    }
  }

  async function loadPatients(jwt: string) {
    try {
      setLoading(true);
      // Get all chats and extract patients
      const response = await axios.get(`${BACKEND_URL}/chats/user-chats`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      
      // Extract unique patients from chats
      if (response.data.chats && response.data.chats.length > 0) {
        const uniquePatients: Record<number, Patient> = {};
        
        response.data.chats.forEach((chat: any) => {
          if (chat.patient && !uniquePatients[chat.patient.id]) {
            uniquePatients[chat.patient.id] = chat.patient;
          }
        });
        
        setPatients(Object.values(uniquePatients));
      }
    } catch (error) {
      console.error("Error loading patients:", error);
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-12">
        {/* Hero Section */}
        <section className={`relative pt-8 pb-10 px-4 md:px-6 lg:px-8 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 space-y-4">
                <div className="inline-block bg-blue-100 text-blue-700 rounded-full px-4 py-1 text-sm font-medium mb-2">
                  Doctor Portal
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  Welcome to your <span className="text-blue-600">MediTrack</span> Dashboard
                </h1>
                <p className="text-lg text-gray-600 max-w-xl">
                  Manage patient consultations, view medical records, and provide quality care.
                </p>
              </div>
              <div className="lg:w-1/2 mt-6 lg:mt-0 flex justify-center">
                <div className="relative w-full max-w-md aspect-square bg-blue-100/50 rounded-full flex items-center justify-center shadow-xl">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 opacity-50" />
                  <div className="relative h-32 w-32 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-5xl font-bold">M</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Access Cards */}
        <div className={`container mx-auto px-4 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl text-blue-600">Patient Consultations</CardTitle>
                <CardDescription>Manage your patient consultations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Communicate directly with your patients via secure messaging.</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                  <Link to="/doctor/chats" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    View Patient Chats
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl text-blue-600">Patient Records</CardTitle>
                <CardDescription>View medical records of your patients</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Access patient health records, medication history, and more.</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                  <Link to="/doctor/patients" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    View All Patients
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Patients Section */}
          <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center flex-grow">
                <h2 className="text-2xl font-semibold text-gray-900">Your Patients</h2>
                <div className="ml-4 h-1 bg-blue-100 flex-grow rounded-full"></div>
              </div>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                <Link to="/doctor/chats" className="flex items-center gap-2">
                  <Clipboard className="h-4 w-4" />
                  All Patients
                </Link>
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : patients.length === 0 ? (
              <Card className="text-center p-8 border-0 shadow-md bg-white">
                <CardHeader>
                  <CardTitle className="text-2xl text-blue-600">No Patients Yet</CardTitle>
                  <CardDescription>
                    You haven't had any patient consultations yet.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center my-6">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-10 w-10 text-blue-500" />
                    </div>
                  </div>
                  <p className="text-gray-500 mb-4">
                    Patients will appear here once they initiate a consultation with you.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map((patient) => (
                  <Card key={patient.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-full overflow-hidden bg-blue-100 shadow-inner">
                          <img
                            src={patient.profile_photo_path || 'https://cdn-icons-png.flaticon.com/512/147/147142.png'}
                            alt={patient.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-blue-600">{patient.name}</CardTitle>
                          <CardDescription className="text-gray-600">Patient</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter className="pt-4 flex justify-between">
                      <Button 
                        asChild
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2"
                      >
                        <Link to="/doctor/chats">
                          <MessageSquare className="h-4 w-4" />
                          Chat History
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
            
            {patients.length > 6 && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" asChild className="border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl">
                  <Link to="/doctor/chats" className="flex items-center gap-2">
                    View All Patients
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </AppLayout>
  );
}