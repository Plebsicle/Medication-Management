import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Pill, FileText, Bell } from "lucide-react";

// Import shadcn components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Pill className="h-10 w-10 text-blue-500" />,
      title: "Medication Management",
      description: "Track prescriptions and get timely reminders for your medications"
    },
    {
      icon: <FileText className="h-10 w-10 text-blue-500" />,
      title: "Medical Records",
      description: "Store and access your health records securely in one place"
    },
    {
      icon: <Bell className="h-10 w-10 text-blue-500" />,
      title: "Smart Reminders",
      description: "Never miss important appointments or medication doses"
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className={`relative pt-20 pb-16 px-4 md:px-6 lg:px-8 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 space-y-6">
              <div 
                className="inline-block bg-blue-100 text-blue-700 rounded-full px-4 py-1 text-sm font-medium mb-2"
              >
                Healthcare Simplified
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Your Health Journey, <span className="text-blue-600">Simplified</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-xl">
                MediTrack helps you manage medications, store medical records, and communicate with healthcare providers—all in one secure platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg font-medium"
                  onClick={() => navigate("/signin")}
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-white hover:bg-gray-50 text-blue-600 border-blue-300 rounded-xl shadow-sm"
                  onClick={() => navigate("/signup")}
                >
                  Create Account
                </Button>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <div className="flex -space-x-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white" />
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 mt-12 lg:mt-0 flex justify-center">
              <div className="relative w-full max-w-lg aspect-square bg-blue-100/50 rounded-full flex items-center justify-center shadow-xl">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 opacity-50" />
                <div className="relative h-40 w-40 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-7xl font-bold">M</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose MediTrack?</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Our comprehensive platform is designed to make healthcare management 
              easy, accessible, and secure.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Start your health journey today
          </h2>
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-6 shadow-lg text-lg"
            onClick={() => navigate("/signup")}
          >
            Sign Up For Free
          </Button>
        </div>
      </section>
    </main>
  );
}
