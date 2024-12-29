import DashboardTopBar from "../components/dashboardNavbar";
import Sidebar from "../components/sidebar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

type FormDataType = {
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

export default function MedicationHistory() {
    const navigate = useNavigate();
    const [medications, setMedications] = useState<FormDataType[]>([]);
    const [isMedication, setIsMedication] = useState(false);

    useEffect(() => {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
            navigate("/signin");
        } else {
            fetchMedicationHistory(jwt);
        }
    }, [navigate]);

    async function fetchMedicationHistory(jwt: string) {
        try {
            const response = await axios.get("http://localhost:8000/medicationHistory", {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            });

            if (response.data && response.data.length > 0) {
                setMedications(response.data);
                setIsMedication(true);
            } else {
                setIsMedication(false);
            }
        } catch (error) {
            console.error("Error fetching medication history:", error);
            setIsMedication(false);
        }
    }

    return (
        <div className="flex">
            <Sidebar />
            <div className="ml-20 pt-12 w-full">
                <DashboardTopBar />
                <div className="p-4">
                    {isMedication ? (
                        <div className="grid grid-cols-3 gap-4">
                            {medications.map((medication, index) => (
                                <div key={index} className="p-4 border rounded shadow">
                                    <h3 className="text-lg font-semibold">{medication.name}</h3>
                                    <p><strong>Type:</strong> {medication.type}</p>
                                    <p><strong>Dosage:</strong> {medication.dosage}</p>
                                    <p><strong>Start Date:</strong> {medication.start_date}</p>
                                    <p><strong>End Date:</strong> {medication.end_date}</p>
                                    <p><strong>Frequency:</strong> {medication.frequency}</p>
                                    <p><strong>Instructions:</strong> {medication.instructions}</p>
                                    <p><strong>Notifications:</strong> {medication.notification_on ? "On" : "Off"}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-red-500 font-semibold">No medication history available.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
