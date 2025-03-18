import React, { Fragment, useState } from "react";

const Footer = ({ handleManage }) => {
    return (<Fragment> <div id="footer-bar" className="footer-bar footer-bar-detached">
        <a href="#" onClick={() => handleManage('page', 'search')}>
            <svg className="mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.25" stroke="currentColor" width={20} height={20}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>

            <span>Search</span>
        </a>
        <a href="#" onClick={() => handleManage('page', 'main')} >
            <svg className="mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor" width={20} height={20}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span>Home</span>
        </a>
        <a href="#" onClick={() => handleManage('page', 'help')}>
            <svg className="mb-1" width={20} height={20} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"  fill="none" strokeWidth="2.25" stroke="currentColor">
                <path d="M12 4C9.243 4 7 6.243 7 9h2c0-1.654 1.346-3 3-3s3 1.346 3 3c0 1.069-.454 1.465-1.481 2.255-.382.294-.813.626-1.226 1.038C10.981 13.604 10.995 14.897 11 15v2h2v-2.009c0-.024.023-.601.707-1.284.32-.32.682-.598 1.031-.867C15.798 12.024 17 11.1 17 9c0-2.757-2.243-5-5-5zm-1 14h2v2h-2z" /></svg>
            <span>Help</span>
        </a>
    </div></Fragment>);
}

export default Footer;