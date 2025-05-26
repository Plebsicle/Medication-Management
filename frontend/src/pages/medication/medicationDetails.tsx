import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AppLayout } from "@/components/layout/AppLayout";
import { ArrowLeft, Pencil, Save, Calendar, Clock } from "lucide-react";

interface medicationTimes {
    medication_time_id: number,
    medication_id: number,
    intake_time: string
}

type FormDataType = {
    medication_id: number,
    name: string;
    type: string;
    dosage: string;
    start_date: string;
    end_date: string;
    frequency: number;
    medication_times: medicationTimes[];
    instructions: string;
    notification_on: boolean;
};

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export default function MedicationDetails() {
    const navigate = useNavigate();
    const { medication_id } = useParams();
    const [medication, setMedication] = useState<FormDataType | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const fetchMedicationDetails = async () => {
            try {
                const jwt = localStorage.getItem('jwt');
                if (!jwt) {
                    toast.error("Authentication Required", {
                        description: "Please sign in to view medication details"
                    });
                    navigate('/signin');
                    return;
                }
                const response = await axios.get(`${BACKEND_URL}/medications/${medication_id}`, {
                    headers: {
                        Authorization: `Bearer ${jwt}`
                    }
                });

                const data = response.data;
                if (typeof data.intake_times === "string") {
                    data.intake_times = [data.intake_times];
                }
                setMedication(data);
            } catch (error) {
                console.error('Error fetching medication details:', error);
                toast.error("Error", {
                    description: "Failed to fetch medication details"
                });
            }
        };

        fetchMedicationDetails();
    }, [medication_id]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setMedication((prev) => prev && { ...prev, [name]: value });
    };

    const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const frequency = parseInt(e.target.value) || 1;
        if (!medication) return;

        // Get existing medication times
        const currentTimes = [...medication.medication_times];
        let updatedMedicationTimes = [];
        
        if (frequency > currentTimes.length) {
            // If increasing frequency, keep existing times and add new ones
            updatedMedicationTimes = [
                ...currentTimes,
                ...Array(frequency - currentTimes.length).fill(null).map(() => ({
                    medication_time_id: 0, // Will be assigned by backend
                    medication_id: medication.medication_id,
                    intake_time: "12:00" // Default time
                }))
            ];
        } else {
            // If reducing frequency, keep only the first 'frequency' times
            updatedMedicationTimes = currentTimes.slice(0, frequency);
        }
        
        setMedication(prev => prev && { 
            ...prev, 
            frequency, 
            medication_times: updatedMedicationTimes 
        });
    };

    const handleTimeChange = (index: number, value: string) => {
        if (!medication) return;
        
        // Create a deep copy of the medication_times array
        const updatedMedicationTimes = [...medication.medication_times];
        
        // Update the intake_time for the specific index
        updatedMedicationTimes[index] = {
            ...updatedMedicationTimes[index],
            intake_time: value
        };
        
        // Update the medication state with the new medication_times array
        setMedication({
            ...medication,
            medication_times: updatedMedicationTimes
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!medication) return;

        setIsSaving(true);
        try {
            const jwt = localStorage.getItem('jwt');
            if (!jwt) {
                toast.error("Authentication Required", {
                    description: "Please sign in to update medication details"
                });
                navigate('/signin');
                return;
            }
            const intake_times: string[] = []
            medication.medication_times.map((value: medicationTimes) => {
                intake_times.push(value.intake_time)
            });
            const payload = { ...medication, intake_times };
            const response = await axios.put(
                `${BACKEND_URL}/editMedications/${medication.medication_id}`,
                payload,
                { headers: { Authorization: `Bearer ${jwt}` } }
            );

            if (response.data.message === "Medication updated successfully") {
                toast.success("Success", {
                    description: "Medication details updated successfully"
                });
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Error updating medication details:', error);
            toast.error("Error", {
                description: "Failed to update medication details"
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (!medication) return (
        <AppLayout>
            <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-white">
                <div className="p-4 sm:p-8 rounded-lg bg-white shadow-md mx-4">
                    <p className="text-base sm:text-lg text-gray-600">Loading medication details...</p>
                </div>
            </div>
        </AppLayout>
    );

    return (
        <AppLayout>
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-12">
                {/* Hero Section - Hidden on small screens for better mobile UX */}
                <section className={`relative pt-4 sm:pt-8 pb-6 sm:pb-10 px-4 md:px-6 lg:px-8 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'} hidden sm:block`}>
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col lg:flex-row items-center">
                            <div className="lg:w-1/2 space-y-4">
                                <div className="inline-block bg-blue-100 text-blue-700 rounded-full px-4 py-1 text-sm font-medium mb-2">
                                    Medication Details
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                                    Edit <span className="text-blue-600">{medication.name}</span>
                                </h1>
                                <p className="text-lg text-gray-600 max-w-xl">
                                    Update your medication details to ensure you receive accurate reminders and tracking.
                                </p>
                            </div>
                            <div className="lg:w-1/2 mt-6 lg:mt-0 flex justify-center">
                                <div className="relative w-full max-w-md aspect-square bg-blue-100/50 rounded-full flex items-center justify-center shadow-xl">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 opacity-50" />
                                    <div className="relative h-32 w-32 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Pencil className="h-16 w-16 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Form Section */}
                <div className={`container mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-0 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="max-w-2xl sm:max-w-3xl mx-auto">
                        <Card className="border-0 shadow-lg bg-white overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                            <CardHeader className="px-4 sm:px-6">
                                <CardTitle className="text-xl sm:text-2xl text-blue-600">Edit Medication Details</CardTitle>
                                <CardDescription className="text-sm sm:text-base">Update the details for {medication.name}</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-gray-700 text-sm sm:text-base">Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={medication.name}
                                            onChange={handleInputChange}
                                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 sm:h-10 text-base sm:text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type" className="text-gray-700 text-sm sm:text-base">Type</Label>
                                        <select
                                            id="type"
                                            name="type"
                                            value={medication.type}
                                            onChange={handleInputChange}
                                            className="w-full p-3 sm:p-2 border rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 sm:h-10 text-base sm:text-sm"
                                        >
                                            <option value="pills">Pills</option>
                                            <option value="syrup">Syrup</option>
                                            <option value="injection">Injection</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dosage" className="text-gray-700 text-sm sm:text-base">Dosage</Label>
                                        <Input
                                            id="dosage"
                                            name="dosage"
                                            value={medication.dosage}
                                            onChange={handleInputChange}
                                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 sm:h-10 text-base sm:text-sm"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="start_date" className="text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                                                <Calendar className="h-4 w-4 text-blue-500" /> Start Date
                                            </Label>
                                            <Input
                                                id="start_date"
                                                name="start_date"
                                                type="date"
                                                value={medication.start_date}
                                                onChange={handleInputChange}
                                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 sm:h-10 text-base sm:text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="end_date" className="text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                                                <Calendar className="h-4 w-4 text-blue-500" /> End Date
                                            </Label>
                                            <Input
                                                id="end_date"
                                                name="end_date"
                                                type="date"
                                                value={medication.end_date}
                                                onChange={handleInputChange}
                                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 sm:h-10 text-base sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="frequency" className="text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                                            <Clock className="h-4 w-4 text-blue-500" /> Frequency (times per day)
                                        </Label>
                                        <Input
                                            id="frequency"
                                            name="frequency"
                                            type="number"
                                            min="1"
                                            value={medication.frequency}
                                            onChange={handleFrequencyChange}
                                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 sm:h-10 text-base sm:text-sm"
                                        />
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <Label className="text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                                            <Clock className="h-4 w-4 text-blue-500" /> Intake Times
                                        </Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {medication.medication_times.map((value: medicationTimes, index: number) => (
                                                <div key={index} className="space-y-1">
                                                    <Label htmlFor={`time-${index}`} className="text-xs sm:text-sm text-gray-600">
                                                        Time {index + 1}
                                                    </Label>
                                                    <Input
                                                        id={`time-${index}`}
                                                        type="time"
                                                        value={value.intake_time}
                                                        onChange={(e) => handleTimeChange(index, e.target.value)}
                                                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 sm:h-10 text-base sm:text-sm"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="instructions" className="text-gray-700 text-sm sm:text-base">Instructions</Label>
                                        <Textarea
                                            id="instructions"
                                            name="instructions"
                                            value={medication.instructions}
                                            onChange={handleInputChange}
                                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px] text-base sm:text-sm"
                                            rows={4}
                                        />
                                    </div>
                                    
                                    <div className="flex items-center space-x-3 py-2">
                                        <Switch
                                            id="notification"
                                            checked={medication.notification_on}
                                            onCheckedChange={(checked) => setMedication(prev => prev && { ...prev, notification_on: checked })}
                                            className="data-[state=checked]:bg-blue-500"
                                        />
                                        <Label htmlFor="notification" className="text-gray-700 text-sm sm:text-base cursor-pointer">Enable notifications</Label>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 bg-gray-50 px-4 sm:px-6 py-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate('/dashboard')}
                                        className="flex items-center justify-center gap-2 w-full sm:w-auto h-11 sm:h-10 order-2 sm:order-1"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to Dashboard
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSaving}
                                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 w-full sm:w-auto h-11 sm:h-10 order-1 sm:order-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}