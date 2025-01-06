import { useParams } from "react-router-dom";
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

export default function MedicationDetails() {
    const { medicationName } = useParams<{ medicationName: string }>();
    const [medication, setMedication] = useState<FormDataType | null>(null);

    useEffect(() => {
        const jwt = localStorage.getItem("jwt");
        if (jwt) {
            fetchMedicationDetails(jwt, medicationName!);
        }
    }, [medicationName]);

    async function fetchMedicationDetails(jwt: string, name: string) {
        try {
            const response = await axios.get(`http://localhost:8000/medications/${name}`, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
            setMedication(response.data);
        } catch (error) {
            console.error("Error fetching medication details:", error);
        }
    }

    if (!medication) return <p>Loading...</p>;

    return (
        <div>
            <h1>{medication.name}</h1>
            <p><strong>Type:</strong> {medication.type}</p>
            <p><strong>Dosage:</strong> {medication.dosage}</p>
            {/* Other details */}
        </div>
    );
}
