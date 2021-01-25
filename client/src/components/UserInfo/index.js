import React, { Component } from "react";
import { connect } from "react-redux";
import { Avatar, Col, Popover, Row } from "antd";
import { userSignOut } from "appRedux/actions/Auth";
import UtilService from "../../services/util";
import {Link } from "react-router-dom";

class UserInfo extends Component {
    render() {
        const userMenuOptions = (
            <ul className="gx-user-popover">
                <li>
                    <Link to="/e-scooter/profile">My Account</Link>
                </li>
                <li onClick={() => this.props.userSignOut()}>Logout</li>
            </ul>
        );
        return (
            <span>
                <Popover
                    overlayClassName="gx-popover-horizantal"
                    placement="bottomRight"
                    content={userMenuOptions}
                    trigger="click"
                >
                    <Row>
                        {this.props.authUser && (
                            <Col className="gx-align-self-center h5" span={16}>
                                {UtilService.getPrimaryValue(
                                    this.props.authUser.emails,
                                    "email"
                                )}
                            </Col>
                        )}

                        <Col span={8}>
                            {this.props.authUser && (
                                <Avatar
                                    src={
                                        this.props.authUser &&
                                        this.props.authUser.image
                                            ? this.props.authUser.image
                                            : ""
                                    }
                                    className="gx-avatar gx-pointer"
                                    alt={this.props.authUser.name}
                                >
                                    {this.props.authUser.name
                                        ? this.props.authUser.name.charAt(0)
                                        : ""}
                                </Avatar>
                            )}
                        </Col>
                    </Row>
                </Popover>
            </span>
        );
    }
}

const mapStateToProps = ({ auth }) => {
    const { authUser } = auth;
    return { authUser };
};

export default connect(
    mapStateToProps,
    { userSignOut }
)(UserInfo);
