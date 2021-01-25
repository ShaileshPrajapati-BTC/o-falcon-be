import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { USER_TYPES, RIDER_ROUTE, FRANCHISEE_VISIBLE, CLIENT_VISIBLE } from '../../constants/Common';

class UserId extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 0
        }
    }
    handeluser = (userid) => {
        if ((FRANCHISEE_VISIBLE && this.props.auth.authUser.type === USER_TYPES.FRANCHISEE) || (CLIENT_VISIBLE && this.props.auth.authUser.type === USER_TYPES.DEALER)) {
            return;
        }
        this.setState({ id: userid })
    }
    render() {
        const { userId, name, currentPage, filter } = this.props;
        if (this.state.id !== 0) {
            return <Redirect
                to={{
                    pathname: `/e-scooter/${RIDER_ROUTE}/view/${this.state.id}`,
                    redirectPath: currentPage ? currentPage : '',
                    filter: filter ? filter : ''
                }} />;
        }
        return (
            <div className={(this.props.auth.authUser.type === USER_TYPES.FRANCHISEE && FRANCHISEE_VISIBLE) || (CLIENT_VISIBLE && this.props.auth.authUser.type === USER_TYPES.DEALER) ? " " : "gx-pointer"} >
                <h3 style={{ textTransform: 'capitalize' }} onClick={() => this.handeluser(userId)}>
                    <b>{userId ? `${name} ` : ''}</b>
                </h3>
            </div >
        );
    }
}
const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(UserId);