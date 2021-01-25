import React from "react";
import { Divider, Icon, List, Tag, Modal, message, Button } from "antd";
import {
    DEFAULT_DISTANCE_UNIT,
    PAGE_PERMISSION,
    RIDE_STATUS,
    VEHICLE_TYPES,
    TASK_MODULE_VISIBLE,
    RENTAL_VISIBLE,
    ADD_VEHICLE_INTO_NEST,
    DEFAULT_API_ERROR,
    USER_TYPES,
    DEALER_ROUTE,
    NEST_ROUTE,
    NEST_LABEL,
    FRANCHISEE_VISIBLE,
    CLIENT_VISIBLE,
    PARTNER_WITH_CLIENT_FEATURE,
    DEALER_LABEL,
    FRANCHISEE_LABEL
} from "../../constants/Common";
import ActionButtons from "../../components/ActionButtons";
import ESQrCode from "../../components/ESQrCode";
import ESCreateTask from "../../components/ESCreateTask";
import ESAssignVehicleToNest from "../../components/ESVehicleAssignToNest";
import { connect } from "react-redux";
import axios from "util/Api";

import ActiveDeactive from "../../components/custom/ActiveDeactive";
import { ReactComponent as Kms } from "../../assets/svg/kms.svg";
import { ReactComponent as Speed } from "../../assets/svg/speed.svg";
import { ReactComponent as User } from "../../assets/svg/user.svg";
import { ReactComponent as Lock } from "../../assets/svg/vehicleLock.svg";
import { ReactComponent as UnLock } from "../../assets/svg/vehicleUnlock.svg";
import { ReactComponent as SelectCheck } from "./selectCheck.svg";
import UtilService from "../../services/util";
import FranchiseeName from "../ESFranchiseeName";
import Battery from "../ESBattery/Battery";
import ESToolTip from "../ESToolTip";
import { Link } from "react-router-dom";
import IntlMessages from "../../util/IntlMessages";
import ActionButton from "../../routes/Riders/action";
const _ = require("lodash");

const DealerName = props => {
    return (
        <div>
            <div
                style={{
                    textTransform: "capitalize",
                    float: "left"
                }}
            >
                {props.authUser.type === USER_TYPES.FRANCHISEE ?
                    <Link to={`/e-scooter/${DEALER_ROUTE}/view/${props.userId}`}>
                        <b style={{ color: "#595959", cursor: "pointer" }}>
                            {" "}
                        &nbsp;({props.userId ? ` ${props.name} ` : ""})
                    </b>
                    </Link>
                    : <b style={{ color: "#595959" }}>
                        {" "}
                &nbsp;({props.userId ? ` ${props.name} ` : ""})
            </b>
                }
            </div>
        </div>
    );
};
class VehicleList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showQrView: false,
            qrNumber: 0,
            taskmodel: false,
            taskVehicleId: "",
            nestListModal: false,
            nestVehicleId: "",
            disabled: false,
            selectedRecord: [],
            showModal: false,
            data: props.data,
            total: props.total,
            selectAll: false,
        };
    }
    async componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.state.data) {
            await this.setState({ data: [] })
            this.setState({ data: nextProps.data });
        }
        if (nextProps.total !== this.state.total) {
            this.setState({ total: nextProps.total });
        }
    }
    assignVehicle = id => {
        this.setState({ nestListModal: true, nestVehicleId: id });
    };
    handleSubmitNestModal = () => {
        this.handleNestModalCancel();
        this.props.fetch();
    };
    handleNestModalCancel = () => {
        this.setState({ nestListModal: false, nestVehicleId: "" });
    };
    retainVehicle = id => {
        let self = this;
        Modal.confirm({
            title: `Are you sure to retain this vehicle from ${NEST_ROUTE}!`,
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk() {
                self.retainVehicleFromNest(id);
            }
        });
    };
    retainVehicleFromNest = async id => {
        await axios
            .post("/admin/nest/retain-vehicle", { vehicleId: [id] })
            .then(response => {
                if (response.code === "OK") {
                    message.success(`${response.message}`);
                    this.props.fetch();
                } else {
                    message.error(`${response.message}`);
                }
            })
            .catch(function (error) {
                let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
                message.error(errorMsg);
            });
    };
    viewTaskModel = id => {
        this.setState({ taskmodel: true, taskVehicleId: id });
    };
    handleSubmitTask = () => {
        this.handleTaskCancel();
    };
    handleTaskCancel = () => {
        this.setState({ taskmodel: false, taskVehicleId: "" });
    };
    handelLocation = cordinate => {
        let path =
            "https://www.google.com/maps/search/?api=1&query=" +
            `${cordinate[1]}` +
            "," +
            `${cordinate[0]}`;
        let win = window.open(path, "_blank");
        win.focus();
    };
    viewQrCode = qrNumber => {
        this.setState({ showQrView: true, qrNumber: qrNumber });
    };
    handleViewCancel = () => {
        this.setState({ showQrView: false, qrNumber: null });
    };
    getRentStartDateMsg = item => {
        const isDealer = this.props.auth.authUser.type === USER_TYPES.DEALER;
        const isFranchisee =
            this.props.auth.authUser.type === USER_TYPES.FRANCHISEE;
        let resultObj = {};
        let toolTipText = "";
        let isTrue = false;

        let hasFranchiseeRentStartDate, hasDealerRentStartDate;
        // if (!isDealer && !isFranchisee) {
        //     hasFranchiseeRentStartDate =
        //         item.franchiseeId !== null &&
        //         (item.franchiseeId &&
        //             item.franchiseeId.id &&
        //             (item.franchiseeRentStartDate === "" ||
        //                 !item.franchiseeRentStartDate));
        //     toolTipText = hasFranchiseeRentStartDate
        //         ? <IntlMessages id="app.vehicle.startDateNotConfigured" />
        //         : <><IntlMessages id="app.vehicle.rentStartDate" />:{UtilService.displayOnlyDate(
        //             item.franchiseeRentStartDate
        //         )}</>;
        //     isTrue = !hasFranchiseeRentStartDate;
        // }
        if (!isDealer) {
            if (item.dealerId !== null) {
                hasFranchiseeRentStartDate =
                    item.franchiseeId !== null &&
                    (item.franchiseeId &&
                        item.franchiseeId.id &&
                        (item.franchiseeRentStartDate === "" ||
                            !item.franchiseeRentStartDate));
                hasDealerRentStartDate =
                    item.dealerId !== null &&
                    (item.dealerId &&
                        item.dealerId.id &&
                        (item.dealerRentStartDate === "" ||
                            !item.dealerRentStartDate));
                if (isFranchisee) {
                    if (hasFranchiseeRentStartDate) {
                        toolTipText = hasDealerRentStartDate
                            ? <><IntlMessages id="app.vehicle.startDateNotConfiguredForYouDealer" /><span className="gx-text-lowercase">{DEALER_LABEL}</span>!</>
                            : <><IntlMessages id="app.vehicle.startDateNotConfiguredForYou" /> <span className="gx-text-lowercase">{DEALER_LABEL}</span>:{UtilService.displayOnlyDate(
                                item.dealerRentStartDate
                            )}</>;
                    } else {
                        toolTipText = hasDealerRentStartDate
                            ? <><IntlMessages id="app.vehicle.startDateForYou" />: {UtilService.displayOnlyDate(item.franchiseeRentStartDate)}
                                <IntlMessages id="app.vehicle.startDateNotConfiguredFor" /><span className="gx-text-lowercase">{DEALER_LABEL}</span>
                            </>
                            : <><IntlMessages id="app.vehicle.startDateForYou" />: {UtilService.displayOnlyDate(item.franchiseeRentStartDate)}
                                <IntlMessages id="app.vehicle.startDateFor" /><span className="gx-text-lowercase">{DEALER_LABEL}</span>: {UtilService.displayOnlyDate(item.dealerRentStartDate)}
                            </>;
                    }
                } else {
                    if (hasFranchiseeRentStartDate) {
                        toolTipText = hasDealerRentStartDate
                            ? <><IntlMessages id="app.vehicle.startDateNotConfiguredFor" /><span className="gx-text-lowercase">{FRANCHISEE_LABEL}</span> <IntlMessages id="app.and" /> <span className="gx-text-lowercase">{DEALER_LABEL}</span>!</>
                            : <><IntlMessages id="app.vehicle.startDateNotConfiguredFor" /><span className="gx-text-lowercase">{FRANCHISEE_LABEL}</span>! <IntlMessages id="app.vehicle.startDateFor" /> <span className="gx-text-lowercase">{DEALER_LABEL}</span>:{UtilService.displayOnlyDate(
                                item.dealerRentStartDate
                            )}</>;
                    } else {
                        toolTipText = hasDealerRentStartDate
                            ? <><IntlMessages id="app.vehicle.startDateFor" /><span className="gx-text-lowercase">{FRANCHISEE_LABEL}</span>: {UtilService.displayOnlyDate(item.franchiseeRentStartDate)}
                               &nbsp; <IntlMessages id="app.vehicle.startDateNotConfiguredFor" /><span className="gx-text-lowercase">{DEALER_LABEL}</span>
                            </>
                            : <><IntlMessages id="app.vehicle.startDateFor" /><span className="gx-text-lowercase">{FRANCHISEE_LABEL}</span>: {UtilService.displayOnlyDate(item.franchiseeRentStartDate)}
                               &nbsp; <IntlMessages id="app.vehicle.startDateFor" /><span className="gx-text-lowercase">{DEALER_LABEL}</span>: {UtilService.displayOnlyDate(item.dealerRentStartDate)}
                            </>;
                    }
                }

                isTrue = !hasFranchiseeRentStartDate && !hasDealerRentStartDate;
            } else {
                hasFranchiseeRentStartDate =
                    item.franchiseeId !== null &&
                    (item.franchiseeId &&
                        item.franchiseeId.id &&
                        (item.franchiseeRentStartDate === "" ||
                            !item.franchiseeRentStartDate));
                if (isFranchisee) {
                    toolTipText = hasFranchiseeRentStartDate
                        ? <IntlMessages id="app.vehicle.startDateNotConfigured" />
                        : <> <IntlMessages id="app.vehicle.rentStartDate" />: {UtilService.displayOnlyDate(
                            item.franchiseeRentStartDate
                        )}</>;
                } else {
                    toolTipText = hasFranchiseeRentStartDate
                        ? <> <IntlMessages id="app.vehicle.startDateNotConfiguredFor" /><span className="gx-text-lowercase">{FRANCHISEE_LABEL}</span>!</>
                        : <> <IntlMessages id="app.vehicle.startDateFor" /><span className="gx-text-lowercase">{FRANCHISEE_LABEL}</span>: {UtilService.displayOnlyDate(
                            item.franchiseeRentStartDate
                        )}</>;
                }

                isTrue = !hasFranchiseeRentStartDate;
            }
        }
        if (isDealer) {
            const hasFleetType = item.fleetType && item.fleetType.length > 0;
            hasDealerRentStartDate =
                item.dealerId !== null &&
                (item.dealerId &&
                    item.dealerId.id &&
                    (item.dealerRentStartDate === "" ||
                        !item.dealerRentStartDate));
            if (hasDealerRentStartDate) {
                toolTipText = hasFleetType
                    ? <IntlMessages id="app.vehicle.startDateNotConfigured" />
                    : <IntlMessages id="app.vehicle.rentStartDateFleetTypeNotAssigned" />;
            } else {
                toolTipText = hasFleetType
                    ? <><IntlMessages id="app.vehicle.rentStartDate" />:{UtilService.displayOnlyDate(item.dealerRentStartDate)}</>
                    : <><IntlMessages id="app.vehicle.rentStartDate" />:
                        {UtilService.displayOnlyDate(item.dealerRentStartDate)}
                        <IntlMessages id="app.vehicle.fleetTypeNotAssigned" /></>;
            }
            isTrue = !hasDealerRentStartDate && hasFleetType;
        }
        resultObj.toolTipText = toolTipText;
        resultObj.isTrue = isTrue;
        return resultObj;
    };
    handleClick = () => {
        this.setState({
            showModal: true
        });
    };
    selectRecord = id => {
        // set state selected
        if (id) {
            this.setState({
                disabled: true
            });

            let data = [...this.state.data]
            let index = _.findIndex(data, { id: id });
            if (index >= 0) {
                data[index].selected = !data[index].selected;

                if (data[index].selected) {
                    this.state.selectedRecord.push(id);
                } else {
                    let existId = _.indexOf(this.state.selectedRecord, id);
                    this.state.selectedRecord.splice(existId, 1);
                }
            }
        }
    };
    selectAll = () => {
        let self = this;
        this.setState({ disabled: true });
        if (this.state.selectedRecord.length !== this.state.data.length) {
            _.each(this.state.data, data => {
                data.selected = true;
                let existId = _.indexOf(self.state.selectedRecord, data.id);
                if (existId < 0) {
                    self.state.selectedRecord.push(data.id);
                    self.setState({ selectAll: true })
                }
            });
        } else {
            this.setState({
                selectedRecord: [],
                selectAll: false
            });
            _.each(this.state.data, data => {
                data.selected = false;
            });
        }
    };
    handleSubmit = data => {
        let obj = {};
        obj.ids = this.state.selectedRecord;
        obj.isActive = data;
        let self = this;
        let url, reqObj = {};
        if (this.state.selectAll) {
            url = "/admin/vehicle/all-active-deactive";
            reqObj.isActive = data;
        } else {
            url = "/admin/vehicle/active-deactive";
            reqObj = obj;
        }
        axios
            .put(url, reqObj)
            .then(data => {
                if (data.code === "OK") {
                    _.each(this.state.data, val => {
                        val.selected = false;
                    });
                    message.success(data.message);
                    this.setState(
                        state => {
                            state.data = [];
                            state.selectedRecord = [];
                            state.selectAll = false;
                        },
                        () => {
                            self.props.fetch();
                        }
                    );
                }
            })
            .catch(error => {
                console.log("Error****:", error.message);
            });
        this.handleCancel();
    };
    handleCancel = () => {
        this.setState({
            showModal: false,
            disabled: false,
            selectAll: false
        });
    };
    handleStopRide = () => {
        let obj = {};
        obj.ids = this.state.selectedRecord;
        let self = this;
        let reqObj;
        if (this.state.selectAll) {
            reqObj = {};
        } else {
            reqObj = obj;
        }
        axios
            .put("/admin/vehicle/all-ride-stop", reqObj)
            .then(data => {
                if (data.code === "OK") {
                    _.each(this.state.data, val => {
                        val.selected = false;
                    });
                    message.success(data.message);
                    this.setState(
                        state => {
                            state.data = [];
                            state.selectedRecord = [];
                            state.selectAll = false;
                        },
                        () => {
                            self.props.fetch();
                        }
                    );
                }
            })
            .catch(error => {
                console.log("Error****:", error.message);
            });
    }

    render() {
        const {
            vehicleViewPermission,
            filter,
            loading,
            auth
        } = this.props;
        const {
            data,
            showQrView,
            qrNumber,
            taskmodel,
            taskVehicleId,
            nestListModal
        } = this.state;
        let menuPermission = auth.authUser.accessPermission;
        let indexes = _.findIndex(menuPermission, {
            module: Number(PAGE_PERMISSION.CREATE_TASK)
        });
        let hasTaskCreatePermission =
            menuPermission[indexes] &&
            menuPermission[indexes].permissions &&
            menuPermission[indexes].permissions.insert;
        let totalSelectedData = this.state.selectedRecord.length === data.length ? this.state.total : this.state.selectedRecord.length;
        return (
            <>
                <List
                    itemLayout="horizontal"
                    dataSource={data}
                    loading={loading}
                    renderItem={item => {
                        let rentStartDateMsgObj = this.getRentStartDateMsg(
                            item
                        );

                        return (
                            <List.Item className={item.selected ? "list-item-selected" : ""}>
                                <div className="ant-list-item-meta">
                                    <div
                                        className="totalRideCounter ant-list-item-meta-avatar gx-pointer"
                                        onClick={this.selectRecord.bind(
                                            this,
                                            item.id
                                        )}
                                    >
                                        <span className="ant-avatar ant-avatar-circle ant-avatar-image gx-pointer">
                                            {item.selected ? (
                                                <SelectCheck />
                                            ) : (
                                                    <div className="scooterIdRound" style={{ height: 70, paddingTop: 13 }}>
                                                        <h3 style={{ marginBottom: -5 }}>{item.registerId}</h3>
                                                        <div className="lbl">
                                                            <IntlMessages id="app.scooterId" />
                                                        </div>
                                                    </div>
                                                )}
                                        </span>
                                    </div>
                                    <div className="ant-list-item-meta-content">
                                        <div className="ant-list-item-meta">
                                            <div className="ant-list-item-meta-description m-r-20">
                                                <b>{item.name} </b>{" "}
                                                {FRANCHISEE_VISIBLE && auth.authUser.type !== USER_TYPES.DEALER &&
                                                    item.franchiseeId &&
                                                    item.franchiseeId.name &&
                                                    !this.props.page ? (
                                                        <FranchiseeName
                                                            name={
                                                                item.franchiseeId
                                                                    .name
                                                            }
                                                            userId={
                                                                item.franchiseeId.id
                                                            }
                                                        />
                                                    ) : (
                                                        ""
                                                    )}
                                                {CLIENT_VISIBLE &&
                                                    auth.authUser.type !==
                                                    USER_TYPES.DEALER &&
                                                    item.dealerId &&
                                                    item.dealerId.name && (
                                                        <DealerName
                                                            name={
                                                                item.dealerId
                                                                    .name
                                                            }
                                                            userId={
                                                                item.dealerId.id
                                                            }
                                                            authUser={auth.authUser}
                                                        />
                                                    )}
                                                <Battery
                                                    batteryLevel={
                                                        item.batteryLevel
                                                    }
                                                />
                                                {ADD_VEHICLE_INTO_NEST &&
                                                    item.nestId !== null && (
                                                        <span
                                                            style={{
                                                                marginLeft: 10
                                                            }}
                                                        >
                                                            {`${NEST_LABEL}`}:{" "}
                                                            <b>
                                                                {" "}
                                                                {item.nestId &&
                                                                    item.nestId.name
                                                                    ? item
                                                                        .nestId
                                                                        .name
                                                                    : ""}
                                                            </b>
                                                        </span>
                                                    )}
                                            </div>
                                            <div className="ant-list-item-meta-description m-r-20">
                                                {RENTAL_VISIBLE &&
                                                    item.franchiseeId !==
                                                    null && (
                                                        <ESToolTip
                                                            placement="top"
                                                            text={
                                                                rentStartDateMsgObj.toolTipText
                                                            }
                                                        >
                                                            <Icon
                                                                type="info-circle-o"
                                                                style={{
                                                                    color: rentStartDateMsgObj.isTrue
                                                                        ? "green"
                                                                        : "red"
                                                                }}
                                                            />
                                                        </ESToolTip>
                                                    )}
                                            </div>
                                            <div className="ant-list-item-meta-description">
                                                {!item.isRideCompleted ? (
                                                    <Tag color="green">
                                                        <IntlMessages id="app.running" />
                                                    </Tag>
                                                ) : null}
                                            </div>

                                            <div className="ant-list-item-meta-description">
                                                <div className="connectionStatus">
                                                    <div className="lbl">
                                                        {item.connectionStatus ? (
                                                            <Tag color="green">
                                                                <IntlMessages id="app.connected" />
                                                            </Tag>
                                                        ) : (
                                                                <Tag color="red">
                                                                    <IntlMessages id="app.notConnected" />
                                                                </Tag>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="ant-list-item-meta-content">
                                            <div className="gx-flex-row d-block-xs">
                                                {item.type !== VEHICLE_TYPES.BICYCLE &&
                                                    < div className="ant-list-item-meta-description m-r-20">
                                                        <Speed />
                                                        <IntlMessages id="app.maxSpeedLimit" />: &nbsp;
                                                        <b>
                                                            {item.maxSpeedLimit && item.maxSpeedLimit.actualValue ?
                                                                <>
                                                                    {UtilService.displayNumber(item.maxSpeedLimit.actualValue)}{DEFAULT_DISTANCE_UNIT}/hour
                                                            </>
                                                                : <>{UtilService.displayNumber(20)}{DEFAULT_DISTANCE_UNIT}/hour </>
                                                            }{" "}

                                                        </b>
                                                    </div>
                                                }
                                                <div className="ant-list-item-meta-description">
                                                    <Kms /> <IntlMessages id="app.total" />{" "}
                                                    {DEFAULT_DISTANCE_UNIT}:
                                                    &nbsp;
                                                    <b>
                                                        {item.vehicleRideSummary
                                                            ? `
                                                            ${UtilService.displayNumber(
                                                                item
                                                                    .vehicleRideSummary
                                                                    .totalKm
                                                            )} ${DEFAULT_DISTANCE_UNIT}`
                                                            : `0 ${DEFAULT_DISTANCE_UNIT}`}
                                                    </b>
                                                </div>
                                                {/* <div className="ant-list-item-meta-description">
                                        <div className="connectionStatus">
                                            Last Checked: <b>{UtilService.displayDate(item.lastConnectionCheckDateTime)}</b>
                                        </div>
                                    </div> */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="cardRightThumb">
                                        <div className="cardRightContainer flex-align-center">
                                            {/* <div className="battery">
                                        <div className={"battery-level " + (this.state.battery === 50 ? (item.batteryLevel < 50 ? "alert" : " ") : (item.batteryLevel < (this.state.battery / 2) ? "alert" : (item.batteryLevel < this.state.battery ? "warn" : " ")))} style={{ height: `${item.batteryLevel}%` }}></div>
                                        <p style={{ marginTop: '27px', fontSize: '13px', marginLeft: '-8px' }}><b>{item.batteryLevel}%</b></p>
                                    </div> */}
                                            {item.hasOwnProperty(
                                                "lockStatus"
                                            ) && (
                                                    <div className="ant-list-item-meta-description">
                                                        <div className="connectionStatus lbl">
                                                            {item.lockStatus ? (
                                                                <div className="lock_icon_block lock_block">
                                                                    <Lock />
                                                                </div>
                                                            ) : (
                                                                    <div className="lock_icon_block unlock_block">
                                                                        <UnLock />
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </div>
                                                )}
                                            <div className="cardRightThumb">
                                                <div className="cardRightContainer">
                                                    <div className="totalRideCounter">
                                                        <div>
                                                            <h2>
                                                                {item.vehicleRideSummary
                                                                    ? item
                                                                        .vehicleRideSummary
                                                                        .totalRide
                                                                    : "0"}
                                                            </h2>
                                                            <div className="lbl">
                                                                {item
                                                                    .vehicleRideSummary
                                                                    .totalRide >
                                                                    1
                                                                    ? <IntlMessages id="app.rides" />
                                                                    : <IntlMessages id="app.ride" />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="action-btnsWithSignupDate">
                                                        <div className="ActionNotification">
                                                            <ActiveDeactive
                                                                onSuccess={() =>
                                                                    this.props.fetch()
                                                                }
                                                                key={item.id}
                                                                documentId={
                                                                    item.id
                                                                }
                                                                isActive={
                                                                    item.isActive
                                                                }
                                                                model="vehicle"
                                                            />
                                                            <div className="scooterActionItem">
                                                                {(!this.props.page || PARTNER_WITH_CLIENT_FEATURE) &&
                                                                    (
                                                                        <ActionButtons
                                                                            view={this.props.vehicleDetails.bind(this,
                                                                                item.id,
                                                                                vehicleViewPermission
                                                                            )}
                                                                            pageId={
                                                                                PAGE_PERMISSION.VEHICLES
                                                                            }
                                                                            edit={`/e-scooter/vehicle/upsert/${
                                                                                item.id
                                                                                }`}
                                                                            filter={
                                                                                filter
                                                                            }
                                                                        />
                                                                    )}
                                                                <div className="scooterIC">
                                                                    <a
                                                                        href="/#"
                                                                        onClick={e => {
                                                                            e.preventDefault();
                                                                            this.viewQrCode(
                                                                                item.qrNumber
                                                                            );
                                                                        }}
                                                                    >
                                                                        <ESToolTip
                                                                            placement="top"
                                                                            text={<IntlMessages id="app.vehicle.scanQRCode" />}
                                                                        >
                                                                            <Icon type="qrcode" />
                                                                        </ESToolTip>
                                                                    </a>
                                                                </div>
                                                                {TASK_MODULE_VISIBLE &&
                                                                    hasTaskCreatePermission && (
                                                                        <div className="scooterIC">
                                                                            <a
                                                                                href="/#"
                                                                                onClick={e => {
                                                                                    e.preventDefault();
                                                                                    this.viewTaskModel(
                                                                                        item.id
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <ESToolTip
                                                                                    placement="top"
                                                                                    text={<IntlMessages id="app.vehicle.createTask" />}
                                                                                >
                                                                                    <Icon type="plus" />
                                                                                </ESToolTip>
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                {(ADD_VEHICLE_INTO_NEST) &&
                                                                    <div className="scooterIC">
                                                                        {item.nestId ?
                                                                            <a href="/#" onClick={(e) => {
                                                                                e.preventDefault();
                                                                                this.retainVehicle(item.id)
                                                                            }}>
                                                                                <ESToolTip placement="top" text={<><IntlMessages id="app.vehicle.retainVehicleFrom" />{NEST_LABEL}</>}>
                                                                                    <Icon type="rollback" />
                                                                                </ESToolTip>
                                                                            </a>
                                                                            : <a href="/#" onClick={(e) => {
                                                                                e.preventDefault();
                                                                                this.assignVehicle(item.id)
                                                                            }}>
                                                                                <ESToolTip placement="top" text={<><IntlMessages id="app.vehicle.moveVehicleTo" />{NEST_LABEL}</>}>
                                                                                    <Icon type="man" />
                                                                                </ESToolTip>
                                                                            </a>}
                                                                    </div>}
                                                                <div className="scooterIC">
                                                                    {item.currentLocation ? (
                                                                        <a
                                                                            href="/#"
                                                                            onClick={e => {
                                                                                e.preventDefault();
                                                                                this.handelLocation(
                                                                                    item
                                                                                        .currentLocation
                                                                                        .coordinates
                                                                                );
                                                                            }}
                                                                        >
                                                                            <ESToolTip
                                                                                placement="top"
                                                                                text={<IntlMessages id="app.vehicle.vehicleLocation" />}
                                                                            >
                                                                                <Icon type="environment" />
                                                                            </ESToolTip>
                                                                        </a>
                                                                    ) : (
                                                                            <div
                                                                                style={{
                                                                                    width:
                                                                                        "38px"
                                                                                }}
                                                                            />
                                                                        )}
                                                                </div>
                                                                {this.props.page && (
                                                                    <div className="scooterIC">
                                                                        <a
                                                                            href="/#"
                                                                            onClick={e => {
                                                                                e.preventDefault();
                                                                                this.props.retainVehicle(
                                                                                    item
                                                                                );
                                                                            }}
                                                                        >
                                                                            <Icon type="rollback" />
                                                                        </a>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="signupDate">
                                                            <IntlMessages id="app.lastConnected" />:{" "}
                                                            <b>
                                                                {UtilService.displayDate(
                                                                    item.lastConnectedDateTime
                                                                )}{" "}
                                                            </b>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {item.vehicleRideSummary.status ===
                                        RIDE_STATUS.ON_GOING ? (
                                            <>
                                                <Divider type="horizontal" />
                                                <div className="ant-list-item-meta">
                                                    <div className="ant-list-item-meta-description m-r-20">
                                                        <User />
                                                        {`${
                                                            item.vehicleRideSummary
                                                                .currentRiderDetail
                                                                .userId.firstName
                                                            } ${
                                                            item.vehicleRideSummary
                                                                .currentRiderDetail
                                                                .userId.lastName
                                                            }`}
                                                    </div>
                                                    <div className="ant-list-item-meta-description m-r-20">
                                                        <IntlMessages id="app.total" />{" "}
                                                        {DEFAULT_DISTANCE_UNIT}{" "}
                                                        <IntlMessages id="app.ride" />:{" "}
                                                        {
                                                            item.vehicleRideSummary
                                                                .currentRiderDetail
                                                                .estimateKm
                                                        }{" "}
                                                        {DEFAULT_DISTANCE_UNIT}
                                                    </div>
                                                    {/* <div className="ant-list-item-meta-description">
                                            From:    <RightArrow />       To :
                                    </div> */}
                                                </div>
                                            </>
                                        ) : null}
                                </div>
                            </List.Item>
                        );
                    }}
                />
                {showQrView && (
                    <ESQrCode
                        qrNumber={qrNumber}
                        visible={showQrView}
                        onCancel={() => this.handleViewCancel()}
                    />
                )}
                {taskmodel && (
                    <ESCreateTask
                        visible={taskmodel}
                        id={taskVehicleId}
                        onCancel={() => this.handleTaskCancel()}
                        onSubmit={() => this.handleSubmitTask()}
                    />
                )}
                {nestListModal && (
                    <ESAssignVehicleToNest
                        vehicleId={this.state.nestVehicleId}
                        onCancel={() => this.handleNestModalCancel()}
                        onSubmit={() => this.handleSubmitNestModal()}
                    />
                )}
                {this.state.selectedRecord.length > 0 ? (
                    <div className="selectOptionBottom">
                        <div className="selectRideOptions">
                            <div className="selectAllOption">
                                <a href="/#" onClick={(e) => { e.preventDefault(); this.selectAll() }} >
                                    {this.state.selectedRecord.length === data.length
                                        ? <><IntlMessages id="app.rider.deselectAll" /> Vehicle </>
                                        : <><IntlMessages id="app.rider.selectAll" /> Vehicle </>
                                    }
                                </a>
                                <span style={{ color: "#fff" }}> &nbsp;( {totalSelectedData} selected )</span>
                                <Button
                                    type="primary"
                                    onClick={this.handleClick}
                                >
                                    <IntlMessages id="app.activeDeactive" />
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={this.handleStopRide}
                                >
                                    Stop Ride
                                </Button>
                                {this.state.showModal ? (
                                    <ActionButton
                                        onCreate={this.handleSubmit}
                                        onCancel={this.handleCancel}
                                    />
                                ) : null}
                            </div>
                        </div>
                    </div>
                ) : null}
            </>
        );
    }
}
const mapStateToProps = function (props) {
    return props;
};
export default connect(mapStateToProps)(VehicleList);
