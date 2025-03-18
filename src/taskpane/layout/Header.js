import React, { Fragment, useState } from "react";

const Header = () => {
    return (
    <Fragment><div className="header-bar header-fixed header-app header-bar-detached">        
        {/* <a href="#" className="header-title color-theme font-13">Back to Components</a> */}
        <a data-bs-toggle="offcanvas" data-bs-target="#menu-color" className="ml-2" href="#">Myma.ai</a>
        {/* <a href="#" className="show-on-theme-light" data-toggle-theme>Templates</a>         */}
    </div>
    </Fragment>);
}

export default Header;