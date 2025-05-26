import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlusCircle, Activity, Heart, Thermometer, Scale, FileText, ArrowRight, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

type healthrecord = {
    health_records_id: number;
    record_date: Date;
    blood_pressure: string | null;
    heart_rate: number | null;
    weight: number | null;
    temperature: number | null;
    notes: string | null;
};

export default function HealthRecords() {
    const [records, setRecords] = useState<healthrecord[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsVisible(true);
        const fetchRecords = async () => {
            try {
                setIsLoading(true);
                const jwt = localStorage.getItem("jwt");
                if (!jwt) {
                    toast.error("Please sign in to view health records");
                    return;
                }

                const response = await axios.get(`${BACKEND_URL}/healthRecords`, {
                    headers: { Authorization: `Bearer ${jwt}` },
                });
                console.log(response.data); 
                if (response.data) {
                    setRecords(response.data);
                }
            } catch (error) {
                console.error("Error fetching health records:", error);
                toast.error("Failed to fetch health records");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecords();
    }, []);

    const deleteMedication = async (record_id: number, index: number) => {
        const token = localStorage.getItem('jwt');
        console.log(record_id);
        if (!token) {
            toast.error("Please sign in to view health records");
            return;
        }
        console.log(token);
        const res = await axios.post(`${BACKEND_URL}/healthRecords/delete`, { record_id }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        setRecords(records.filter((_, arrIndex) => { return index != arrIndex }));
        if (res.status !== 204) {
            toast.error("Deletion Of Health Record Failed");
        }
        else {
            toast.success("Record Deleted Successfully");
        }
    }

    return (
        <AppLayout>
            <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-12">
                {/* Hero Section - Mobile Optimized */}
                <section className={`relative pt-4 sm:pt-8 pb-6 sm:pb-10 px-4 sm:px-6 lg:px-8 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col lg:flex-row items-center">
                            <div className="lg:w-1/2 space-y-3 sm:space-y-4 text-center lg:text-left">
                                <div className="inline-block bg-blue-100 text-blue-700 rounded-full px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium mb-2">
                                    Health Tracking
                                </div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                                    Your <span className="text-blue-600">Health Records</span>
                                </h1>
                                <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
                                    Track your vital signs and health metrics over time to monitor your wellbeing.
                                </p>
                            </div>
                            <div className="lg:w-1/2 mt-6 lg:mt-0 flex justify-center">
                                <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-full md:max-w-md md:aspect-square bg-blue-100/50 rounded-full flex items-center justify-center shadow-xl">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 opacity-50" />
                                    <div className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Heart className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Records Section - Mobile Optimized */}
                <div className={`container mx-auto px-4 sm:px-6 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                        <div className="flex items-center flex-grow w-full">
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 whitespace-nowrap">My Health Records</h2>
                            <div className="ml-4 h-1 bg-blue-100 flex-grow rounded-full"></div>
                        </div>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl w-full sm:w-auto shrink-0">
                            <Link to="/healthRecordsForm" className="flex items-center justify-center gap-2 text-sm sm:text-base">
                                <PlusCircle className="h-4 w-4" />
                                <span className="hidden xs:inline">Add Health Record</span>
                                <span className="xs:hidden">Add Record</span>
                            </Link>
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center my-8">
                            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : records.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {records.map((record, index) => (
                                <Card key={index} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
                                    <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg sm:text-xl text-blue-600">
                                            {new Date(record.record_date).toLocaleDateString()}
                                        </CardTitle>
                                        <CardDescription className="text-sm">Health Record</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3 sm:space-y-4 pb-3">
                                        {record.blood_pressure && (
                                            <div className="flex items-center gap-2">
                                                <Activity className="h-4 w-4 text-blue-500 shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium">Blood Pressure</p>
                                                    <p className="text-sm text-gray-600 truncate">{record.blood_pressure}</p>
                                                </div>
                                            </div>
                                        )}
                                        {record.heart_rate && (
                                            <div className="flex items-center gap-2">
                                                <Heart className="h-4 w-4 text-blue-500 shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium">Heart Rate</p>
                                                    <p className="text-sm text-gray-600">{record.heart_rate} bpm</p>
                                                </div>
                                            </div>
                                        )}
                                        {record.weight && (
                                            <div className="flex items-center gap-2">
                                                <Scale className="h-4 w-4 text-blue-500 shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium">Weight</p>
                                                    <p className="text-sm text-gray-600">{record.weight} kg</p>
                                                </div>
                                            </div>
                                        )}
                                        {record.temperature && (
                                            <div className="flex items-center gap-2">
                                                <Thermometer className="h-4 w-4 text-blue-500 shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium">Temperature</p>
                                                    <p className="text-sm text-gray-600">{record.temperature}°C</p>
                                                </div>
                                            </div>
                                        )}
                                        {record.notes && (
                                            <div className="flex items-start gap-2">
                                                <FileText className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium">Notes</p>
                                                    <p className="text-sm text-gray-600 break-words">{record.notes}</p>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex justify-end bg-gray-50 py-3 px-4">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => deleteMedication(record.health_records_id, index)}
                                            className="rounded-full h-8 w-8 p-0 shrink-0"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center p-6 sm:p-8 border-0 shadow-md bg-white">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl sm:text-2xl text-blue-600">No Health Records</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Start tracking your health metrics to monitor your wellbeing over time
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-center my-4 sm:my-6">
                                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />
                                    </div>
                                </div>
                                <Button asChild className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl w-full sm:w-auto">
                                    <Link to="/healthRecordsForm" className="flex items-center justify-center gap-2">
                                        <PlusCircle className="h-4 w-4" />
                                        <span className="hidden sm:inline">Add Your First Health Record</span>
                                        <span className="sm:hidden">Add First Record</span>
                                        <ArrowRight className="ml-1 h-4 w-4" />
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