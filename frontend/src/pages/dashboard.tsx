import DashboardTopBar from "../components/dashboardNavbar";
import Sidebar from "../components/sidebar";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Dashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        const jwt = localStorage.getItem("jwt");
        if (!(jwt)) {
            navigate('/signin');
        }
        else{
           
        }
    }, [navigate]);

    return (
        <div>
            <Sidebar/>
            <DashboardTopBar />
        </div>
    );
}
