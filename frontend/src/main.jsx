import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Buffer } from 'buffer';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Page2 from "./Page2";

window.Buffer = Buffer;


ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>

    {/* <nav className="p-3 bg-gray-100 flex gap-4">
      <Link to="/" className="text-blue-600 hover:underline">Page 1 - Builder</Link>
      <Link to="/page2" className="text-blue-600 hover:underline">Page 2 - Parser</Link>
    </nav> */}

    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/page2" element={<Page2 />} />
    </Routes>
      <nav className="p-3 bg-gray-100 flex gap-4">
      <Link to="/page2" className="text-blue-600 hover:underline">Page 2 - Parser</Link>
    </nav>

  </BrowserRouter>
);
