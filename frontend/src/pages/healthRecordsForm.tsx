import DashboardTopBar from "../components/dashboardNavbar";
import Sidebar from "../components/sidebar";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function HealthRecordsForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        record_date: "",
        blood_pressure: "",
        heart_rate: "",
        weight: "",
        temperature: "",
        notes: ""
    });

    const [jwt, setJwt] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        setJwt(token);
        if (!token) {
            navigate("/signin");
        }
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!jwt) {
            console.error("JWT is not available.");
            return;
        }
        try {
            await axios.post("http://localhost:8000/healthRecords", formData, {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            });
            navigate("/health-records");
        } catch (error) {
            console.error("Error submitting health record:", error);
        }
    };

    return (
        <div className="flex">
            <Sidebar />
            <div className="ml-20 pt-12 w-full">
                <DashboardTopBar />
                <div className="p-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="record_date">Record Date</label>
                            <input
                                type="date"
                                id="record_date"
                                name="record_date"
                                value={formData.record_date}
                                onChange={handleChange}
                                required
                                className="border rounded p-2 w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="blood_pressure">Blood Pressure</label>
                            <input
                                type="text"
                                id="blood_pressure"
                                name="blood_pressure"
                                value={formData.blood_pressure}
                                onChange={handleChange}
                                className="border rounded p-2 w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="heart_rate">Heart Rate</label>
                            <input
                                type="number"
                                id="heart_rate"
                                name="heart_rate"
                                value={formData.heart_rate}
                                onChange={handleChange}
                                className="border rounded p-2 w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="weight">Weight</label>
                            <input
                                type="number"
                                step="0.01"
                                id="weight"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                className="border rounded p-2 w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="temperature">Temperature</label>
                            <input
                                type="number"
                                step="0.01"
                                id="temperature"
                                name="temperature"
                                value={formData.temperature}
                                onChange={handleChange}
                                className="border rounded p-2 w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="notes">Notes</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                className="border rounded p-2 w-full"
                            ></textarea>
                        </div>
                        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
