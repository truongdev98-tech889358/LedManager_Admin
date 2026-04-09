import OuterLayout from "@/layout/OuterLayout";
import Home from "@/container/Outer/views/Home";
import { Route, Routes } from "react-router-dom";

const PublicRoute = () => {
  return (
    <Routes>
      <Route element={<OuterLayout />}>
        <Route path="" element={<Home />} />
        <Route path="home" element={<Home />} />
      </Route>
    </Routes>
  );
};

export default PublicRoute;
