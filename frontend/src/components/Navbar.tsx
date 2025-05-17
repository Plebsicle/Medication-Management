import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DashboardTopBar: React.FC = () => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const toggleMenu = () => {
        setMenuVisible((prev) => !prev);
    };

    const handleSearch = async () => {
        console.log("Search Query:", searchQuery);
        try{
            const response = await axios.post('http://localhost:8000/searchHandle',{
                searchQuery
            })
            if(response.data.details){

            }
            else{
                
            }
        }
        catch{

        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div className="flex justify-between items-center px-4 h-12 bg-blue-500 text-white fixed top-0 left-0 w-full z-20">
            {/* Left section */}
            <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold">Medication Management</h1>
            </div>

            {/* Middle section (Search bar) */}
            <div className="flex items-center w-full max-w-md mx-auto">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search..."
                    className="w-full px-3 py-2 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button
                    onClick={handleSearch}
                    className="ml-2 px-3 py-2 bg-white text-blue-500 rounded-md hover:bg-blue-100"
                >
                    Search
                </button>
            </div>

            {/* Right section */}
            <div className="relative flex items-center pr-10">
                <div className="cursor-pointer" onClick={toggleMenu}>
                    <FaUserCircle size={28} />
                </div>
                {menuVisible && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <button
                            className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => navigate('/profile')}
                        >
                            Update Profile
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardTopBar;
