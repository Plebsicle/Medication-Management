import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { ArrowRight, Calendar, Activity, Weight, Thermometer, FileText } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export default function HealthRecordsForm() {
    const [formData, setFormData] = useState({
        record_date: '',
        blood_pressure: '',
        heart_rate: '',
        weight: '',
        temperature: '',
        notes: ''
    });
    const [isVisible, setIsVisible] = useState(false);

    const navigate = useNavigate();

    // Set visibility after component mounts
    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleChange = (e : any) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e : any) => {
        e.preventDefault();
        try {
            const jwt = localStorage.getItem('jwt');
            if (!jwt) {
                toast.error("Authentication Required", {
                    description: "Please sign in to continue"
                });
                navigate('/signin');
                return;
            }

            const response = await axios.post(`${BACKEND_URL}/healthRecords`, formData, {
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            });
            if (response.data.message === "Health record added successfully.") {
                toast.success("Success", {
                    description: "Health records added successfully!"
                });
                navigate('/health-records');
            }
        } catch (error) {
            console.error('Error submitting health records:', error);
            toast.error("Error", {
                description: "Failed to submit health records"
            });
        }
    };

    return (
        <AppLayout>
            <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-12">
                <div className={`container mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    {/* Header Section - Mobile Responsive */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center flex-grow gap-4">
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 whitespace-nowrap">Health Records Form</h2>
                            <div className="hidden sm:block ml-4 h-1 bg-blue-100 flex-grow rounded-full"></div>
                        </div>
                    </div>

                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden max-w-4xl mx-auto">
                        <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                        <CardHeader className="px-4 sm:px-6">
                            <CardTitle className="text-xl sm:text-2xl text-blue-600">Health Records</CardTitle>
                            <CardDescription className="text-sm sm:text-base">Please fill in your health information accurately</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                                {/* Grid Layout - Responsive */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                            <Label htmlFor="record_date" className="text-sm sm:text-base">Record Date</Label>
                                        </div>
                                        <Input
                                            id="record_date"
                                            name="record_date"
                                            type="date"
                                            value={formData.record_date}
                                            onChange={handleChange}
                                            required
                                            className="border-blue-200 focus:border-blue-500 h-10 sm:h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                            <Label htmlFor="blood_pressure" className="text-sm sm:text-base">Blood Pressure</Label>
                                        </div>
                                        <Input
                                            id="blood_pressure"
                                            name="blood_pressure"
                                            value={formData.blood_pressure}
                                            onChange={handleChange}
                                            placeholder="e.g., 120/80"
                                            className="border-blue-200 focus:border-blue-500 h-10 sm:h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                            <Label htmlFor="heart_rate" className="text-sm sm:text-base">Heart Rate (bpm)</Label>
                                        </div>
                                        <Input
                                            id="heart_rate"
                                            name="heart_rate"
                                            type="number"
                                            value={formData.heart_rate}
                                            onChange={handleChange}
                                            placeholder="Enter heart rate"
                                            className="border-blue-200 focus:border-blue-500 h-10 sm:h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Weight className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                            <Label htmlFor="weight" className="text-sm sm:text-base">Weight (kg)</Label>
                                        </div>
                                        <Input
                                            id="weight"
                                            name="weight"
                                            type="number"
                                            step="0.01"
                                            value={formData.weight}
                                            onChange={handleChange}
                                            placeholder="Enter weight"
                                            className="border-blue-200 focus:border-blue-500 h-10 sm:h-11"
                                        />
                                    </div>

                                    <div className="space-y-2 sm:col-span-2 sm:max-w-md">
                                        <div className="flex items-center gap-2">
                                            <Thermometer className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                            <Label htmlFor="temperature" className="text-sm sm:text-base">Body Temperature (°C)</Label>
                                        </div>
                                        <Input
                                            id="temperature"
                                            name="temperature"
                                            type="number"
                                            step="0.1"
                                            value={formData.temperature}
                                            onChange={handleChange}
                                            placeholder="Enter temperature"
                                            className="border-blue-200 focus:border-blue-500 h-10 sm:h-11"
                                        />
                                    </div>
                                </div>

                                {/* Notes Section - Full Width */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                        <Label htmlFor="notes" className="text-sm sm:text-base">Notes</Label>
                                    </div>
                                    <Textarea
                                        id="notes"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Enter any additional notes or observations"
                                        className="h-24 sm:h-32 border-blue-200 focus:border-blue-500 resize-none"
                                    />
                                </div>
                            </CardContent>
                            
                            {/* Footer - Mobile Responsive */}
                            <CardFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between bg-gray-50 px-4 sm:px-6 py-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/health-records')}
                                    className="w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-50 h-10 sm:h-11"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit"
                                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 h-10 sm:h-11"
                                >
                                    Submit Record
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </main>
        </AppLayout>
    );
}