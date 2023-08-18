import React, { useState, useEffect, useContext } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import axios from "axios";
import {UserContext} from "./UserContext.jsx";

export default function Setting() {
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const {id} = useContext(UserContext);

  const handleSubmit = (event) => {
    event.preventDefault();
    axios
      .put("/updateUser/"+id, { newUsername, newPassword })
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
    <div className="flex ">
      <div className="w-1/6">
        <Navbar />
      </div>
      <div className="w-5/6 bg-blue-50 h-screen flex items-center">
        <form className='w-64 mx-auto mb-12' onSubmit={handleSubmit}>
          <p>Change your username or password here:</p><br />
          <label>
            New Username:
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="block w-full rounded-sm p-2 mb-2 border"
            />
          </label>
          <br />
          <label>
            New Password:
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="block w-full rounded-sm p-2 mb-2 border"
            />
          </label>
          <br />
          <button className='bg-blue-500 text-white block w-full rounded-sm p-2' type="submit">Update</button>
        </form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
      </div>
      <Outlet />
    </div>
  );
}
