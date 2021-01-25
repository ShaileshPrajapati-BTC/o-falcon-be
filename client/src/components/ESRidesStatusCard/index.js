import { Button, Card, Modal, Rate, Tag, Icon, Tooltip } from 'antd';
import React, { Component } from 'react';
import { RIDE_STATUS, DEFAULT_DISTANCE_UNIT, FRANCHISEE_LABEL, BASE_URL, FRANCHISEE_VISIBLE, ZONE_LABEL, GUEST_USER_STRING } from '../../constants/Common';
import UtilService from '../../services/util';
import { ReactComponent as RightArrow } from '../../assets/svg/right-arrow.svg';
import NoImage from '../../assets/images/no-image.png';
import Battery from "../ESBattery/Battery";

import ScooterId from '../../routes/CommonComponent/ScooterId';
import UserId from '../../routes/CommonComponent/UserId';
import FranchiseeName from '../ESFranchiseeName';
import IntlMessages from '../../util/IntlMessages';
import PaymentView from './paymentBreakUp';
const _ = require('lodash');

class ESRidesStatusCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            previewVisible: false,
            previewImage: '',
            fareSummary: {},
            showModal: false
        };
    }
    handleCancel = () => {
        return this.setState({ previewVisible: false });
    };
    handlePreview = async (image) => {
        if (image) {
            this.setState({
                previewImage: image,
                previewVisible: true
            });
        }
    };
    showPaymentBreakup = (fareSummary) => {
        this.setState({ showModal: true, fareSummary: fareSummary });
    }
    handleCancelPayment = () => {
        this.setState({ showModal: false, fareSummary: {} });
    };
    render() {
        const { data, completedRideId, status } = this.props;
        const { previewVisible, previewImage } = this.state;
        return (
            <div>
                {
                    data.map((record) => {
                        return (<Card className="vehicleListing gx-pointer"
                            key={record.id}
                            onClick={(status === RIDE_STATUS.COMPLETED || status === RIDE_STATUS.ON_GOING) ? () => completedRideId(record) : null}
                        >

                            <div className="vehicleTobContent d-block-xs">
                                <div className="vehicleRiderName">
                                    <span style={{ float: 'left' }}>
                                        {record.userId &&
                                            <>
                                                {(record.userId.firstName || record.userId.name) ? <UserId
                                                    userId={record.userId.id}
                                                    name={record.userId.firstName ? record.userId.firstName + ' ' + record.userId.lastName : record.userId.name}
                                                    currentPage={this.props.currentPage}
                                                    filter={this.props.filter}
                                                /> :
                                                    <div >
                                                        <h3 style={{ textTransform: 'capitalize' }}>
                                                            <b>{GUEST_USER_STRING}</b>
                                                        </h3>
                                                    </div >}
                                            </>
                                        }</span>
                                    <h3 style={{ float: 'left' }}>(#{record.rideNumber})</h3>
                                    {record.isFreeRide && <Tag color="green" style={{ marginLeft: 5 }}><IntlMessages id="app.referralCode.freeRide" /></Tag>}
                                </div>
                                {/* {FRANCHISEE_VISIBLE && record.franchiseeId && record.franchiseeId.name ?
                                    <div style={{ fontSize: '16px' }}>
                                        <FranchiseeName
                                            name={record.franchiseeId.name}
                                            userId={record.franchiseeId.id}
                                            tag={`${FRANCHISEE_LABEL} Name`}
                                        /></div>
                                    : ''} */}
                                {record.rating && <Rate disabled value={record.rating} />}
                            </div>
                            {FRANCHISEE_VISIBLE && record.franchiseeId && record.franchiseeId.name ?
                                <div style={{ fontSize: '16px' }}>
                                    <FranchiseeName
                                        name={record.franchiseeId.name}
                                        userId={record.franchiseeId.id}
                                        tag={<>{FRANCHISEE_LABEL} <IntlMessages id="app.name" /></>}
                                    /></div>
                                : ''}
                            <div className="vehicleTobContent d-block-xs">
                                <div className="vehicleRiderName">
                                    {/* <span className="gx-flex-row">
                                                                    <ESTag color={this.getStatusColor(record.status)}
                                                                        label={this.getStatusLablel(record.status)}
                                                                    />
                                                                </span> */}

                                    {record.status !== RIDE_STATUS.RESERVED && record.status !== RIDE_STATUS.CANCELLED ?

                                        <div className="rideFromToDetail">
                                            <div className="vehicleFrom">
                                                <h4>{UtilService.displayTime(record.startDateTime)}</h4>
                                                <div className="cureentCity">
                                                    {UtilService.displayOnlyDate(record.startDateTime)}<br />
                                                    {record.startLocation && record.startLocation.name ? record.startLocation.name : ''}

                                                </div>
                                            </div>
                                            <div className="timeDurationVehicle">
                                                <div className="timeCount">
                                                    {record.status === RIDE_STATUS.COMPLETED ?
                                                        record.fareSummary && record.fareSummary.travelTime ?
                                                            record.fareSummary.pausedTime > 0
                                                                ? UtilService.getSecondsToHms(record.fareSummary.travelTime + record.fareSummary.pausedTime)
                                                                : UtilService.getSecondsToHms(record.fareSummary.travelTime)
                                                            : 0 :
                                                        record.fareSummary && record.fareSummary.pausedTime ?
                                                            UtilService.getSecondsToHms(record.fareSummary.pausedTime) :
                                                            0}

                                                </div>
                                                <RightArrow />
                                                <div className="timeStopTime">
                                                    {record.status === RIDE_STATUS.COMPLETED ? record.fareSummary.pausedTime > 0 ? <IntlMessages id="app.rides.totalTime" /> : <IntlMessages id="app.rides.travelTime" /> : <IntlMessages id="app.rides.pauseTime" />}
                                                </div>
                                            </div>
                                            <div className="vehicleFrom vehicleRight">
                                                <h4>{record.status === RIDE_STATUS.COMPLETED ?
                                                    UtilService.displayTime(record.endDateTime) : ''}
                                                </h4>
                                                <div className="cureentCity">
                                                    {
                                                        UtilService.displayOnlyDate(record.endDateTime)
                                                    }<br />

                                                    {record.endLocation && record.endLocation.name ? record.endLocation.name : '-'}

                                                </div>
                                            </div>
                                        </div> :

                                        <div>
                                            {record.status === RIDE_STATUS.CANCELLED && record.statusTrack.length ?
                                                <>
                                                    <div className="gx-mt-2">
                                                        <b><IntlMessages id="app.rides.rideBookingTime" />  : </b>
                                                        {UtilService.displayDate(record.statusTrack[0].dateTime)}
                                                    </div>
                                                    <div className="gx-mt-2">
                                                        <b><IntlMessages id="app.rides.rideCancellationTime" /> : </b>
                                                        {_.map(record.statusTrack, (item) => {
                                                            if (item.status === RIDE_STATUS.CANCELLED) {
                                                                let time = UtilService.displayDate(item.dateTime);

                                                                return time;
                                                            }
                                                        })} </div>
                                                    {record.reservedDateTime && <div className="gx-mt-2">
                                                        <b><IntlMessages id="app.rides.rideReservedTime" /> : </b>
                                                        {UtilService.displayDate(record.reservedDateTime)}
                                                    </div>}
                                                    {record.reservedEndDateTime && <div className="gx-mt-2">
                                                        <b><IntlMessages id="app.rides.rideReservedEndTime" /> : </b>
                                                        {UtilService.displayDate(record.reservedEndDateTime)}
                                                    </div>}
                                                </> :
                                                null}
                                        </div>
                                    }
                                </div>
                                <div className="vehicleHorizontal"></div>
                                <div className="vehicleRiderDetail">
                                    <ScooterId data={record} />
                                    {record && record.vehicleId && <div className="scooterID">
                                        <Battery batteryLevel={record.vehicleId.batteryLevel} isRideCard={true} />
                                    </div>}
                                    {record.status !== RIDE_STATUS.ON_GOING && record.status !== RIDE_STATUS.RESERVED ? !record.isPaid && (record.status === RIDE_STATUS.COMPLETED || record.status === RIDE_STATUS.CANCELLED) ?
                                        <div className="scooterID" onClick={() => this.props.handleClick(record.id)}>
                                            <span className="topbarCommonBtn">
                                                <Button
                                                    style={{ display: 'inline-flex' }}
                                                    type="primary"

                                                ><IntlMessages id="app.rides.fetchPayment" /></Button>
                                            </span>
                                        </div> :
                                        <div className="scooterID">
                                            <div className="lbl powerLbl">
                                                <b><IntlMessages id="app.rides.paid" /></b>
                                            </div>
                                        </div> : ''}
                                </div>
                            </div>
                            <div className="shaprateVerticle"></div>
                            <div className="VehicleCardFooter">
                                <div className="totalLabel">
                                    {record.status === RIDE_STATUS.ON_GOING || record.status === RIDE_STATUS.COMPLETED ?
                                        <div>{<>{ZONE_LABEL} <IntlMessages id="app.name" /> </>}:
                                            <span className="darkLabel">
                                                {` ${record.zoneId && record.zoneId.name ? record.zoneId.name : '-'}`}
                                            </span>
                                        </div> : ' '}
                                    {record.status !== RIDE_STATUS.ON_GOING && record.status !== RIDE_STATUS.CANCELLED ?
                                        <div><IntlMessages id="app.dashboard.totalRide" />:
                                            <span className="darkLabel">
                                                {` ${record.totalKm ? UtilService.displayNumber(record.totalKm) : 0}`}
                                                {` ${DEFAULT_DISTANCE_UNIT}`}
                                            </span>
                                        </div> : ' '}
                                    {/* {` (Booked: ${record.estimateKm ? record.estimateKm : 0} ${DEFAULT_DISTANCE_UNIT})`} */}
                                    {record.status === RIDE_STATUS.COMPLETED && <div>
                                        <IntlMessages id="app.rides.totalCharges" /> : <span className="darkLabel"> {UtilService.displayPrice(record.totalFare)}
                                            {!record.status === RIDE_STATUS.COMPLETED || !record.status === RIDE_STATUS.CANCELLED ? 'apx.' : null}</span>
                                        <span onClick={this.showPaymentBreakup.bind(this, record.fareSummary)}>
                                            <Tooltip title={<IntlMessages id="app.payment.paymentBreakups" />}>
                                                <Icon
                                                    type="info-circle-o"
                                                    style={{ color: "green", marginLeft: 5 }}
                                                />
                                            </Tooltip>
                                        </span>
                                    </div>
                                    }
                                    {record.reservedDateTime && record.status === RIDE_STATUS.COMPLETED &&
                                        <div>
                                            <IntlMessages id="app.rides.rideReservedTime" />  : <span className="darkLabel">  {UtilService.displayDate(record.reservedDateTime)}</span>
                                        </div>
                                    }
                                    {record.reservedEndDateTime && record.status === RIDE_STATUS.COMPLETED &&
                                        <div>
                                            <IntlMessages id="app.rides.rideReservedEndTime" /> : <span className="darkLabel">  {UtilService.displayDate(record.reservedEndDateTime)}</span>
                                        </div>
                                    }
                                </div>
                                <div className="totalLabel">
                                    {record.status === RIDE_STATUS.COMPLETED &&
                                        record.fareSummary &&
                                        record.fareSummary.travelTime &&
                                        record.fareSummary.pausedTime > 0 &&
                                        <>
                                            <div>
                                                <IntlMessages id="app.rides.travelTime" /> : <span className="darkLabel"> {UtilService.getSecondsToHms(record.fareSummary.travelTime)}</span>
                                            </div>
                                            <div>
                                                <IntlMessages id="app.rides.pauseTime" />  : <span className="darkLabel"> {UtilService.getSecondsToHms(record.fareSummary.pausedTime)}</span>
                                            </div>
                                        </>
                                    }
                                </div>
                                <div className="totalLabel">
                                    {record.status !== RIDE_STATUS.COMPLETED ?
                                        <>
                                            <IntlMessages id="app.rides.totalCharges" /> :
                                                                        <span className="darkLabel">
                                                {UtilService.displayPrice(record.totalFare)}
                                                {!record.status === RIDE_STATUS.COMPLETED || !record.status === RIDE_STATUS.CANCELLED ?
                                                    'apx.' :
                                                    null}
                                            </span>
                                        </> :
                                        <div className="ParkedImg"><div style={{ width: '65px' }}>
                                            <b className="gx-mt-3"><IntlMessages id="app.rides.parkingPhoto" /></b>
                                        </div>
                                            <div className="parkedImage">
                                                <Card
                                                    className="parkedImageCard"
                                                    cover={
                                                        <img
                                                            src={record.scooterImage ? `${BASE_URL}/${record.scooterImage}` : NoImage}
                                                            alt=""
                                                            onClick={record.scooterImage ? () => this.handlePreview(`${BASE_URL}/${record.scooterImage}`) : ''}
                                                            className="parkedVehicleCover rotate90"
                                                        />}
                                                />
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        </Card>)
                    }
                    )
                }
                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
                {this.state.showModal && (
                    <PaymentView
                        onCancel={this.handleCancelPayment}
                        fareSummary={this.state.fareSummary}
                    />
                )}
            </div>
        );
    }
}
export default ESRidesStatusCard;
