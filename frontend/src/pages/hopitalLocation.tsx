import DashboardTopBar from "../components/dashboardNavbar";
import Sidebar from "../components/sidebar";
import { useState } from "react";
import axios from "axios";
import {toast,Bounce} from 'react-toastify'

type Hospital = {
    id: number;
    name: string | null;
    address: string | null;
    postcode: string | null;
    googleMapsLink: string;
};

export default function HospitalLocation() {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchHospitals = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const { coords } = await new Promise<GeolocationPosition>((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(resolve, reject)
            );

            const response = await axios.post("http://localhost:8000/hospitalLocation", {
                latitude: coords.latitude,
                longitude: coords.longitude,
                radius: 5000, 
            });
            if(response.data){
                toast.success('NearBy Hospitals Found!', {
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
            }
            setHospitals(response.data.hospitals);
        } catch (err: any) {
            console.error("Error fetching hospitals:", err.message);
            setError(err.response?.data?.message || "An error occurred while fetching hospitals.");
            toast.error('error occurred while fetching hospitals!', {
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
            setIsLoading(false);
        }
    };

    return (
        <div className="flex">
            <Sidebar />
            <div className="ml-20 pt-12 w-full">
                <DashboardTopBar />
                <div className="p-4">
                    <button
                        onClick={fetchHospitals}
                        className="mb-4 px-6 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded shadow"
                    >
                        Find Hospitals
                    </button>

                    {isLoading ? (
                        <p className="text-blue-500 font-semibold">Loading hospitals...</p>
                    ) : error ? (
                        <p className="text-red-500 font-semibold">{error}</p>
                    ) : hospitals.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4">
                            {hospitals.map((hospital) => (
                                <div key={hospital.id} className="p-4 border rounded shadow">
                                    <h3 className="text-lg font-semibold">{hospital.name || "Unknown Hospital"}</h3>
                                    <p>
                                        <strong>Address:</strong> {hospital.address || "Address not available"}
                                    </p>
                                    <p>
                                        <strong>Postcode:</strong> {hospital.postcode || "Postcode not available"}
                                    </p>
                                    <a
                                        href={hospital.googleMapsLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 underline"
                                    >
                                        View on Google Maps
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-red-500 font-semibold">No hospitals found nearby.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
