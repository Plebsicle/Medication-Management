import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Pill, Info } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";

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

    useEffect(() => {
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

                const response = await axios.get('http://localhost:8000/medicationHistory', {
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
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6">Medication History</h1>
                {isMedication ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {medications.map((medication, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl">{medication.name}</CardTitle>
                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                <Pill className="h-4 w-4" />
                                                <span className="capitalize">{medication.type}</span>
                                            </CardDescription>
                                        </div>
                                        <Badge variant={medication.notifications ? "default" : "secondary"}>
                                            {medication.notifications ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            {formatFrequency(medication.frequency)}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div className="text-sm">
                                                <span className="font-medium">Start:</span>{" "}
                                                <span className="text-muted-foreground">{formatDate(medication.startDate)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div className="text-sm">
                                                <span className="font-medium">End:</span>{" "}
                                                <span className="text-muted-foreground">{formatDate(medication.endDate)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm">
                                        <strong>Dosage:</strong>{" "}
                                        <span className="text-muted-foreground">{medication.dosage}</span>
                                    </div>
                                    {medication.intakeTimes && medication.intakeTimes.length > 0 && (
                                        <div className="text-sm">
                                            <strong>Intake Times:</strong>
                                            <ul className="mt-1 text-muted-foreground pl-4">
                                                    {medication.intakeTimes.map((time, i) => {
                                                    const [hours, minutes] = time.split(':');
                                                    const hour = parseInt(hours);
                                                    const ampm = hour >= 12 ? 'PM' : 'AM';
                                                    const displayHour = hour % 12 || 12;
                                                    const formattedTime = `${displayHour}:${minutes} ${ampm}`;
                                                    return (
                                                        <li key={i} className="flex items-center gap-2">
                                                            <Clock className="h-3 w-3" />
                                                            {formattedTime}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                    {medication.instructions && (
                                        <div className="text-sm">
                                            <div className="flex items-center gap-2">
                                                <Info className="h-4 w-4 text-muted-foreground" />
                                                <strong>Instructions:</strong>
                                            </div>
                                            <p className="mt-1 text-muted-foreground">{medication.instructions}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-6 text-center">
                            <p className="text-muted-foreground">No medication history available.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
