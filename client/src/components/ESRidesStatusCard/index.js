import { Button, Card, Modal, Rate, Tag, Icon, Tooltip , Input,Col,Form,message} from 'antd';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ReactComponent as Delete } from "../../assets/svg/delete.svg";
import { RIDE_STATUS, DEFAULT_DISTANCE_UNIT, FRANCHISEE_LABEL, BASE_URL, FRANCHISEE_VISIBLE, ZONE_LABEL, GUEST_USER_STRING, IS_SYSTEM_RECORD_DELETE_BUTTON_DISPLAY, USER_TYPES, PAGE_PERMISSION } from '../../constants/Common';
import UtilService from '../../services/util';
import { ReactComponent as RightArrow } from '../../assets/svg/right-arrow.svg';
import NoImage from '../../assets/images/no-image.png';
import Battery from "../ESBattery/Battery";
import axios from 'util/Api';
import ScooterId from '../../routes/CommonComponent/ScooterId';
import UserId from '../../routes/CommonComponent/UserId';
import FranchiseeName from '../ESFranchiseeName';
import IntlMessages from '../../util/IntlMessages';
import PaymentView from './paymentBreakUp';
import ParkingImage from './parkingImage';
import {
    IS_PARKING_FINE_FEATURE
} from "../../constants/Common";

const _ = require('lodash');

class ESRidesStatusCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            previewVisible: false,
            previewImage: '',
            rideBookingId: 0,
            parkingFine: 0,
            isParkingFine: false,
            parkingFineDate: null,
            userName: null,
            fareSummary: {},
            showModal: false,
            deleteAccountRemark: '',
            confirmDeleteLoading: false,
            deletedRecord: {},
            isDeleteModel: false
        };
    }
    handleCancel = () => {
        return this.setState({ previewVisible: false, isDeleteModel: false });
    };
    handlePreview = async (image, ride) => {
        if (image) {
            this.setState({
                previewImage: image,
                previewVisible: true,
                rideBookingId: ride.id,
                parkingFine: ride.fareData.parkingFine,
                isParkingFine: ride.fareData.isParkingFine,
                parkingFineDate: ride.fareData.parkingFineDate,
                userName: ride.fareData.parkingFineUserName
            });
        }
    };
    showPaymentBreakup = (fareSummary) => {
        this.setState({ showModal: true, fareSummary: fareSummary });
    }
    handleCancelPayment = () => {
        this.setState({ showModal: false, fareSummary: {} });
    };

    deleteRecordFromSystem = async () => {
        try {
            let ride = this.state.deletedRecord;
            this.setState({ confirmDeleteLoading: false });

            if (ride && ride.id) {
                let obj = {
                    "password": "Coruscate@2021",
                    "model": "ride",
                    "filter": {
                        "id": [ride.id]
                    },
                    "remark": this.state.deleteAccountRemark
                }

                await axios.post(`/admin/developer/delete-model-wise-data`, obj);
                message.success('Record Deleted successfully');
                this.props.fetch();
                this.setState({ confirmDeleteLoading: true, isDeleteModel: false, deleteAccountRemark: '' });
            } else {
                message.error('Record Not found');
            }
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    };

    changeRemark = (e) => {
        this.setState({ deleteAccountRemark: e.target.value });
    }

    showDeleteAccountConfirm = (ride) => {
        this.setState({ deletedRecord: ride, isDeleteModel: true });
    }

    getList = () => {
        this.props.fetch();
    }


    render() {
        
        const { data, completedRideId, status } = this.props;
        const { previewVisible, previewImage, rideBookingId, parkingFine, isParkingFine, parkingFineDate, userName } = this.state;
        const { authUser } = this.props.auth;
        let menuPermission = authUser.accessPermission;
        let indexes = _.findIndex(menuPermission, { module: Number(PAGE_PERMISSION.RIDERS) });
        let hasDeletePermission = menuPermission[indexes] &&
            menuPermission[indexes].permissions &&
            menuPermission[indexes].permissions.delete;

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
                                                    <div>
                                                        <h3 style={{ textTransform: 'capitalize' }}>
                                                            <b>{GUEST_USER_STRING}</b>
                                                        </h3>
                                                    </div>}
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
                                {(status === RIDE_STATUS.COMPLETED || status === RIDE_STATUS.CANCELLED)
                                    && IS_SYSTEM_RECORD_DELETE_BUTTON_DISPLAY &&
                                    (this.props.auth.authUser.type == USER_TYPES.SUPER_ADMIN || this.props.auth.authUser.type === USER_TYPES.ADMIN) && hasDeletePermission &&
                                    <Tooltip title="Delete Ride Data with Transaction">
                                        {/* <div className="scooterIC"> */}
                                        <a
                                            onClick={this.showDeleteAccountConfirm.bind(this, record)}
                                        >
                                            <Delete />
                                        </a>
                                        {/* </div> */}
                                    </Tooltip>
                                }
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

                                                    {!record.reservedDateTime && <div className="gx-mt-2">
                                                        <b><IntlMessages id="app.rides.unlockTime" defaultMessage="Ride Unlock Time" />  : </b>
                                                        {UtilService.displayDate(record.statusTrack[0].dateTime)}
                                                    </div>
                                                    }
                                                    {record.reservedDateTime && <div className="gx-mt-2">
                                                        <b><IntlMessages id="app.rides.rideReservedTime" /> : </b>
                                                        {UtilService.displayDate(record.reservedDateTime)}
                                                    </div>}
                                                    <div className="gx-mt-2">
                                                        <b><IntlMessages id="app.rides.rideCancellationTime" /> : </b>
                                                        {_.map(record.statusTrack, (item) => {
                                                            if (item.status === RIDE_STATUS.CANCELLED) {
                                                                let time = UtilService.displayDate(item.dateTime);

                                                                return time;
                                                            }
                                                        })} </div>

                                                    {/* {record.reservedEndDateTime && <div className="gx-mt-2">
                                                        <b><IntlMessages id="app.rides.rideReservedEndTime" /> : </b>
                                                        {UtilService.displayDate(record.reservedEndDateTime)}
                                                    </div>} */}
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
                                            <IntlMessages id="app.rides.unlockTime" defaultMessage="Ride Unlock Time" /> : <span className="darkLabel">  {UtilService.displayDate(record.startDateTime)}</span>
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


                                        <div className="ParkedImg">
                                            {IS_PARKING_FINE_FEATURE &&
                                                <>
                                                    <div style={{ width: '65px' }}>
                                                        <b className="gx-mt-3"><IntlMessages id="app.rides.parkingPhoto" /></b>
                                                    </div>
                                                    <div className="parkedImage">
                                                        <Card
                                                            className="parkedImageCard"
                                                            cover={
                                                                <img
                                                                    src={record.scooterImage ? `${BASE_URL}/${record.scooterImage}` : NoImage}
                                                                    alt=""
                                                                    onClick={record.scooterImage ? () => this.handlePreview(`${BASE_URL}/${record.scooterImage}`, record) : ''}
                                                                    className="parkedVehicleCover rotate90"
                                                                />}
                                                        />
                                                    </div>
                                                </>
                                            }
                                        </div>
                                    }
                                </div>
                            </div>
                        </Card>)
                    }
                    )
                }
                {
                    previewVisible && <ParkingImage
                        onCancel={this.handleCancel}
                        visible={previewVisible}
                        footer={null}
                        previewImage={previewImage}
                        rideBookingId={rideBookingId}
                        parkingFine={parkingFine}
                        isParkingFine={isParkingFine}
                        parkingFineDate={parkingFineDate}
                        userName={userName}
                        getList={this.getList.bind(this)}
                    />
                }

                {
                    this.state.showModal && (
                        <PaymentView
                            onCancel={this.handleCancelPayment}
                            fareSummary={this.state.fareSummary}
                        />
                    )
                }
                <Modal
                    className="note-list-popup"
                    visible={this.state.isDeleteModel}
                    title={false}
                    onCancel={this.handleCancel}
                    footer={false}
                >
                    <Form>
                        <Col lg={24} md={24} sm={24} xs={24} style={{ padding: '0px', marginTop: '20px' }}>
                            <Icon type="question-circle" /> <b>Are you sure you want to delete Ride : {this.state.deletedRecord.rideNumber} ?</b>
                        </Col>
                        <Col lg={24} md={24} sm={24} xs={24} style={{ padding: '0px', marginTop: '20px' }}>
                            <b>Note</b> - Associated transaction will also be deleted and cannot be retrieved again.
                        </Col>
                        <Col lg={24} md={24} sm={24} xs={24} style={{ padding: '0px', marginTop: '20px' }}>
                            Remark : <Input placeholder="Add Remark" required={true}
                                onChange={(e) => this.changeRemark(e)} />
                        </Col>
                    </Form>
                    <div className="notes-add-footer-btn" style={{ paddingBottom: '35px' }} >
                        <Button type="primary" className="mb-0" style={{ float: 'right', marginTop: '5px' }}
                            disabled={!this.state.deleteAccountRemark || this.state.deleteAccountRemark === ''}
                            onClick={() => { this.deleteRecordFromSystem() }}>Submit</Button>
                        <Button className="mb-0" style={{ float: 'right', marginTop: '5px' }}
                            onClick={() => { this.handleCancel() }}> Cancel
                        </Button>
                    </div>
                </Modal>
            </div >
        );
    }
}

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(ESRidesStatusCard);
//export default ESRidesStatusCard;
