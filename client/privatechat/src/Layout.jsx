import Nav from "./nav";
import { Outlet } from "react-router-dom";

export default function Layout() {
    return (
        <>
            <Nav />
            <Outlet />
        </>
    );
};
// This component serves as a layout wrapper for the application.
// It includes the navigation bar and renders the child routes using <Outlet />.        