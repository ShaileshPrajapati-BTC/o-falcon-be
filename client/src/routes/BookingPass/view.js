import { Col, Modal, Row, message } from 'antd';
import { BOOKING_PASS_TIME_TYPES, BOOKING_PASS_LIMIT_TYPES, VEHICLE_TYPES, BOOKING_PASS_TYPE, BOOKING_PASS_LIMIT_TYPES_FILTER, BOOKING_PASS_TYPE_FILTER, BOOKING_PASS_EXPIRATION_TYPES_FILTER } from '../../constants/Common';
import React, { Component } from 'react';
import UtilService from '../../services/util';
import axios from 'util/Api';

class BookingPlanView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            record: {}
        };
    }
    componentDidMount() {
        this.fetch(this.props.id);
    }
    fetch = async (id) => {
        try {
            let response = await axios.get(`admin/booking-pass/${id}`);
            if (response.code === 'OK') {
                this.setState({ record: response.data });
            } else {
                message.error(response.message)
            }
        } catch (error) {
            message.error(error.message)
        }
    }
    render() {
        const { onCancel } = this.props;
        let { record } = this.state;
        let limitType = record && BOOKING_PASS_LIMIT_TYPES_FILTER.find((el) => { return el.type === record.limitType; });
        let expirationType = record && BOOKING_PASS_EXPIRATION_TYPES_FILTER.find((el) => { return el.type === record.expirationType; })
        return (
            record ?
                <Modal
                    visible={true}
                    title={<h3><b>{record.name}</b></h3>}
                    footer=""
                    onCancel={onCancel}
                    width={700}
                >
                    <Row className="viewplanrow">
                        <Col span={6}>
                            <b> Code :</b>
                        </Col>
                        <Col span={18}>
                            {record.code}
                        </Col>
                    </Row>
                    <Row className="viewplanrow">
                        <Col span={6}>
                            <b> Usage Limit :</b>
                        </Col>
                        <Col span={18}>
                            {record.limitValue} {'  '}
                            <span style={{ textTransform: 'capitalize' }}>
                                {limitType && limitType.label}
                            </span>
                        </Col>
                    </Row>
                    <Row className="viewplanrow">
                        <Col span={6}>
                            <b> Expiration Limit :</b>
                        </Col>
                        <Col span={18}>
                            {record.expirationValue} {'  '}
                            <span style={{ textTransform: 'capitalize' }}>
                                {expirationType && expirationType.label}
                            </span>
                        </Col>
                    </Row>
                    <Row className="viewplanrow">
                        <Col span={6}>
                            <b> Charged On :</b>
                        </Col>
                        <Col span={18}>
                            {record.passType &&
                                record.passType.map((type, i) => {
                                    return i !== 0 ?
                                        ", " + BOOKING_PASS_TYPE_FILTER.find((el) => { return el.type === type }) &&
                                        BOOKING_PASS_TYPE_FILTER.find((el) => { return el.type === type }).label
                                        : BOOKING_PASS_TYPE_FILTER.find((el) => { return el.type === type }) &&
                                        BOOKING_PASS_TYPE_FILTER.find((el) => { return el.type === type }).label;
                                })
                            }
                        </Col>
                    </Row>
                    <Row className="viewplanrow">
                        <Col span={6}>
                            <b> Price :</b>
                        </Col>
                        <Col span={18}>
                            <Row className="viewplanrow" style={{ paddingLeft: 0 }}>
                                <Col span={6}>
                                    <b> VehicleType </b>
                                </Col>
                                <Col span={4}>
                                    <b> Price </b>
                                </Col>
                                {record.passType && record.passType.includes(BOOKING_PASS_TYPE.RIDE) &&
                                    <Col span={7}>
                                        <b> Ride Discount </b>
                                    </Col>}
                                {record.passType && record.passType.includes(BOOKING_PASS_TYPE.UNLOCK) &&
                                    <Col span={7}>
                                        <b> Unlock Discount </b>
                                    </Col>}
                            </Row>
                            {record.vehicleTypes && record.vehicleTypes.map((data) => {
                                return <Row className="viewplanrow" style={{ paddingLeft: 0 }}>
                                    <Col span={6}>
                                        {Object.keys(VEHICLE_TYPES)[data.vehicleType - 1]}
                                    </Col>
                                    <Col span={6}>
                                        {data.price}
                                    </Col>
                                    {record.passType && record.passType.includes(BOOKING_PASS_TYPE.RIDE) &&
                                        <Col span={6}>
                                            {data.rideDiscount}
                                        </Col>}
                                    {record.passType && record.passType.includes(BOOKING_PASS_TYPE.UNLOCK) &&
                                        <Col span={6}>
                                            {data.unlockDiscount}
                                        </Col>}
                                </Row>
                            })}
                        </Col>
                    </Row>
                    <Row className="viewplanrow">
                        <Col span={6}>
                            <b>Description : </b>
                        </Col>
                        <Col span={18}>
                            {record.description ? record.description : '-'}
                        </Col>
                    </Row>
                    {
                        record.maxRidePerDay && record.maxRidePerDay !== 0 ?
                            <Row className="viewplanrow">
                                <Col span={6}>
                                    <b>Max ride per day: </b>
                                </Col>
                                <Col span={18}>
                                    {record.maxRidePerDay}
                                </Col>
                            </Row>
                            : null
                    }
                    {
                        record.extraDescription && record.extraDescription.length > 0 ?
                            <Row className="viewplanrow">
                                <Col span={6}>
                                    <b>Extra Description: </b>
                                </Col>
                                <Col span={18}>
                                    {record.extraDescription.map((data, i) => {
                                        return (
                                            <Row className="viewplanrow" style={{ paddingLeft: 0 }}>
                                                <Col span={24}>
                                                    {data}
                                                </Col>
                                            </Row>
                                        );
                                    })}
                                </Col>
                            </Row>
                            : null
                    }
                </Modal > :
                null
        );
    }
}

export default BookingPlanView;
