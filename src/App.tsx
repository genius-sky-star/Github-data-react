import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Userlist from "./screens/Userlist/Userlist";
import Repoinfo from "./screens/Repoinfo/Repoinfo";

function App() {
  return (
    <>
      <BrowserRouter>      
        <Routes>
            <Route path="/users" element={<Userlist />} />
            <Route path="users/repos/:username" element={<Repoinfo />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
