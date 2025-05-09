import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast, Bounce } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Bell, Trash2, Clock } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

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

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [medications, setMedications] = useState<FormDataType[]>([]);
  const [isMedication, setIsMedication] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please sign in to continue",
        });
        navigate('/signin');
        return;
      }
      verifyJwtToken(jwt);
      handleNotificationPermission();
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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please sign up to continue",
      });
    }
  }

  const handleNotificationPermission = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        toast({
          variant: "destructive",
          title: "Not Supported",
          description: "Push notifications are not supported in this browser",
        });
        return;
      }
  
      const permission = await Notification.requestPermission();
  
      if (permission !== 'granted') {
        toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "Notifications permission was not granted",
        });
        return;
      }
  
      toast({
        variant: "success",
        title: "Success",
        description: "Notifications permission granted!",
      });
  
      // Register the service worker
      const swRegistration = await navigator.serviceWorker.register('/service-worker.js');
      console.log("Service worker registered:", swRegistration);
  
      // Wait for the service worker to become active
      const registration = await navigator.serviceWorker.ready;
      console.log("Service worker is ready for push");
  
      const existingSubscription = await registration.pushManager.getSubscription();
  
      if (!existingSubscription) {
        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) throw new Error("VAPID Public Key is missing");
  
        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
  
        const newSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
  
        console.log("New push subscription:", newSubscription);
  
        const jwt = localStorage.getItem("jwt");
        if (jwt) {
          await axios.post("http://localhost:8000/subscribe", {
            subscription: newSubscription,
          }, {
            headers: { Authorization: `Bearer ${jwt}` }
          });
  
          toast({
            variant: "success",
            title: "Success",
            description: "Push subscription saved",
          });
        }
      } else {
        console.log("Already subscribed to push notifications");
      }
    } catch (error) {
      console.error("Push setup error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
  

  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
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
    } catch (error) {
      console.error("Error toggling notification:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update notification settings",
      });
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
      toast({
        variant: "success",
        title: "Success",
        description: "Medication deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting medication:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete medication",
      });
    }
  };

  // Helper to format intake time
  function formatIntakeTime(time: string) {
    // Handles both '15:15:00.000Z' and '15:15' formats
    let t = time;
    if (t.includes('T')) t = t.split('T')[1];
    if (t.includes('Z')) t = t.replace('Z', '');
    t = t.split('.')[0];
    const [hours, minutes] = t.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  return (
    <div className="container mx-auto p-6">
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
  );
}
