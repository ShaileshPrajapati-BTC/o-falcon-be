import React, { Component } from 'react';
import { Affix, Row, message, Col, Spin } from 'antd';
import axios from 'util/Api';
import { connect } from 'react-redux';
import { USER_TYPES, PROJECT_NAME } from '../../constants/Common';

const _ = require('lodash');
class PrivacyPolicy extends Component {
    constructor(props) {
        super(props);
        this.state = {
            record: {},
            loading: true,
            loginUser: this.props.auth && this.props.auth.authUser ? this.props.auth.authUser : null,
            filter: { addedBy: null }
        };
    }
    async componentDidMount() {
        if (this.state.loginUser.type === USER_TYPES.DEALER) {
            await this.setState((state) => {
                state.filter.addedBy = this.state.loginUser.franchiseeId;
                state.filter.isInfoPage = true;
            })
        }
        this.fetch();
    }
    fetch = async () => {
        this.setState({ loading: true });
        try {
            let response = await axios.post('/admin/contact-us-setting/get', this.state.filter);
            if (response && response.code === 'OK') {
                this.setState({ record: response.data, loading: false });
            } else {
                message.error(`${response.message}`);
                this.setState({ loading: false });
            }
        } catch (error) {
            message.error(`${error.message}`);
            this.setState({ loading: false });
        }
    }

    render() {
        const { record, loading } = this.state;

        return (<div className="gx-module-box gx-module-box-100">
            <Affix offsetTop={1}>
                <div className="gx-module-box-header">
                    <Row type="flex" align="middle" justify="space-between">
                        <h1 className="pageHeading">Support</h1>
                    </Row>
                </div>
            </Affix>
            <Spin spinning={loading} delay={100}>
                <div className="RidersList RidersListingWithWidth" style={{ paddingLeft: 20, fontSize: 17 }}>
                    {record[0] && record[0].email &&
                        <Row className="gx-mt-3">
                            <Col span={4}><b>Email :</b> </Col>
                            <Col span={20}>{record[0].email}</Col>
                        </Row>
                    }
                    {record[0] && record[0].cell &&
                        <Row className="gx-mt-3">
                            <Col span={4}><b>Mobile :</b> </Col>
                            <Col span={20}>{record[0].cell}</Col>
                        </Row>
                    }
                    {record[0] && record[0].address &&
                        <Row className="gx-mt-3">
                            <Col span={4}><b>Address : </b></Col>
                            <Col span={20}>{record[0].address}</Col>
                        </Row>
                    }
                    <br />
                    <br />
                    {record[1] &&
                        <>
                            <div className="gx-module-box-header" style={{ paddingLeft: 0 }}>
                                <Row type="flex" align="middle" justify="space-between">
                                    <h1 className="pageHeading">{PROJECT_NAME} Support</h1>
                                </Row>
                            </div>
                            {record[1] && record[1].email &&
                                <Row className="gx-mt-3">
                                    <Col span={4}><b>Email :</b> </Col>
                                    <Col span={20}>{record[1].email}</Col>
                                </Row>
                            }
                            {record[1] && record[1].cell &&
                                <Row className="gx-mt-3">
                                    <Col span={4}><b>Mobile :</b> </Col>
                                    <Col span={20}>{record[1].cell}</Col>
                                </Row>
                            }
                            {record[1] && record[1].address &&
                                <Row className="gx-mt-3">
                                    <Col span={4}><b>Address : </b></Col>
                                    <Col span={20}>{record[1].address}</Col>
                                </Row>
                            }
                        </>
                    }
                </div>
            </Spin>
        </div>);
    }
}

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(PrivacyPolicy);
