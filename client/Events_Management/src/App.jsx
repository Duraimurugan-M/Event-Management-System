import React, { useEffect } from 'react'
import axios from 'axios'
import './setupAxios'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Signin from './pages/Signin.jsx'
import Signup from './pages/Signup.jsx'
import HomePage from './pages/HomePage.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import EventsPage from './pages/EventsPage.jsx'
import CreateEvent from './pages/CreateEvent.jsx'
import RegistrationEvent from './pages/RegistrationEvent.jsx'
import MyRegistrations from './pages/MyRegistrations.jsx'

function App() {
  useEffect(() => {
    // Set axios default Authorization header from localStorage and attach interceptor
    const token = (() => { try { return localStorage.getItem('token') } catch { return null } })();
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const id = axios.interceptors.request.use((config) => {
      const t = localStorage.getItem('token');
      if (t) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${t}`;
      }
      return config;
    }, (error) => Promise.reject(error));

    return () => { axios.interceptors.request.eject(id); };
  }, []);
  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<RegistrationEvent />} />
          <Route path="/my-registrations" element={<MyRegistrations />} />
          <Route path="/create-event" element={<CreateEvent />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  )
}

export default App