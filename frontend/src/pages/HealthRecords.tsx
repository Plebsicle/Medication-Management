import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import { PlusCircle, Activity, Heart, Thermometer, Scale, FileText } from "lucide-react";
// import { MainLayout } from "@/components/layout/MainLayout";

type healthrecord = {
    record_id: number;
    record_date: Date;
    blood_pressure: string | null;
    heart_rate: number | null;
    weight: number | null;
    temperature: number | null;
    notes: string | null;
};

export default function HealthRecords() {
    const [records, setRecords] = useState<healthrecord[]>([]);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const jwt = localStorage.getItem("jwt");
                if (!jwt) {
                    toast.error("Please sign in to view health records");
                    return;
                }

                const response = await axios.get("http://localhost:8000/healthRecords", {
                    headers: { Authorization: `Bearer ${jwt}` },
                });

                if (response.data) {
                    setRecords(response.data);
                }
            } catch (error) {
                console.error("Error fetching health records:", error);
                toast.error("Failed to fetch health records");
            }
        };

        fetchRecords();
    }, []);

    return (
        
            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Health Records</h1>
                    <Button asChild>
                        <Link to="/healthRecordsForm" className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Add Health Record
                        </Link>
                    </Button>
                </div>

                {records.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {records.map((record, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle>
                                        {new Date(record.record_date).toLocaleDateString()}
                                    </CardTitle>
                                    <CardDescription>Health Record</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {record.blood_pressure && (
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Blood Pressure</p>
                                                <p className="text-sm text-muted-foreground">{record.blood_pressure}</p>
                                            </div>
                                        </div>
                                    )}
                                    {record.heart_rate && (
                                        <div className="flex items-center gap-2">
                                            <Heart className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Heart Rate</p>
                                                <p className="text-sm text-muted-foreground">{record.heart_rate} bpm</p>
                                            </div>
                                        </div>
                                    )}
                                    {record.weight && (
                                        <div className="flex items-center gap-2">
                                            <Scale className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Weight</p>
                                                <p className="text-sm text-muted-foreground">{record.weight} kg</p>
                                            </div>
                                        </div>
                                    )}
                                    {record.temperature && (
                                        <div className="flex items-center gap-2">
                                            <Thermometer className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Temperature</p>
                                                <p className="text-sm text-muted-foreground">{record.temperature}°C</p>
                                            </div>
                                        </div>
                                    )}
                                    {record.notes && (
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Notes</p>
                                                <p className="text-sm text-muted-foreground">{record.notes}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-6 text-center">
                            <p className="text-muted-foreground">No health records available.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        
    );
}
