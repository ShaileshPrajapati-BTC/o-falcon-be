import { Col, Divider, Modal, Row, Input, Button, Form, message } from 'antd';
import {
    DEFAULT_API_ERROR, DEFAULT_BASE_CURRENCY
} from "../../constants/Common";
import React, { Component } from 'react';
import axios from "util/Api";
import IntlMessages from "../../util/IntlMessages";
import UtilService from "../../services/util";
const _ = require("lodash");
const moment = require('moment');


class ParkingImage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowparkingFineMsg: !props.isParkingFine
        };
        // console.log('props.isParkingFine', props.isParkingFine)
    }

    chargeFine = async (e) => {
        e.preventDefault();
        this.props.form.validateFields(async (err, values) => {
            if (err) {
                return false;
            }
            const { rideBookingId } = this.props;
            let reqObj = _.clone({ rideId: rideBookingId, remark: values.Remark });
            try {
                let data = await axios.post(`/admin/ride-booking/charge-customer-for-fine`, reqObj)
                if (data.code === "OK") {
                    message.success(`${data.message}`);
                    this.setState({ isShowparkingFineMsg: false });
                } else {
                    message.error(`${data.message}`);
                }
            } catch (response) {
                let resp = (response && response.data) || {
                    message: DEFAULT_API_ERROR
                };
                message.error(`${resp.message}`);
            }
            this.props.getList();
        });
    }

    render() {
        const { form } = this.props;
        const { onCancel, footer, previewImage, visible, parkingFine, isParkingFine, parkingFineDate, userName } = this.props;
        const { getFieldDecorator } = form;
        const { isShowparkingFineMsg } = this.state;
        // if (isParkingFine) {
        //     this.state = {
        //         isShowparkingFineMsg: false,
        //     };
        // } else {
        //     this.state = {
        //         isShowparkingFineMsg: true,
        //     };
        // }
        return (
            <Modal visible={visible} footer={footer} onCancel={onCancel}>
                <div style={{ marginTop: '17px', marginBottom: '17px', maxHeight: '300px', overflowY: 'scroll', height: 'auto' }}>
                    <img alt="example" style={{ width: '100%', marginTop: '17px', marginBottom: '17px' }} src={previewImage} />

                </div>
                <p style={{ display: isShowparkingFineMsg ? 'block' : 'none' }} >If parked incorrectly, fine customer {DEFAULT_BASE_CURRENCY} {parkingFine} </p>
                <p style={{ marginTop: '20px', color: 'red', display: !isShowparkingFineMsg ? 'block' : 'none' }}  >
                    Parking fine of {DEFAULT_BASE_CURRENCY} {parkingFine} applied on {moment(parkingFineDate).format('DD MMM YYYY hh:mm a')} by  {userName}
                </p>
                <Form layout="vertical" onSubmit={this.chargeFine} style={{ display: isShowparkingFineMsg ? 'block' : 'none' }}>
                    <Form.Item label={<IntlMessages id="app.rides.Remark" defaultMessage="Remark" style={{ paddingLeft: '5px' }} />}
                        hasFeedback>
                        {getFieldDecorator('Remark', {
                            rules: [{
                                required: true,
                                message: <IntlMessages id="app.rides.RemarkMsg" defaultMessage="Please Enter Remark!" />
                            },]
                        })(
                            <Input placeholder="Remark" maxLength={300} />
                        )}
                    </Form.Item>

                    <Button type="danger" style={{ marginTop: '20px' }} onClick={this.chargeFine} style={{ display: isShowparkingFineMsg ? '' : 'none' }} >
                        Charge Fine
                    </Button>
                    <Button onClick={onCancel} style={{ float: 'right', display: isShowparkingFineMsg ? '' : 'none' }} >
                        Cancel
                    </Button>
                </Form>


            </Modal>
        );
    }
}

const WrappedModelParkingImage = Form.create({
    name: "fareManementParkingFineForm"
})(ParkingImage);

export default WrappedModelParkingImage;
