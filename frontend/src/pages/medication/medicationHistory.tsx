import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Info, ArrowLeft, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

type MedicationTimeType = {
    medication_time_id: number;
    medication_id: number;
    intake_time: string;
};

type NotificationType = {
    notification_id: number;
    message: string;
    created_at: string;
    medication_id: number;
    notification_on: boolean;
    updated_at: string;
};

type MedicationType = {
    medication_id: number;
    user_id: number;
    caretaker_id: number | null;
    name: string;
    type: string;
    dosage: string;
    start_date: string;
    end_date: string;
    instructions: string;
    frequency: number;
    medication_times: MedicationTimeType[];
    notification: NotificationType[];
};

// Import formatIntakeTime if it exists, otherwise define it here
let formatIntakeTime : any;

try {
    formatIntakeTime = require("@/lib/formatIntakeTime").default;
} catch (e) {
    formatIntakeTime = (time: string) => {
        if (!time) return 'N/A';
        
        // Handle date format like '2025-05-17T00:00:00.000Z'
        if (time.includes('T00:00:00')) {
            const date = new Date(time);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }
        
        // Handles both '15:15:00.000Z' and '15:15' formats for times
        let t = time;
        if (t.includes('T')) t = t.split('T')[1];
        if (t.includes('Z')) t = t.replace('Z', '');
        t = t.split('.')[0];
        const [hours, minutes] = t.split(":");
        if (!hours || !minutes) return 'N/A';
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };
}

// Helper to format frequency
function formatFrequency(freq: number | undefined) {
    if (!freq || freq < 1) return 'N/A';
    if (freq === 1) return 'Once per day';
    return `${freq} times per day`;
}

export default function MedicationHistory() {
    const navigate = useNavigate();
    const [medications, setMedications] = useState<MedicationType[]>([]);
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
                {/* Hero Section - Mobile Responsive */}
                <section className={`relative pt-4 sm:pt-8 pb-6 sm:pb-10 px-3 sm:px-4 md:px-6 lg:px-8 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col lg:flex-row items-center">
                            <div className="lg:w-1/2 space-y-3 sm:space-y-4 text-center lg:text-left">
                                <div className="inline-block bg-blue-100 text-blue-700 rounded-full px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium mb-2">
                                    Your Health Records
                                </div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                                    Your <span className="text-blue-600">Medication</span> History
                                </h1>
                                <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
                                    Track your past and current medications to maintain a comprehensive health record.
                                </p>
                                <Button asChild variant="outline" className="mt-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl w-fit">
                                    <Link to="/dashboard" className="flex items-center gap-2 text-sm sm:text-base">
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to Dashboard
                                    </Link>
                                </Button>
                            </div>
                            <div className="lg:w-1/2 mt-6 lg:mt-0 flex justify-center">
                                <div className="relative w-40 sm:w-56 md:w-64 aspect-square bg-blue-100/50 rounded-full flex items-center justify-center shadow-xl">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 opacity-50" />
                                    <div className="relative h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Calendar className="h-10 w-10 sm:h-14 sm:w-14 md:h-16 md:w-16 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Medication History Content - Mobile Responsive */}
                <div className={`container mx-auto px-3 sm:px-4 transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    {/* Header with responsive layout */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                        <div className="flex items-center flex-grow">
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Medication Records</h2>
                            <div className="ml-4 h-1 bg-blue-100 flex-grow rounded-full"></div>
                        </div>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl w-full sm:w-auto">
                            <Link to="/medication-history" className="flex items-center justify-center gap-2 text-sm sm:text-base">
                                <PlusCircle className="h-4 w-4" />
                                View All History
                            </Link>
                        </Button>
                    </div>

                    {isMedication ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {medications.map((medication) => (
                                <Card key={medication.medication_id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
                                    <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                                    <CardHeader className="pb-2 px-4 sm:px-6">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                                            <div className="min-w-0 flex-1">
                                                <CardTitle className="text-lg sm:text-xl text-blue-600 truncate">{medication.name}</CardTitle>
                                                <CardDescription className="text-gray-600 capitalize text-sm">
                                                    {medication.type}
                                                </CardDescription>
                                            </div>
                                            <Badge variant="secondary" 
                                                className="bg-yellow-400 text-yellow-800 self-start whitespace-nowrap text-xs">
                                                Inactive
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                            <span className="text-sm text-gray-600">
                                                {formatFrequency(medication.frequency)}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                                <div className="text-sm min-w-0">
                                                    <span className="font-medium">Start: </span>
                                                    <span className="text-gray-600 break-words">
                                                        {medication.start_date ? formatIntakeTime(medication.start_date) : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                                <div className="text-sm min-w-0">
                                                    <span className="font-medium">End: </span>
                                                    <span className="text-gray-600 break-words">
                                                        {medication.end_date ? formatIntakeTime(medication.end_date) : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            <strong>Dosage: </strong>
                                            <span className="break-words">{medication.dosage}</span>
                                        </div>
                                        {medication.medication_times && medication.medication_times.length > 0 && (
                                            <div className="text-sm text-gray-700">
                                                <strong>Intake Times:</strong>
                                                <ul className="mt-1 ml-2 list-disc list-inside space-y-1">
                                                    {medication.medication_times.map((time) => (
                                                        <li key={time.medication_time_id} className="break-words">
                                                            {formatIntakeTime(time.intake_time)}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </CardContent>
                                    {medication.instructions && (
                                        <CardFooter className="bg-gray-50 pt-4 px-4 sm:px-6">
                                            <div className="text-sm w-full">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                                    <strong>Instructions:</strong>
                                                </div>
                                                <p className="text-gray-600 break-words leading-relaxed">{medication.instructions}</p>
                                            </div>
                                        </CardFooter>
                                    )}
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center p-6 sm:p-8 border-0 shadow-md bg-white">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex justify-center my-4 sm:my-6">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />
                                    </div>
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-blue-600 mb-2">No Medication History</h3>
                                <p className="text-gray-600 text-sm sm:text-base">You don't have any medications in your history.</p>
                                <Button asChild className="mt-4 sm:mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl w-full sm:w-auto">
                                    <Link to="/dashboard" className="flex items-center justify-center gap-2">
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