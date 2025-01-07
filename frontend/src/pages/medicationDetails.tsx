import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/sidebar";
import DashboardTopBar from "../components/dashboardNavbar";
import {toast,Bounce} from 'react-toastify'

type FormDataType = {
    name: string;
    type: string;
    dosage: string;
    start_date: string;
    end_date: string;
    frequency: number;
    intake_times: string[]; // Adjusted to an array of strings
    instructions: string;
    notification_on: boolean;
};

export default function MedicationDetails() {
    const { medicationName } = useParams<{ medicationName: string }>();
    const navigate = useNavigate();
    const [medication, setMedication] = useState<FormDataType | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const jwt = localStorage.getItem("jwt");
        if (jwt && medicationName) {
            fetchMedicationDetails(jwt, medicationName);
        }
    }, [medicationName]);

    async function fetchMedicationDetails(jwt: string, name: string) {
        try {
            const response = await axios.get(`http://localhost:8000/medications/${name}`, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
            const data = response.data;
            if (typeof data.intake_times === "string") {
                data.intake_times = [data.intake_times]; 
            }
            setMedication(data);
        } catch (error) {
            console.error("Error fetching medication details:", error);
        }
    }

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

    const handleSave = async () => {
        if (!medication) return;
        setIsSaving(true);

        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
            toast.error('Sign In Please!', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
            navigate("/signin");
            return;
        }

        try {
            const payload = { ...medication, intake_times: medication.intake_times[0] };
            await axios.put(
                `http://localhost:8000/editMedications/${medication.name}`,
                payload,
                { headers: { Authorization: `Bearer ${jwt}` } }
            );
            toast.success('Medication Details Edited SuccessFully!', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
        } catch (error) {
            console.error("Error updating medication details:", error);
            toast.error('Failed to update medication details!', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
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
                    <form className="grid gap-4">
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
                            type="button"
                            onClick={handleSave}
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
