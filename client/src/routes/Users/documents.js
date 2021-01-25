/* eslint-disable multiline-ternary */
import { DOCUMENT_VERIFICATION_STATUS, BASE_URL } from '../../constants/Common';
import { Col, Empty, Row, message } from 'antd';
import React, { Component } from 'react';
import ActionButton from './action';
// import ReactDOM from 'react-dom';
import axios from 'util/Api';
import IntlMessages from '../../util/IntlMessages';

const _ = require('lodash');

class Documents extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false
        };
        this.verification = [
            // { label: 'Pending', value: 0 },
            { label: <IntlMessages id="app.user.approved" />, value: 1 },
            { label: <IntlMessages id="app.user.rejected" />, value: 2 }
        ];
    }
    onVerification = (value) => {
        console.log('value---', value);
        if (this.props.data.drivingLicence.imageStatus !== DOCUMENT_VERIFICATION_STATUS.APPROVED) {
            this.setState({ showModal: true });
        }
    }

    handleSubmit = async (data) => {
        console.log(data);
        let obj = {};
        obj.userId = this.props.id;
        obj.imageStatus = data;
        let dl = 'drivingLicence';
        obj.documentTypes = [dl];
        try {
            let response = await axios.post('admin/user/approve-documents', obj);
            if (response) {
                message.success(response.message);
            }
        } catch (error) {
            console.log(error);
        }
        this.handleCancel();
    }
    handleCancel = () => {
        this.setState({ showModal: false });
    }
    render() {
        const { data } = this.props;


        return (
            data && data.drivingLicence && data.drivingLicence.path ?
                <>
                    <Row type="flex" justify="space-between" className="gx-p-2">
                        <Col span={12}>
                            <h3><b style={{ marginRight: 10 }}><IntlMessages id="app.user.drivingLicence" /></b></h3>
                        </Col>
                        <Col span={12}>
                            {data.drivingLicence && _.isNumber(data.drivingLicence.imageStatus) ?
                                <a
                                    href="/#" onClick={(e) => {
                                        e.preventDefault();
                                        this.onVerification(data.drivingLicence.imageStatus)
                                    }}
                                    className={data.drivingLicence &&
                                        data.drivingLicence.imageStatus === DOCUMENT_VERIFICATION_STATUS.APPROVED ?
                                        'active-btn' :
                                        'deactive-btn'}
                                    disabled={data.drivingLicence.imageStatus === DOCUMENT_VERIFICATION_STATUS.APPROVED}
                                >
                                    {_.map(this.verification, (item) => {
                                        if (data.drivingLicence.imageStatus === item.value) {

                                            return item.label;
                                        }
                                    })}
                                </a> :
                                ''}
                            {this.state.showModal ?
                                <ActionButton
                                    onCreate={this.handleSubmit}
                                    onCancel={this.handleCancel}
                                /> :
                                null}
                        </Col>
                    </Row>
                    <Row type="flex" justify="space-between" className="gx-p-2">
                        <Col span={12}>
                            <h3><b style={{ marginRight: 10 }}><IntlMessages id="app.user.drivingLicenceNumber" /></b> :{data.drivingLicence.number}</h3>
                        </Col>
                        <Col span={12}>
                            {data.drivingLicence && _.isNumber(data.drivingLicence.status) ?
                                <a
                                    href="/#" onClick={(e) => {
                                        e.preventDefault();
                                    }}
                                    className={data.drivingLicence &&
                                        data.drivingLicence.status === DOCUMENT_VERIFICATION_STATUS.APPROVED ?
                                        'active-btn' :
                                        'deactive-btn'}
                                    disabled={data.drivingLicence.status === DOCUMENT_VERIFICATION_STATUS.APPROVED}
                                >
                                    {_.map(this.verification, (item) => {
                                        if (data.drivingLicence.status === item.value) {

                                            return item.label;
                                        }
                                    })}
                                </a> :
                                ''}
                        </Col>
                    </Row>
                    <Row>
                        {data.drivingLicence.path &&
                            <Col span={8} >
                                <img alt="" src={`${BASE_URL}/${data.drivingLicence.path}`} style={{ width: '100%', height: 300 }} />
                            </Col>
                        }
                        {data.drivingLicence.backPath &&
                            <Col span={8} >
                                <img alt="" src={`${BASE_URL}/${data.drivingLicence.backPath}`} style={{ width: '100%', height: 300 }} />
                            </Col>
                        }
                        {data.drivingLicence.selfie &&
                            <Col span={8} >
                                <img alt="" src={`${BASE_URL}/${data.drivingLicence.selfie}`} style={{ width: '100%', height: 300 }} />
                            </Col>
                        }
                    </Row>
                </> :
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        );
    }

}
export default Documents;
