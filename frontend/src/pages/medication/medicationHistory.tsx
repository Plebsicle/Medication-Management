import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Pill, Info, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

type FormDataType = {
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

// Helper to format date
function formatDate(dateStr: string) {
    // If already in a readable format (e.g., contains a comma), return as is
    if (dateStr && dateStr.match(/\w+, \d{1,2}, \d{4}/)) return dateStr;
    // Otherwise, try to parse and format
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
    return dateStr; // fallback
}

// Helper to format frequency
function formatFrequency(freq: number | undefined) {
    if (!freq || freq < 1) return 'N/A';
    if (freq === 1) return 'Once per day';
    return `${freq} times per day`;
}

export default function MedicationHistory() {
    const navigate = useNavigate();
    const [medications, setMedications] = useState<FormDataType[]>([]);
    const [isMedication, setIsMedication] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const fetchMedicationHistory = async () => {
            try {
                const jwt = localStorage.getItem('jwt');
                if (!jwt) {
                    toast.error("Authentication Required", {
                        description: "Please sign in to view medication history"
                    });
                    navigate('/signin');
                    return;
                }

                const response = await axios.get(`${BACKEND_URL}/medicationHistory`, {
                    headers: {
                        Authorization: `Bearer ${jwt}`
                    }
                });

                if (response.data && response.data.length > 0) {
                    setMedications(response.data);
                    setIsMedication(true);
                } else {
                    setIsMedication(false);
                }
            } catch (error) {
                console.error('Error fetching medication history:', error);
                setIsMedication(false);
                toast.error("Error", {
                    description: "Failed to fetch medication history"
                });
            }
        };

        fetchMedicationHistory();
    }, []);

    return (
        <AppLayout>
            <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-12">
                {/* Hero Section */}
                <section className={`relative pt-8 pb-10 px-4 md:px-6 lg:px-8 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col lg:flex-row items-center">
                            <div className="lg:w-1/2 space-y-4">
                                <div className="inline-block bg-blue-100 text-blue-700 rounded-full px-4 py-1 text-sm font-medium mb-2">
                                    Your Health Records
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                                    Your <span className="text-blue-600">Medication</span> History
                                </h1>
                                <p className="text-lg text-gray-600 max-w-xl">
                                    Track your past and current medications to maintain a comprehensive health record.
                                </p>
                                <Button asChild variant="outline" className="mt-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl">
                                    <Link to="/dashboard" className="flex items-center gap-2">
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to Dashboard
                                    </Link>
                                </Button>
                            </div>
                            <div className="lg:w-1/2 mt-6 lg:mt-0 flex justify-center">
                                <div className="relative w-full max-w-md aspect-square bg-blue-100/50 rounded-full flex items-center justify-center shadow-xl">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 opacity-50" />
                                    <div className="relative h-32 w-32 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Calendar className="h-16 w-16 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Medication History Content */}
                <div className={`container mx-auto px-4 transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="flex items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900">Medication Records</h2>
                        <div className="ml-4 h-1 bg-blue-100 flex-grow rounded-full"></div>
                    </div>

                    {isMedication ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {medications.map((medication, index) => (
                                <Card key={index} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
                                    <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-xl text-blue-600">{medication.name}</CardTitle>
                                                <CardDescription className="flex items-center gap-2 mt-1">
                                                    <Pill className="h-4 w-4" />
                                                    <span className="capitalize">{medication.type}</span>
                                                </CardDescription>
                                            </div>
                                            <Badge variant={medication.notifications ? "default" : "secondary"} className={medication.notifications ? "bg-blue-500" : ""}>
                                                {medication.notifications ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm text-gray-600">
                                                {formatFrequency(medication.frequency)}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-blue-500" />
                                                <div className="text-sm">
                                                    <span className="font-medium">Start:</span>{" "}
                                                    <span className="text-gray-600">{formatDate(medication.startDate)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-blue-500" />
                                                <div className="text-sm">
                                                    <span className="font-medium">End:</span>{" "}
                                                    <span className="text-gray-600">{formatDate(medication.endDate)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            <strong>Dosage:</strong>{" "}
                                            <span>{medication.dosage}</span>
                                        </div>
                                        {medication.intakeTimes && medication.intakeTimes.length > 0 && (
                                            <div className="text-sm text-gray-700">
                                                <strong>Intake Times:</strong>
                                                <ul className="mt-1 pl-4">
                                                    {medication.intakeTimes.map((time, i) => {
                                                        const [hours, minutes] = time.split(':');
                                                        const hour = parseInt(hours);
                                                        const ampm = hour >= 12 ? 'PM' : 'AM';
                                                        const displayHour = hour % 12 || 12;
                                                        const formattedTime = `${displayHour}:${minutes} ${ampm}`;
                                                        return (
                                                            <li key={i} className="flex items-center gap-2">
                                                                <Clock className="h-3 w-3 text-blue-500" />
                                                                {formattedTime}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="bg-gray-50 pt-4">
                                        {medication.instructions && (
                                            <div className="text-sm w-full">
                                                <div className="flex items-center gap-2">
                                                    <Info className="h-4 w-4 text-blue-500" />
                                                    <strong>Instructions:</strong>
                                                </div>
                                                <p className="mt-1 text-gray-600">{medication.instructions}</p>
                                            </div>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center p-8 border-0 shadow-md bg-white">
                            <CardContent className="p-6">
                                <div className="flex justify-center my-6">
                                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Calendar className="h-10 w-10 text-blue-500" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-blue-600 mb-2">No Medication History</h3>
                                <p className="text-gray-600">You don't have any medications in your history.</p>
                                <Button asChild className="mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                                    <Link to="/dashboard" className="flex items-center gap-2">
                                        <ArrowLeft className="h-4 w-4" />
                                        Return to Dashboard
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </AppLayout>
    );
}
