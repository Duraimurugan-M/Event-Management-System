import React from 'react'
import { Link } from 'react-router-dom';
import FooterCss from './Footer.module.css';

function Footer() {
  return (
    <>
    <div className={FooterCss['footer-out-div']}>
    <h3>Events Management Portal &copy; 2025</h3>
    </div>
    </>
  )
}

export default Footer