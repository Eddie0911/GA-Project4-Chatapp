import React from "react";
import { Outlet } from "react-router-dom";

export default function Shop() {
    return (
        <div>
            <p>Should return Friend page, will be updated soon</p>
            <Outlet />
        </div>
    );
  }