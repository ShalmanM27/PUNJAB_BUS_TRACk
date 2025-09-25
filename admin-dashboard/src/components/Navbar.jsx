import React, { useLayoutEffect, useRef, useState } from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import NotificationLayout from "./Loader";

export default function Navbar() {
  const titleRef = useRef(null);
  const [slideIn, setSlideIn] = useState(false);
  const [offsets, setOffsets] = useState({ startX: "0px", centerX: "0px" });

  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const startX = `${-rect.left}px`;
    const centerX = `${Math.round((window.innerWidth - rect.width) / 2 - rect.left)}px`;
    setOffsets({ startX, centerX });

    requestAnimationFrame(() => setSlideIn(true));
  }, []);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(12px) saturate(180%)",
        WebkitBackdropFilter: "blur(12px) saturate(180%)",
        borderBottom: "1.5px solid rgba(67,206,162,0.13)",
        boxShadow: "0 8px 32px 0 rgba(31,38,135,0.10)",
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 64, sm: 72 },
          px: { xs: 2, sm: 3 },
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          position: "relative",
          marginLeft: { xs: 0, md: "260px" },
        }}
      >
        <NotificationLayout navbarHeight={72} />

        <Typography
          ref={titleRef}
          variant="h6"
          sx={{
            fontWeight: 800,
            color: "#1976d2",
            fontSize: { xs: 16, sm: 22 },
            whiteSpace: "nowrap",
            position: "relative",
            willChange: "transform",
            transform: "translateX(0)",
            "--start-x": offsets.startX,
            "--center-x": offsets.centerX,
            animation: slideIn
              ? "slideToCenter 2.4s linear forwards"
              : "none",
            "@keyframes slideToCenter": {
              "0%": { transform: "translateX(var(--start-x))" },
              "50%": { transform: "translateX(var(--center-x))" },
              "100%": { transform: "translateX(0)" },
            },
          }}
        >
          Punjab Bus Tracking – Admin Dashboard
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
