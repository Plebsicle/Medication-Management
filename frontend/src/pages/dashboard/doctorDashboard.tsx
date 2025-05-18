import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users } from "lucide-react";
import { AppLayout } from '@/components/layout/AppLayout';

interface Patient {
  id: number;
  name: string;
  profile_photo_path: string | null;
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

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
      loadPatients(jwt);
    };
    
    checkAuth();
  }, [navigate]);

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
      const response = await axios.get("http://localhost:8000/chats/user-chats", {
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
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Doctor Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Patient Consultations</CardTitle>
              <CardDescription>Manage your patient consultations</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Communicate directly with your patients via secure messaging.</p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link to="/doctor/chats" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  View Patient Chats
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Patient Records</CardTitle>
              <CardDescription>View medical records of your patients</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Access patient health records, medication history, and more.</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
                <Link to="/doctor/patients" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  View All Patients
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Your Patients</h2>
        
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : patients.length === 0 ? (
          <Card className="text-center p-8">
            <CardHeader>
              <CardTitle>No Patients Yet</CardTitle>
              <CardDescription>
                You haven't had any patient consultations yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Patients will appear here once they initiate a consultation with you.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                      <img
                        src={patient.profile_photo_path || 'https://cdn-icons-png.flaticon.com/512/147/147142.png'}
                        alt={patient.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{patient.name}</CardTitle>
                      <CardDescription>Patient</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="pt-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/doctor/chats`}>View Consultations</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
} 