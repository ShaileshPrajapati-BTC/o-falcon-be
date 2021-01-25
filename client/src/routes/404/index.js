/**
 * Created by BHARGAV on 14/6/19 9:49 AM.
 */

import IntlMessages from 'util/IntlMessages';
import { Link } from 'react-router-dom';
import React from 'react';

const Error404 = () => 
    <div className="gx-page-error-container">
        <div className="gx-page-error-content">
            <div className="gx-error-code gx-mb-4">404</div>
            <h2 className="gx-text-center">
                <IntlMessages id="extraPages.404Msg" />
            </h2>

            <p className="gx-text-center">
                <Link className="gx-btn gx-btn-primary" to="/e-scooter/dashboard">
                    <IntlMessages id="extraPages.goHome" /></Link>
            </p>
        </div>
    </div>
;

export default Error404;
