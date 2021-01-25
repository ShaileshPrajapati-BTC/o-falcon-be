import React, { Component } from "react";
import { connect } from "react-redux";
import UtilService from '../../services/util';


class FooterInfo extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { authUser } = this.props;
        return (
            <div className="gx-layout-footer-content">
            </div>
        )
    }
}

const mapStateToProps = ({ auth }) => {
    const { authUser } = auth;
    return { authUser }
};
export default connect(mapStateToProps)(FooterInfo);
