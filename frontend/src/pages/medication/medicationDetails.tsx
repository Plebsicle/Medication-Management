import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from "@/components/layout/AppLayout";

type FormDataType = {
    medication_id : number,
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

export default function MedicationDetails() {
    const navigate = useNavigate();
    const { medication_id } = useParams();
    const [medication, setMedication] = useState<FormDataType | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
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

                const response = await axios.get(`http://localhost:8000/medications/${medication_id}`, {
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
        setMedication((prev) =>
            prev && { ...prev, frequency, intake_times: Array(frequency).fill("") }
        );
    };

    const handleTimeChange = (index: number, value: string) => {
        if (!medication) return;
        const updatedTimes = [...medication.intake_times];
        updatedTimes[index] = value;
        setMedication({ ...medication, intake_times: updatedTimes });
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

            const payload = { ...medication, intake_times: medication.intake_times[0] };
            const response = await axios.put(
                `http://localhost:8000/editMedications/${medication.medication_id}`,
                payload,
                { headers: { Authorization: `Bearer ${jwt}` } }
            );

            if (response.data.message === "Medication updated successfully") {
                toast.success("Success", {
                    description: "Medication details updated successfully"
                });
                navigate('/medicationHistory');
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
            <div className="flex items-center justify-center h-screen">
                <p>Loading...</p>
            </div>
        </AppLayout>
    );

    return (
        <AppLayout>
            <div className="container mx-auto p-4">
                <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle>Edit Medication Details</CardTitle>
                        <CardDescription>Update the details for {medication.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="grid gap-4" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={medication.name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <select
                                    id="type"
                                    name="type"
                                    value={medication.type}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="pills">Pills</option>
                                    <option value="syrup">Syrup</option>
                                    <option value="injection">Injection</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dosage">Dosage</Label>
                                <Input
                                    id="dosage"
                                    name="dosage"
                                    value={medication.dosage}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input
                                    id="start_date"
                                    name="start_date"
                                    type="date"
                                    value={medication.start_date}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">End Date</Label>
                                <Input
                                    id="end_date"
                                    name="end_date"
                                    type="date"
                                    value={medication.end_date}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="frequency">Frequency (times per day)</Label>
                                <Input
                                    id="frequency"
                                    name="frequency"
                                    type="number"
                                    min="1"
                                    value={medication.frequency}
                                    onChange={handleFrequencyChange}
                                />
                            </div>
                            {medication.intake_times.map((time, index) => (
                                <div key={index} className="space-y-2">
                                    <Label htmlFor={`time-${index}`}>Intake Time {index + 1}</Label>
                                    <Input
                                        id={`time-${index}`}
                                        type="time"
                                        value={time}
                                        onChange={(e) => handleTimeChange(index, e.target.value)}
                                    />
                                </div>
                            ))}
                            <div className="space-y-2">
                                <Label htmlFor="instructions">Instructions</Label>
                                <Textarea
                                    id="instructions"
                                    name="instructions"
                                    value={medication.instructions}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notification">Notifications</Label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="notification"
                                        type="checkbox"
                                        checked={medication.notification_on}
                                        onChange={(e) => setMedication(prev => prev && { ...prev, notification_on: e.target.checked })}
                                    />
                                    <span className="text-sm">Enable notifications</span>
                                </div>
                            </div>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
