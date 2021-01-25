import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
    FEEDER_ROUTE
} from "../../constants/Common";
class FeederId extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 0
        }
    }
    render() {
        const { userId, name, currentPage, filter } = this.props;
        if (this.state.id !== 0) {
            return <Redirect
                to={{
                    pathname: `/e-scooter/${FEEDER_ROUTE}/view/${this.state.id}`,
                    redirectPath: currentPage ? currentPage : '',
                    filter: filter ? filter : ''
                }} />;
        }
        return (
            <div className="gx-pointer">
                <h3 style={{ textTransform: 'capitalize', cursor: 'pointer' }} onClick={() => this.setState({ id: userId })}>
                    <b>{userId ? `${name} ` : ''}</b>
                </h3>
            </div >
        );
    }
}
export default FeederId;