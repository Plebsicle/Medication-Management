import DashboardTopBar from "../components/dashboardNavbar";
import Sidebar from "../components/sidebar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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

export default function Dashboard() {
    const navigate = useNavigate();
    const [medications, setMedications] = useState<FormDataType[]>([]);
    const [isMedication, setIsMedication] = useState(false);

    useEffect(() => {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
            navigate("/signin");
        } else {
            verifyJwtToken(jwt);
        }
    }, [navigate]);

    async function verifyJwtToken(jwt: string) {
        try {
            const response = await axios.post(
                "http://localhost:8000/verifyToken",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                }
            );

            if (!response || !response.data.isTokenPresent) {
                navigate("/signin");
                return;
            }

            const medicationResponse = await axios.get("http://localhost:8000/addMedication", {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            });

            if (medicationResponse.data.isMedication) {
                setMedications(medicationResponse.data.medications);
                setIsMedication(true);
            } else {
                setIsMedication(false);
            }
        } catch (error) {
            console.error("Error Verifying JWT:", error);
            navigate("/signin");
        }
    }

    const toggleNotification = async (index: number) => {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) return;

        const medication = medications[index];
        try {
            const updatedNotification = !medication.notification_on;
            await axios.put(
                `http://localhost:8000/toggleNotification`,
                { notification_on: updatedNotification, medication },
                {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                }
            );

            setMedications((prev) =>
                prev.map((med, i) =>
                    i === index ? { ...med, notification_on: updatedNotification } : med
                )
            );
        } catch (error) {
            console.error("Error toggling notification:", error);
        }
    };

    const deleteMedication = async (index: number) => {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) return;

        const medication = medications[index];
        try {
            await axios.post(`http://localhost:8000/deleteMedication`, { medicationFull: medication }, {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            });

            setMedications((prev) => prev.filter((_, i) => i !== index));
        } catch (error) {
            console.error("Error deleting medication:", error);
        }
    };

    return (
        <div className="flex">
            <Sidebar />
            <div className="ml-20 pt-12 w-full">
                <DashboardTopBar />
                <div className="p-4">
                    <Link to="/addMedication">
                        <button className="mb-4 px-6 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded shadow">
                            Add Medication
                        </button>
                    </Link>
                    {isMedication ? (
                        <div className="grid grid-cols-3 gap-4">
                            {medications.map((medication, index) => (
                                <div key={index} className="p-4 border rounded shadow hover:bg-gray-100 transition">
                                    <h3 className="text-lg font-semibold">{medication.name}</h3>
                                    <p><strong>Type:</strong> {medication.type}</p>
                                    <p><strong>Dosage:</strong> {medication.dosage}</p>
                                    <p><strong>Start Date:</strong> {medication.start_date}</p>
                                    <p><strong>End Date:</strong> {medication.end_date}</p>
                                    <p><strong>Frequency:</strong> {medication.frequency}</p>
                                    <p><strong>Instructions:</strong> {medication.instructions}</p>
                                    <p><strong>Notifications:</strong> {medication.notification_on ? "On" : "Off"}</p>
                                    <p><strong>Intake Times:</strong> {medication.intake_times.join(", ")}</p>

                                    {/* Buttons Section */}
                                    <div className="flex items-center justify-between mt-4">
                                        {/* Notification Toggle */}
                                        <label className="flex items-center">
                                            <span className="mr-2">Notifications</span>
                                            <input
                                                type="checkbox"
                                                checked={medication.notification_on}
                                                onChange={() => toggleNotification(index)}
                                                className="toggle-checkbox"
                                            />
                                        </label>

                                        <div className="flex gap-2">
                                            {/* Edit Button */}
                                            <Link
                                                to={`/medications/${encodeURIComponent(medication.name)}`}
                                                className="px-4 py-2 text-white bg-yellow-500 hover:bg-yellow-600 rounded shadow"
                                            >
                                                Edit
                                            </Link>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => deleteMedication(index)}
                                                className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded shadow"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-red-500 font-semibold">There are no active medications.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
