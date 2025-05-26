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
                {/* Hero Section - Mobile Optimized */}
                <section className={`relative pt-4 sm:pt-8 pb-6 sm:pb-10 px-4 md:px-6 lg:px-8 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                            <div className="w-full lg:w-2/3 space-y-3 sm:space-y-4 text-center lg:text-left">
                                <div className="inline-block bg-blue-100 text-blue-700 rounded-full px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium mb-2">
                                    Healthcare Facilities
                                </div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                                    Find <span className="text-blue-600">Nearby Hospitals</span>
                                </h1>
                                <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
                                    Locate healthcare facilities in your area for emergency or general medical services.
                                </p>
                            </div>
                            <div className="w-full lg:w-1/3 mt-4 lg:mt-0 flex justify-center">
                                <div className="relative w-48 h-36 sm:w-64 sm:h-48 md:w-full md:max-w-md md:aspect-video bg-blue-100/30 rounded-2xl flex items-center justify-center shadow-xl">
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-100 to-indigo-50 opacity-50" />
                                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 bg-blue-500 rounded-full flex items-center justify-center">
                                        <MapPin className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-4">
                    {/* Action Section - Mobile Optimized */}
                    <div className={`flex flex-col items-center mb-6 sm:mb-8 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <Card className="w-full max-w-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                            <CardHeader className="pb-2 px-4 sm:px-6">
                                <CardTitle className="text-xl sm:text-2xl text-blue-600 text-center sm:text-left">
                                    Locate Hospitals
                                </CardTitle>
                                <CardDescription className="text-sm sm:text-base text-center sm:text-left">
                                    Click the button to find hospitals near your current location. Your location data is only used to find nearby facilities.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6">
                                <Button 
                                    onClick={fetchHospitals} 
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 sm:py-3 text-sm sm:text-base"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                                            <span className="hidden sm:inline">Finding Hospitals...</span>
                                            <span className="sm:hidden">Finding...</span>
                                        </>
                                    ) : (
                                        <>
                                            <MapPin className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                            <span className="hidden sm:inline">Find Nearby Hospitals</span>
                                            <span className="sm:hidden">Find Hospitals</span>
                                            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Results Section - Mobile Optimized */}
                    <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        {error ? (
                            <Card className="border-0 shadow-md bg-white">
                                <CardContent className="p-4 sm:p-6 text-center">
                                    <div className="flex flex-col items-center justify-center p-4 sm:p-6">
                                        <div className="h-12 w-12 sm:h-16 sm:w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                            <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
                                        </div>
                                        <p className="text-red-500 text-base sm:text-lg font-medium px-2">{error}</p>
                                        <p className="text-gray-500 mt-2 text-sm sm:text-base px-2">
                                            Please try again or check your location settings.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : hospitals.length > 0 ? (
                            <>
                                <div className="flex items-center mb-4 sm:mb-6">
                                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Results</h2>
                                    <div className="ml-4 h-1 bg-blue-100 flex-grow rounded-full"></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {hospitals.map((hospital, index) => (
                                        <Card 
                                            key={hospital.id} 
                                            className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white overflow-hidden"
                                            style={{ 
                                                transitionDelay: `${100 + index * 50}ms` 
                                            }}
                                        >
                                            <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                                            <CardHeader className="px-4 sm:px-6">
                                                <CardTitle className="text-lg sm:text-xl text-blue-600 leading-tight">
                                                    {hospital.name || "Unknown Hospital"}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-2 text-sm">
                                                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                                                    <span className="break-all">
                                                        {hospital.postcode || "Postcode not available"}
                                                    </span>
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                                                <div className="p-3 bg-blue-50 rounded-xl">
                                                    <div className="text-sm">
                                                        <strong className="text-blue-600">Address:</strong>
                                                        <p className="text-gray-700 mt-1 break-words leading-relaxed">
                                                            {hospital.address || "Address not available"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm sm:text-base"
                                                    asChild
                                                >
                                                    <a
                                                        href={hospital.googleMapsLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-2"
                                                    >
                                                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        <span className="hidden sm:inline">View on Google Maps</span>
                                                        <span className="sm:hidden">View on Maps</span>
                                                    </a>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <Card className="text-center border-0 shadow-md bg-white">
                                <CardContent className="p-6 sm:p-8">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="h-12 w-12 sm:h-16 sm:w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                            <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                                        </div>
                                        <p className="text-gray-700 text-base sm:text-lg font-medium px-2">
                                            {isLoading ? "Finding nearby hospitals..." : "No hospitals found nearby."}
                                        </p>
                                        <p className="text-gray-500 mt-2 text-sm sm:text-base px-2 leading-relaxed">
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