import { useState } from "react";
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

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("jwt");
      await axios.post(
        "http://localhost:8000/addMedication",
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
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Add New Medication</CardTitle>
            <CardDescription>
              Enter the details of your medication to start tracking it.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Medication Name</Label>
                <Input
                  id="name"
                  placeholder="Enter medication name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select medication type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pill">Pill</SelectItem>
                    <SelectItem value="syrup">Syrup</SelectItem>
                    <SelectItem value="injection">Injection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  placeholder="Enter dosage (e.g., 10mg)"
                  value={formData.dosage}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, dosage: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency (times per day)</Label>
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
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Intake Times</Label>
                {formData.intakeTimes.map((time, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="time"
                      value={time}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleIntakeTimeChange(index, e.target.value)
                      }
                      required
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeIntakeTime(index)}
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
                >
                  Add Time
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Enter any special instructions"
                  value={formData.instructions}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, instructions: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="notifications"
                  checked={formData.notifications}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, notifications: checked })
                  }
                />
                <Label htmlFor="notifications">Enable notifications</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => navigate("/dashboard")}>
                Cancel
              </Button>
              <Button type="submit">Add Medication</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
