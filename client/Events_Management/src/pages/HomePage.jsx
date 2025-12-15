import React from 'react'
import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
import HomePageCss from './HomePage.module.css';

function HomePage() {
  return (
    <>
    <div className={HomePageCss.container}>
      <div>
        <h1>Welcome to the Event Management System</h1>
        <p>Your one-stop solution for managing and attending events seamlessly.</p>
        <button>Get Started</button>
      </div>
      </div>
    </>
  )
}

export default HomePage