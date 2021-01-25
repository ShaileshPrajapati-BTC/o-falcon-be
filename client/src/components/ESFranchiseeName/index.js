import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { USER_TYPES, FRANCHISEE_ROUTE } from '../../constants/Common';

class FranchiseeName extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 0
        }
    }
    render() {
        const { userId, name, tag } = this.props;
        if (this.state.id !== 0) {
            return <Redirect to={`/e-scooter/${FRANCHISEE_ROUTE}/view/` + this.state.id} />;
        }
        return (
            <>
                {this.props.auth.authUser.type !== USER_TYPES.FRANCHISEE && this.props.auth.authUser.type !== USER_TYPES.DEALER ?
                    tag ?
                        <div className="moneySender" style={{ margin: '0px' }} >
                            <div className="moneyLabel">
                                {tag}:
                            </div>
                            <div className="moneySenderName gx-pointer" onClick={() => this.setState({ id: userId })}>
                                {userId ? ` ${name} ` : ''}
                            </div>
                        </div>
                        :
                        <div className="gx-pointer">
                            <div style={{ textTransform: 'capitalize', cursor: 'pointer', float: 'left' }} onClick={() => this.setState({ id: userId })}>
                                <b> &nbsp;({userId ? ` ${name} ` : ''})</b>
                            </div>
                        </div >
                    : ''}
            </>
        );
    }
}
const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(FranchiseeName);