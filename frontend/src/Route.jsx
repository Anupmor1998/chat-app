import React from "react";
import { Route, Routes } from "react-router-dom";
import Chats from "./views/Chats";
import Home from "./views/Home";

const CustomRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chats" element={<Chats />} />
    </Routes>
  );
};

export default CustomRoutes;
