import React from "react";
import { Link } from "react-router-dom";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

const Sidebar = () => {
  const menuItems = [
    { text: "Dashboard", path: "/" },
    { text: "Drivers", path: "/drivers" },
    { text: "Conductors", path: "/conductors" },
    { text: "Passengers", path: "/passengers" },
    { text: "Vehicles", path: "/vehicles" },
    { text: "Devices", path: "/devices" },
    { text: "Sessions", path: "/sessions" },
  ];

  return (
    <div style={{ width: "250px" }}>
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            button
            component={Link}
            to={item.path}
          >
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default Sidebar;
