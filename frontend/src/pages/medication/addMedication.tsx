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
import { ArrowLeft, Plus, X } from "lucide-react";

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
        <div className={`container mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-lg bg-white overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-xl sm:text-2xl text-blue-600">Add New Medication</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Enter the details of your medication to start tracking it.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 text-sm sm:text-base">Medication Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter medication name"
                      value={formData.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 sm:h-10 text-base sm:text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-gray-700 text-sm sm:text-base">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                      required
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 sm:h-10 text-base sm:text-sm">
                        <SelectValue placeholder="Select medication type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pills">Pills</SelectItem>
                        <SelectItem value="syrup">Syrup</SelectItem>
                        <SelectItem value="injection">Injection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dosage" className="text-gray-700 text-sm sm:text-base">Dosage</Label>
                      <Input
                        id="dosage"
                        placeholder="Enter dosage (e.g., 10mg)"
                        value={formData.dosage}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, dosage: e.target.value })
                        }
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 sm:h-10 text-base sm:text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="frequency" className="text-gray-700 text-sm sm:text-base">Frequency (times per day)</Label>
                      <Input
                        id="frequency"
                        type="number"
                        min="1"
                        max="24"
                        placeholder="Enter frequency"
                        value={formData.frequency}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = parseInt(e.target.value) || 0;
                          setFormData({
                            ...formData,
                            frequency: e.target.value,
                            intakeTimes: Array(value).fill('')
                          });
                        }}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 sm:h-10 text-base sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-gray-700 text-sm sm:text-base">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, startDate: e.target.value })
                        }
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 sm:h-10 text-base sm:text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="text-gray-700 text-sm sm:text-base">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, endDate: e.target.value })
                        }
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 sm:h-10 text-base sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-gray-700 text-sm sm:text-base">Intake Times</Label>
                    <div className="space-y-3">
                      {formData.intakeTimes.map((time, index) => (
                        <div key={index} className="flex gap-2 sm:gap-3">
                          <div className="flex-1">
                            <Input
                              type="time"
                              value={time}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleIntakeTimeChange(index, e.target.value)
                              }
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 sm:h-10 text-base sm:text-sm"
                              required
                            />
                          </div>
                          {formData.intakeTimes.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => removeIntakeTime(index)}
                              className="rounded-full h-11 w-11 sm:h-10 sm:w-10 flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addIntakeTime}
                      className="w-full sm:w-auto flex items-center gap-2 h-10 sm:h-9"
                    >
                      <Plus className="h-4 w-4" />
                      Add Time
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions" className="text-gray-700 text-sm sm:text-base">Instructions</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Enter any special instructions"
                      value={formData.instructions}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData({ ...formData, instructions: e.target.value })
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px] text-base sm:text-sm"
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center space-x-3 py-2">
                    <Switch
                      id="notifications"
                      checked={formData.notifications}
                      onCheckedChange={(checked: boolean) =>
                        setFormData({ ...formData, notifications: checked })
                      }
                      className="data-[state=checked]:bg-blue-500"
                    />
                    <Label htmlFor="notifications" className="text-gray-700 text-sm sm:text-base cursor-pointer">
                      Enable notifications
                    </Label>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 bg-gray-50 px-4 sm:px-6 py-4">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto h-11 sm:h-10 order-2 sm:order-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto h-11 sm:h-10 order-1 sm:order-2"
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