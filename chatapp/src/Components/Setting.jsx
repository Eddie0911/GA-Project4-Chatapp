import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import axios from "axios";

export default function Setting() {
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    axios
      .post("/updateUser", { newUsername, newPassword })
      .then((response) => {
        setSuccessMessage("Username and password updated successfully.");
        setErrorMessage("");
      })
      .catch((error) => {
        setErrorMessage("Error updating username and password.");
        setSuccessMessage("");
      });
  };

  return (
    <div className="flex">
      <div className="w-1/6">
        <Navbar />
      </div>
      <div className="w-5/6">
        <p>Setting page, will be updated soon</p>
        <form onSubmit={handleSubmit}>
          <label>
            New Username:
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
          </label>
          <br />
          <label>
            New Password:
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </label>
          <br />
          <button type="submit">Update</button>
        </form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
      </div>
      <Outlet />
    </div>
  );
}
