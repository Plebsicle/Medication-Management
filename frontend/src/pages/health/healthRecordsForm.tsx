import { useState } from 'react';
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
    useState(() => {
        setIsVisible(true);
    });

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


                <div className={`container mx-auto px-4 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center flex-grow">
                            <h2 className="text-2xl font-semibold text-gray-900">Health Records Form</h2>
                            <div className="ml-4 h-1 bg-blue-100 flex-grow rounded-full"></div>
                        </div>
                    </div>

                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden max-w-3xl mx-auto">
                        <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                        <CardHeader>
                            <CardTitle className="text-2xl text-blue-600">Health Records</CardTitle>
                            <CardDescription>Please fill in your health information accurately</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-500" />
                                            <Label htmlFor="record_date">Record Date</Label>
                                        </div>
                                        <Input
                                            id="record_date"
                                            name="record_date"
                                            type="date"
                                            value={formData.record_date}
                                            onChange={handleChange}
                                            required
                                            className="border-blue-200 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-blue-500" />
                                            <Label htmlFor="blood_pressure">Blood Pressure</Label>
                                        </div>
                                        <Input
                                            id="blood_pressure"
                                            name="blood_pressure"
                                            value={formData.blood_pressure}
                                            onChange={handleChange}
                                            placeholder="e.g., 120/80"
                                            className="border-blue-200 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-blue-500" />
                                            <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
                                        </div>
                                        <Input
                                            id="heart_rate"
                                            name="heart_rate"
                                            type="number"
                                            value={formData.heart_rate}
                                            onChange={handleChange}
                                            placeholder="Enter heart rate"
                                            className="border-blue-200 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Weight className="h-4 w-4 text-blue-500" />
                                            <Label htmlFor="weight">Weight (kg)</Label>
                                        </div>
                                        <Input
                                            id="weight"
                                            name="weight"
                                            type="number"
                                            step="0.01"
                                            value={formData.weight}
                                            onChange={handleChange}
                                            placeholder="Enter weight"
                                            className="border-blue-200 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Thermometer className="h-4 w-4 text-blue-500" />
                                            <Label htmlFor="temperature">Body Temperature (°C)</Label>
                                        </div>
                                        <Input
                                            id="temperature"
                                            name="temperature"
                                            type="number"
                                            step="0.1"
                                            value={formData.temperature}
                                            onChange={handleChange}
                                            placeholder="Enter temperature"
                                            className="border-blue-200 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-500" />
                                        <Label htmlFor="notes">Notes</Label>
                                    </div>
                                    <Textarea
                                        id="notes"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Enter any additional notes or observations"
                                        className="h-32 border-blue-200 focus:border-blue-500"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between bg-gray-50 py-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/health-records')}
                                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2"
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