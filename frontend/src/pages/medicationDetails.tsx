import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/sidebar";
import DashboardTopBar from "../components/dashboardNavbar";
import { toast, Bounce } from 'react-toastify'
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
    const { toast } = useToast();
    const navigate = useNavigate();
    const { medication_id } = useParams();
    const [medication, setMedication] = useState<FormDataType | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchMedicationDetails = async () => {
            try {
                const jwt = localStorage.getItem('jwt');
                if (!jwt) {
                    toast({
                        variant: "destructive",
                        title: "Authentication Required",
                        description: "Please sign in to view medication details",
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
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to fetch medication details",
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
                toast({
                    variant: "destructive",
                    title: "Authentication Required",
                    description: "Please sign in to update medication details",
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
                toast({
                    variant: "success",
                    title: "Success",
                    description: "Medication details updated successfully",
                });
                navigate('/medicationHistory');
            }
        } catch (error) {
            console.error('Error updating medication details:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update medication details",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (!medication) return <p>Loading...</p>;

    return (
        <div className="flex">
            <Sidebar />
            <div className="ml-20 pt-12 w-full">
                <DashboardTopBar />
                <div className="p-4">
                    <h1 className="text-2xl font-semibold mb-4">Edit Medication Details</h1>
                    <form className="grid gap-4" onSubmit={handleSubmit}>
                        <label>
                            <strong>Name:</strong>
                            <input
                                type="text"
                                name="name"
                                value={medication.name}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label>
                            <strong>Type:</strong>
                            <select
                                name="type"
                                value={medication.type}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            >
                                <option value="pills">Pills</option>
                                <option value="syrup">Syrup</option>
                                <option value="injection">Injection</option>
                            </select>
                        </label>
                        <label>
                            <strong>Dosage:</strong>
                            <input
                                type="text"
                                name="dosage"
                                value={medication.dosage}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label>
                            <strong>Start Date:</strong>
                            <input
                                type="date"
                                name="start_date"
                                value={medication.start_date}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label>
                            <strong>End Date:</strong>
                            <input
                                type="date"
                                name="end_date"
                                value={medication.end_date}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label>
                            <strong>Frequency:</strong>
                            <input
                                type="number"
                                name="frequency"
                                value={medication.frequency}
                                onChange={handleFrequencyChange}
                                min={1}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label>
                                <strong>Intake Times:</strong>
                                {Array.isArray(medication.intake_times) ? (
                                    medication.intake_times.map((time, index) => (
                                        <input
                                            key={index}
                                            type="time"
                                            value={time}
                                            onChange={(e) => handleTimeChange(index, e.target.value)}
                                            className="w-full p-2 border rounded mb-2"
                                        />
                                    ))
                                ) : (
                                    <p>No intake times specified</p>
                                )}
                            </label>
                        <label>
                            <strong>Instructions:</strong>
                            <textarea
                                name="instructions"
                                value={medication.instructions}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <div>
                            <strong>Notifications:</strong>
                            <input
                                type="checkbox"
                                name="notification_on"
                                checked={medication.notification_on}
                                onChange={(e) =>
                                    setMedication((prev) =>
                                        prev && { ...prev, notification_on: e.target.checked }
                                    )
                                }
                                className="ml-2"
                            />
                        </div>
                        <button
                            type="submit"
                            className={`px-6 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded shadow ${
                                isSaving && "opacity-50 cursor-not-allowed"
                            }`}
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
