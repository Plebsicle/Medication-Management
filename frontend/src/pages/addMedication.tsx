import { useState } from "react";
import { useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { darkModeState } from "../atoms/darkMode";
import { toast, Bounce } from "react-toastify";

export default function AddMedication() {
    const navigate = useNavigate();
    const isDarkMode = useRecoilValue(darkModeState);
    const [formData, setFormData] = useState({
        name: "",
        type: "pills",
        dosage: "",
        start_date: "",
        end_date: "",
        instructions: "",
        frequency: 1,
        intake_times: [""],
        notification_on: true,
    });

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleFrequencyChange = (e: any) => {
        const frequency = parseInt(e.target.value) || 1;
        setFormData({
            ...formData,
            frequency,
            intake_times: Array(frequency).fill(""),
        });
    };

    const handleTimeChange = (index: number, value: string) => {
        const updatedTimes = [...formData.intake_times];
        updatedTimes[index] = value;
        setFormData({ ...formData, intake_times: updatedTimes });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const jwt = localStorage.getItem("jwt");
            if (!jwt) {
                navigate("/signin");
                return toast.error('Sign In Please!', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Bounce,
                });
            }
            const response = await axios.post("http://localhost:8000/addMedication", { formData }, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
            if (response.status === 200) {
                toast.success('Medication Added Succesfully !', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Bounce,
                    });
                navigate("/dashboard");
            }
        } catch (error) {
            console.error("Error adding medication:", error);
            return toast.error('Error Adding Medication !', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
                });
        }
    };

    return (
        <div className={`${isDarkMode ? "dark" : ""} min-h-screen`}>
            <div className="p-8 bg-gray-100 dark:bg-gray-900">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
                    Add Medication
                </h1>
                <form
                    onSubmit={handleSubmit}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg mx-auto"
                >
                    {/* Name */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-200"
                            required
                        />
                    </div>

                    {/* Type */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Type
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-200"
                            required
                        >
                            <option value="pills">Pills</option>
                            <option value="syrup">Syrup</option>
                            <option value="injection">Injection</option>
                        </select>
                    </div>

                    {/* Dosage */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Dosage
                        </label>
                        <input
                            type="text"
                            name="dosage"
                            value={formData.dosage}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-200"
                            required
                        />
                    </div>

                    {/* Start Date */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Start Date</label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>

                    {/* End Date */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">End Date</label>
                        <input
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>

                    {/* Frequency */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Frequency (times per day)</label>
                        <input
                            type="number"
                            name="frequency"
                            value={formData.frequency}
                            onChange={handleFrequencyChange}
                            min={1}
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>

                    {/* Intake Times */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Intake Times</label>
                        {formData.intake_times.map((time, index) => (
                            <input
                                key={index}
                                type="time"
                                value={time}
                                onChange={(e) => handleTimeChange(index, e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
                                required
                            />
                        ))}
                    </div>

                    {/* Instructions */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Instructions</label>
                        <textarea
                            name="instructions"
                            value={formData.instructions}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        ></textarea>
                    </div>

                    {/* Notification On/Off */}
                    <div className="mb-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="notification_on"
                                checked={formData.notification_on}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            Enable Notifications
                        </label>
                    </div>


                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded shadow dark:bg-blue-700 dark:hover:bg-blue-800"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}
