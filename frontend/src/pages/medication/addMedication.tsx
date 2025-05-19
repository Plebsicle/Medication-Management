import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArrowLeft } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

interface MedicationForm {
  name: string;
  type: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  intakeTimes: string[];
  instructions: string;
  notifications: boolean;
}

export default function AddMedication() {
  const [formData, setFormData] = useState<MedicationForm>({
    name: "",
    type: "",
    dosage: "",
    frequency: "",
    startDate: "",
    endDate: "",
    intakeTimes: [""],
    instructions: "",
    notifications: true,
  });
  const [isVisible, setIsVisible] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("jwt");
      await axios.post(
        `${BACKEND_URL}/addMedication`,
        { formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Medication added successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add medication");
    }
  };

  const handleIntakeTimeChange = (index: number, value: string) => {
    const newIntakeTimes = [...formData.intakeTimes];
    newIntakeTimes[index] = value;
    setFormData({ ...formData, intakeTimes: newIntakeTimes });
  };

  const addIntakeTime = () => {
    setFormData({
      ...formData,
      intakeTimes: [...formData.intakeTimes, ""],
    });
  };

  const removeIntakeTime = (index: number) => {
    const newIntakeTimes = formData.intakeTimes.filter((_, i) => i !== index);
    setFormData({ ...formData, intakeTimes: newIntakeTimes });
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-12">

        {/* Form Section */}
        <div className={`container mx-auto px-4 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-lg bg-white overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <CardHeader>
                <CardTitle className="text-2xl text-blue-600">Add New Medication</CardTitle>
                <CardDescription>
                  Enter the details of your medication to start tracking it.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">Medication Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter medication name"
                      value={formData.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-gray-700">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                      required
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select medication type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pills">Pills</SelectItem>
                        <SelectItem value="syrup">Syrup</SelectItem>
                        <SelectItem value="injection">Injection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dosage" className="text-gray-700">Dosage</Label>
                    <Input
                      id="dosage"
                      placeholder="Enter dosage (e.g., 10mg)"
                      value={formData.dosage}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, dosage: e.target.value })
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency" className="text-gray-700">Frequency (times per day)</Label>
                    <Input
                      id="frequency"
                      type="number"
                      min="1"
                      max="24"
                      placeholder="Enter number of times per day"
                      value={formData.frequency}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = parseInt(e.target.value) || 0;
                        setFormData({
                          ...formData,
                          frequency: e.target.value,
                          intakeTimes: Array(value).fill('')
                        });
                      }}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-gray-700">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-gray-700">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700">Intake Times</Label>
                    {formData.intakeTimes.map((time, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="time"
                          value={time}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleIntakeTimeChange(index, e.target.value)
                          }
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeIntakeTime(index)}
                            className="rounded-full"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addIntakeTime}
                      className="mt-2"
                    >
                      Add Time
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions" className="text-gray-700">Instructions</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Enter any special instructions"
                      value={formData.instructions}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData({ ...formData, instructions: e.target.value })
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notifications"
                      checked={formData.notifications}
                      onCheckedChange={(checked: boolean) =>
                        setFormData({ ...formData, notifications: checked })
                      }
                      className="data-[state=checked]:bg-blue-500"
                    />
                    <Label htmlFor="notifications" className="text-gray-700">Enable notifications</Label>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between bg-gray-50 px-6 py-4">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add Medication
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}