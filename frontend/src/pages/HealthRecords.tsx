import DashboardTopBar from "../components/dashboardNavbar";
import Sidebar from "../components/sidebar";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

type healthrecord = {
    record_date : Date ,
    blood_pressure : string,
    heart_rate : number,
    weight : number,
    temperature : number,
    notes : string
}

export default function HealthRecords() {
    const [records, setRecords] = useState<healthrecord[]>([]);
    const navigate = useNavigate();
    useEffect(() => {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
            navigate("/signin");
        }
        async function fetchHealthRecords() {
            try {
                const response = await axios.get("http://localhost:8000/healthRecords", {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                });
                const recordsData = Array.isArray(response.data) ? response.data : response.data.records;
                const parsedRecords = recordsData.map((record: any) => ({
                    ...record,
                    record_date: new Date(record.record_date),
                }));
    
                setRecords(parsedRecords || []);
            } catch (error) {
                console.error("Error fetching health records:", error);
            }
        }
    
        fetchHealthRecords();
    }, [navigate]);
    

    return (
        <div className="flex">
            <Sidebar />
            <div className="ml-20 pt-12 w-full">
                <DashboardTopBar />
                <div className="p-4">
                    <Link to="/healthRecordsForm">
                        <button className="mb-4 px-6 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded shadow">
                            Add Health Record
                        </button>
                    </Link>
                    <div className="grid grid-cols-3 gap-4">
                    {records.map((record, index) => (
                            <div key={index} className="p-4 border rounded shadow">
                                <p><strong>Date:</strong> {record.record_date.toLocaleDateString()}</p>
                                <p><strong>Blood Pressure:</strong> {record.blood_pressure || "N/A"}</p>
                                <p><strong>Heart Rate:</strong> {record.heart_rate || "N/A"}</p>
                                <p><strong>Weight:</strong> {record.weight || "N/A"}</p>
                                <p><strong>Temperature:</strong> {record.temperature || "N/A"}</p>
                                <p><strong>Notes:</strong> {record.notes || "None"}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
