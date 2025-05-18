import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ExternalLink, Loader2, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

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
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Add animation effect
        setIsVisible(true);
    }, []);

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
            <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-12">
                {/* Hero Section */}
                <section className={`relative pt-8 pb-10 px-4 md:px-6 lg:px-8 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col lg:flex-row items-center">
                            <div className="lg:w-2/3 space-y-4">
                                <div className="inline-block bg-blue-100 text-blue-700 rounded-full px-4 py-1 text-sm font-medium mb-2">
                                    Healthcare Facilities
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                                    Find <span className="text-blue-600">Nearby Hospitals</span>
                                </h1>
                                <p className="text-lg text-gray-600 max-w-xl">
                                    Locate healthcare facilities in your area for emergency or general medical services.
                                </p>
                            </div>
                            <div className="lg:w-1/3 mt-6 lg:mt-0 flex justify-center">
                                <div className="relative w-full max-w-md aspect-video bg-blue-100/30 rounded-2xl flex items-center justify-center shadow-xl">
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-100 to-indigo-50 opacity-50" />
                                    <div className="relative h-24 w-24 bg-blue-500 rounded-full flex items-center justify-center">
                                        <MapPin className="h-12 w-12 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-4">
                    {/* Action Section */}
                    <div className={`flex flex-col md:flex-row justify-between items-center mb-8 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <Card className="w-full md:w-3/4 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white mb-6 md:mb-0 md:mr-6">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-2xl text-blue-600">Locate Hospitals</CardTitle>
                                <CardDescription>
                                    Click the button to find hospitals near your current location. Your location data is only used to find nearby facilities.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button 
                                    onClick={fetchHospitals} 
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Finding Hospitals...
                                        </>
                                    ) : (
                                        <>
                                            <MapPin className="mr-2 h-5 w-5" />
                                            Find Nearby Hospitals
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Results Section */}
                    <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        {error ? (
                            <Card className="border-0 shadow-md bg-white">
                                <CardContent className="p-6 text-center">
                                    <div className="flex flex-col items-center justify-center p-6">
                                        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                            <MapPin className="h-8 w-8 text-red-500" />
                                        </div>
                                        <p className="text-red-500 text-lg font-medium">{error}</p>
                                        <p className="text-gray-500 mt-2">Please try again or check your location settings.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : hospitals.length > 0 ? (
                            <>
                                <div className="flex items-center mb-6">
                                    <h2 className="text-2xl font-semibold text-gray-900">Results</h2>
                                    <div className="ml-4 h-1 bg-blue-100 flex-grow rounded-full"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {hospitals.map((hospital, index) => (
                                        <Card 
                                            key={hospital.id} 
                                            className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white overflow-hidden"
                                            style={{ 
                                                transitionDelay: `${100 + index * 50}ms` 
                                            }}
                                        >
                                            <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                                            <CardHeader>
                                                <CardTitle className="text-xl text-blue-600">
                                                    {hospital.name || "Unknown Hospital"}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                    {hospital.postcode || "Postcode not available"}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="p-3 bg-blue-50 rounded-xl">
                                                    <div className="text-sm">
                                                        <strong className="text-blue-600">Address:</strong>
                                                        <p className="text-gray-700 mt-1">
                                                            {hospital.address || "Address not available"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
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
                            </>
                        ) : (
                            <Card className="text-center border-0 shadow-md bg-white">
                                <CardContent className="p-8">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                            <MapPin className="h-8 w-8 text-blue-500" />
                                        </div>
                                        <p className="text-gray-700 text-lg font-medium">
                                            {isLoading ? "Finding nearby hospitals..." : "No hospitals found nearby."}
                                        </p>
                                        <p className="text-gray-500 mt-2">
                                            {isLoading 
                                                ? "Please wait while we locate healthcare facilities in your area." 
                                                : "Click the 'Find Nearby Hospitals' button to search for hospitals in your vicinity."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}