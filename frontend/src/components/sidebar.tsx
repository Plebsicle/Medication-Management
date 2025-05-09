import { useState} from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { SpeedDialIcon } from "@mui/material";
import { Link } from "react-router-dom";
import {toast,Bounce} from 'react-toastify'
import { FaAccessibleIcon } from "react-icons/fa";

export default function SidebarComponent() {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed((prevState) => !prevState);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
      }}
    >
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        style={{
          position: "fixed",
          left: 0,
          top: 48,
          height: "100vh",
          zIndex: 1000,
          backgroundColor:  "#FFFFFF", // Sidebar background
          color: "#000000", // Sidebar text color
        }}
      >
        <Menu>
          <MenuItem
            className="menu1"
            icon={<MenuRoundedIcon />}
            onClick={toggleSidebar}
            style={{
              backgroundColor: "#e2e8f0", // Menu background
              color:  "#000", // Menu text color
            }}
          >
            <h2>Manage Medicine</h2>
          </MenuItem>
          <MenuItem
            icon={<GridViewRoundedIcon />}
            component={<Link to={"/dashboard"}/>}
            style={{ backgroundColor:"#e2e8f0",color: "#000" }} // Menu item text color
          >
            Dashboard
          </MenuItem>
          <MenuItem
            icon={<SpeedDialIcon />}
            component={<Link to={"/medicationHistory"} />}
            style={{ backgroundColor: "#e2e8f0",color: "#000" }} // Menu item text color
          >
            Medication History
          </MenuItem>
          <MenuItem
            icon={<FaAccessibleIcon />}
            component={<Link to={"/hospital-location"} />}
            style={{ backgroundColor:  "#e2e8f0",color: "#000" }} // Menu item text color
          >
            Find Nearby Hospitals
          </MenuItem>
          <MenuItem
            icon={<ReceiptRoundedIcon />}
            component={<Link to={"/health-records"} />}
            style={{ backgroundColor:  "#e2e8f0",color:  "#000" }} // Menu item text color
          >
            Health Records
          </MenuItem>
          <MenuItem
            icon={<LogoutRoundedIcon />}
            component={<Link to={"/signin"} />}
            onClick={() => {
              localStorage.clear();
              toast.success('Logged Out Successfully!', {position: "top-center",autoClose: 5000,theme: "dark",transition: Bounce,
              });
            }}
            style={{ backgroundColor: "#e2e8f0",color:  "#000" }} // Menu item text color
          >
            Logout
          </MenuItem>
        </Menu>
      </Sidebar>

      {/* Content Area */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          marginLeft: collapsed ? "80px" : "240px",
          transition: "margin-left 0.3s ease-in-out",
        }}
      >
        {/* Content goes here */}
      </div>
    </div>
  );
}
