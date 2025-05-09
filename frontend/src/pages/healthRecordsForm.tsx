import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
// import { MainLayout } from '@/components/layout/MainLayout';

export default function HealthRecordsForm() {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        record_date: '',
        blood_pressure: '',
        heart_rate: '',
        weight: '',
        temperature: '',
        notes: ''
    });

    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const jwt = localStorage.getItem('jwt');
            if (!jwt) {
                toast({
                    variant: "destructive",
                    title: "Authentication Required",
                    description: "Please sign in to continue",
                });
                navigate('/signin');
                return;
            }

            const response = await axios.post('http://localhost:8000/healthRecords', formData, {
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            });
            if (response.data.message === "Health record added successfully.") {
                toast({
                    variant: "success",
                    title: "Success",
                    description: "Health records added successfully!",
                });
                navigate('/healthRecords');
            }
        } catch (error) {
            console.error('Error submitting health records:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to submit health records",
            });
        }
    };

    return (
        // <MainLayout>
            <div className="container mx-auto p-6">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Health Records Form</CardTitle>
                        <CardDescription>Please fill in your health information accurately</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="record_date">Record Date</Label>
                                    <Input
                                        id="record_date"
                                        name="record_date"
                                        type="date"
                                        value={formData.record_date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="blood_pressure">Blood Pressure</Label>
                                    <Input
                                        id="blood_pressure"
                                        name="blood_pressure"
                                        value={formData.blood_pressure}
                                        onChange={handleChange}
                                        placeholder="e.g., 120/80"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
                                    <Input
                                        id="heart_rate"
                                        name="heart_rate"
                                        type="number"
                                        value={formData.heart_rate}
                                        onChange={handleChange}
                                        placeholder="Enter heart rate"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="weight">Weight (kg)</Label>
                                    <Input
                                        id="weight"
                                        name="weight"
                                        type="number"
                                        step="0.01"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        placeholder="Enter weight"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="temperature">Body Temperature (°C)</Label>
                                    <Input
                                        id="temperature"
                                        name="temperature"
                                        type="number"
                                        step="0.1"
                                        value={formData.temperature}
                                        onChange={handleChange}
                                        placeholder="Enter temperature"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder="Enter any additional notes or observations"
                                    className="h-32"
                                />
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/healthRecords')}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Submit
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        // </MainLayout>
    );
}
