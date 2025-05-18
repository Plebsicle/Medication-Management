import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import { MapPin, ExternalLink, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
// import { MainLayout } from "@/components/layout/MainLayout";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

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

            const response = await axios.post(`${BACKEND_URL}/hospitalLocation`, {
                latitude: coords.latitude,
                longitude: coords.longitude,
                radius: 5000,
            });

            if (response.data) {
                toast.success('Nearby hospitals found!');
                setHospitals(response.data.hospitals);
            }
        } catch (err: any) {
            console.error("Error fetching hospitals:", err.message);
            setError(err.response?.data?.message || "An error occurred while fetching hospitals.");
            toast.error('Error occurred while fetching hospitals');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Nearby Hospitals</h1>
                    <Button onClick={fetchHospitals} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Finding Hospitals...
                            </>
                        ) : (
                            <>
                                <MapPin className="mr-2 h-4 w-4" />
                                Find Hospitals
                            </>
                        )}
                    </Button>
                </div>

                {error ? (
                    <Card>
                        <CardContent className="p-6 text-center">
                            <p className="text-destructive">{error}</p>
                        </CardContent>
                    </Card>
                ) : hospitals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hospitals.map((hospital) => (
                            <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle>{hospital.name || "Unknown Hospital"}</CardTitle>
                                    <CardDescription className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        {hospital.postcode || "Postcode not available"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-sm">
                                        <strong>Address:</strong>
                                        <p className="text-muted-foreground mt-1">
                                            {hospital.address || "Address not available"}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        asChild
                                    >
                                        <a
                                            href={hospital.googleMapsLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            View on Google Maps
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-6 text-center">
                            <p className="text-muted-foreground">
                                {isLoading ? "Finding nearby hospitals..." : "No hospitals found nearby."}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
