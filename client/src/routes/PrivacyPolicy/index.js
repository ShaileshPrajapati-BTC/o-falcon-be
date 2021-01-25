import React, { Component } from 'react';
import { USER_TYPES, STATIC_PAGE } from '../../constants/Common';
import axios from 'util/Api';
import { Affix, Row } from 'antd';
import { connect } from 'react-redux';
const _ = require('lodash');

class PrivacyPolicy extends Component {
    constructor(props) {
        super(props);
        const pageCode = props.match.params.pageCode;
        this.state = {
            record: '',
            filter: {
                filter: {
                    code: STATIC_PAGE[pageCode],
                    // userType: USER_TYPES.FRANCHISEE
                }
            }
        };
    }
    componentDidMount() {
        // if (this.props.auth.authUser.type === USER_TYPES.DEALER) {
        //     this.setState((state) => {
        //         state.filter.filter.userType = USER_TYPES.DEALER;
        //     })
        // }
        this.fetch();
    }
    fetch = async () => {
        try {
            let response = await axios.post(`admin/static-page/get-page`, this.state.filter);
            if (response.code === 'OK' && response.data.length > 0) {
                this.setState({
                    record: response.data[0].description
                });
                this.refs.test.innerHTML = response.data[0].description;
            } else {
                console.log(' ELSE ERROR ');
            }
        } catch (error) {
            console.log('Error****:', error.message);
        }
    }

    render() {
        let url = this.props.match.params.pageCode.split("-");
        let heading = [];
        url.forEach(ch => {
            heading.push(ch.charAt(0).toUpperCase() + ch.slice(1).toLowerCase());
        });
        heading = heading.join(" ");
        return (<div className="gx-module-box gx-module-box-100">
            <Affix offsetTop={1}>
                <div className="gx-module-box-header">
                    <Row type="flex" align="middle" justify="space-between">
                        <h1 className="pageHeading">{heading}</h1>
                    </Row>
                </div>
            </Affix>
            <div className="gx-module-box-content container">
                <div className="gx-m-3 static-pages" ref='test'></div>
            </div>
        </div>);
    }
}

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(PrivacyPolicy);
