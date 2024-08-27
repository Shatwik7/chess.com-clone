// App.tsx

import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from './screens/Landing';
import Game from './screens/Game'; // Corrected import
import { Chessboard } from "react-chessboard";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import SideBar from './components/SideBar';
import { useState } from "react";
import darkTheme from "./Themes/darkTheme";
import lightTheme from "./Themes/lightTheme";
import ResultCard from "./components/ResultCard";


function App() {
    const [darkMode,setDarkMode]=useState(true);
    const handleThemeToggle = () => {
        setDarkMode(!darkMode);
      };
      
    return (
        <ThemeProvider theme={darkMode?darkTheme:lightTheme}>
        <SideBar ThemeToggle={handleThemeToggle} ></SideBar>
        <CssBaseline />
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/game" element={<Game />} />
                <Route path="/test" />
            </Routes>
        </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
