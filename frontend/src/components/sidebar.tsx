import { useState } from "react";
import { Sidebar, Menu, MenuItem, } from "react-pro-sidebar";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { SpeedDialIcon } from "@mui/material";
import { Link } from "react-router-dom";

export default function SidebarComponent() {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed((prevState) => !prevState);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        style={{ position: "fixed", left: 0, top: 48, height: "100vh", zIndex: 1000 }}
      >
        <Menu>
          <MenuItem className="menu1" icon={<MenuRoundedIcon />} onClick={toggleSidebar}>
            <h2> Manage Medicine</h2>
          </MenuItem>
          <MenuItem icon={<GridViewRoundedIcon />} component={<Link to={'/dashboard'}/>}> Dashboard </MenuItem>
          <MenuItem icon={<SpeedDialIcon/> } component={<Link to={'/medicationHistory'}/>}>Medication History</MenuItem>
          <MenuItem icon={<ReceiptRoundedIcon />}> Health Records </MenuItem>
          <MenuItem icon={<LogoutRoundedIcon />} component={<Link to={'/signin'} />} onClick={() => {localStorage.clear();}}>
            Logout
          </MenuItem>
        </Menu>
      </Sidebar>

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
