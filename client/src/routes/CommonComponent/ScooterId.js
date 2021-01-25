import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import IntlMessages from '../../util/IntlMessages';

class ScooterId extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 0
        }
    }
    render() {
        const { data } = this.props;
        if (this.state.id !== 0) {
            return <Redirect to={"/e-scooter/vehicle-details/" + this.state.id} />;
        }
        return (
            <div className="scooterID gx-pointer">
                <div className="lbl"><IntlMessages id="app.scooterId" /></div>
                <div className="ids">
                    <Link to={`/e-scooter/vehicle-details/${data.vehicleId.id}`}>
                        <span style={{ color: '#292e47' }}>
                            {data.vehicleId && data.vehicleId.registerId ? `#${data.vehicleId.registerId}` : ''}
                        </span>
                    </Link>
                </div>
            </div>
        );
    }
}

export default ScooterId;