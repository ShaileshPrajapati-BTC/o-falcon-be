import { Col, Row, Card, message, Modal } from 'antd';
import React, { Component } from 'react';
import { IOT_COMMANDS, VEHICLE_TYPES, RIDE_STATUS } from '../../constants/Common';
import axios from 'util/Api';

import { ReactComponent as AlarmOn } from '../../assets/svg/iotButtons/AlarmOn.svg';
import { ReactComponent as AlarmOff } from '../../assets/svg/iotButtons/AlarmOff.svg';
import { ReactComponent as BatLock } from '../../assets/svg/iotButtons/BatLock.svg';
import { ReactComponent as BatUnlock } from '../../assets/svg/iotButtons/BatUnlock.svg';
import { ReactComponent as BleOn } from '../../assets/svg/iotButtons/BleOn.svg';
import { ReactComponent as BleOff } from '../../assets/svg/iotButtons/BleOff.svg';
import { ReactComponent as BuzzerOn } from '../../assets/svg/iotButtons/BuzzerOn.svg';
import { ReactComponent as BuzzerOff } from '../../assets/svg/iotButtons/BuzzerOff.svg';
import { ReactComponent as Config } from '../../assets/svg/iotButtons/Config.svg';
import { ReactComponent as GetLocation } from '../../assets/svg/iotButtons/GetLocation.svg';
import { ReactComponent as GetMT1 } from '../../assets/svg/iotButtons/GetMT1.svg';
import { ReactComponent as Group10086 } from '../../assets/svg/iotButtons/Group10086.svg';
import { ReactComponent as IdleLEDOn } from '../../assets/svg/iotButtons/IdleLEDOn.svg';
import { ReactComponent as IdleLEDOff } from '../../assets/svg/iotButtons/IdleLEDOff.svg';
import { ReactComponent as LightOn } from '../../assets/svg/iotButtons/LightOn.svg';
import { ReactComponent as LightOff } from '../../assets/svg/iotButtons/LightOff.svg';
import { ReactComponent as LineUnlock } from '../../assets/svg/iotButtons/LineUnlock.svg';
import { ReactComponent as Lock } from '../../assets/svg/iotButtons/Lock-Unlock.svg';
import { ReactComponent as Unlock } from '../../assets/svg/iotButtons/unlock.svg';
import { ReactComponent as PlayAudio } from '../../assets/svg/iotButtons/PlayAudio.svg';
import { ReactComponent as Reconnect } from '../../assets/svg/iotButtons/Reconnect.svg';
import { ReactComponent as Restart } from '../../assets/svg/iotButtons/Restart.svg';
import { ReactComponent as SetMaxSpeed } from '../../assets/svg/iotButtons/SetMaxSpeed.svg';
import { ReactComponent as SetPingInterval } from '../../assets/svg/iotButtons/SetPingInterval.svg';
import { ReactComponent as SetPlayAudio } from '../../assets/svg/iotButtons/SetPlayAudio.svg';
import { ReactComponent as SetRidePingInterval } from '../../assets/svg/iotButtons/SetRidePingInterval.svg';
import { ReactComponent as Union } from '../../assets/svg/iotButtons/Union.svg';
import { ReactComponent as UploadFiles } from '../../assets/svg/iotButtons/UploadFiles.svg';
import { ReactComponent as wheelLockUnlock } from '../../assets/svg/iotButtons/wheel-lock.svg';
import { ReactComponent as CableLockUnlock } from '../../assets/svg/iotButtons/cable-lock.svg';
import { ReactComponent as CableStatus } from '../../assets/svg/iotButtons/cable-lock-status.svg';
import { ReactComponent as BatteryLock } from '../../assets/svg/iotButtons/BatLock.svg';
import { ReactComponent as WheelLock } from '../../assets/svg/iotButtons/cable-lock.svg';
import { ReactComponent as CableLock } from '../../assets/svg/iotButtons/wheel-lock.svg';
import { ReactComponent as WheelStatus } from '../../assets/svg/iotButtons/wheel-lock-status.svg';
import { ReactComponent as BatteryStatus } from '../../assets/svg/iotButtons/bat-lock-status.svg';
import { ReactComponent as AnyCommand } from '../../assets/svg/iotButtons/SetPingInterval.svg';
import IntlMessages from '../../util/IntlMessages';


const _ = require('lodash');

class IotButtons extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    components = {
        AlarmOn: AlarmOn,
        AlarmOff: AlarmOff,
        AutoPlayEnable: SetPlayAudio,
        AutoPlayDisable: SetPlayAudio,
        Audiooff: PlayAudio,
        Playaudio: PlayAudio,
        PlayAudio: PlayAudio,
        BootOpen: Unlock, //
        BootClose: Lock, //
        Buzon: BuzzerOn,
        Buzoff: BuzzerOff,
        Bleoff: BleOff,
        Bleon: BleOn,
        Batunlock: BatUnlock,
        Batlock: BatLock,
        LightOn: LightOn,
        LightOff: LightOff,
        Listplay: Group10086,
        Lineunlock: LineUnlock,
        Lock: Lock,
        Unlock: Unlock,
        SetMaxSpeed: SetMaxSpeed,
        SetPingInterval: SetPingInterval,
        SetRidePingInterval: SetRidePingInterval,
        Start: SetMaxSpeed,
        Stop: SetMaxSpeed,
        Idleledon: IdleLEDOn,
        Idleledoff: IdleLEDOff,
        UploadFileToScooter: UploadFiles,
        Track: Reconnect,
        Locations: GetLocation,
        Restart: Restart,
        Getconfig: Config,
        Getmt1packet: GetMT1,
        Getmt2packet: GetMT1,
        Getmt5packet: GetMT1,
        Getmt6packet: GetMT1,
        wheelLockUnlock: wheelLockUnlock,
        CableLockUnlock: CableLockUnlock,
        CableStatus: CableStatus,
        WheelStatus: WheelStatus,
        BatteryStatus: BatteryStatus,
        BatteryLock: BatteryLock,
        WheelLock: WheelLock,
        CableLock: CableLock,
        AnyCommand: AnyCommand
    };

    returnComponent = icon => {
        const Tag = this.components[icon];
        return Tag ? <Tag /> : <Union />;
    };
    onLockUnlock = async (key) => {
        try {
            let obj = {};
            obj.vehicleId = this.props.vehicleRecord.id;
            obj.command = key;
            let response = await axios.post('admin/iot/lock-unlock', obj);
            message.success(response.message);
        } catch (error) {
            message.error(error.message);
        }
    }
    handleStopRide = async (rideId) => {
        try {
            let obj = {};
            obj.rideId = rideId;
            let response = await axios.post('admin/iot/stop-ride', obj);
            if (response && response.code === "OK") {
                message.success(response.message);
                this.props.handleFetch();
            } else {
                this.ConfirmationModal(rideId, response.message);
            }
        } catch (error) {
            this.ConfirmationModal(rideId, error.message);
        }
    }
    ConfirmationModal = (rideId, error) => {
        let title = <div>
            <b>Error: </b>{error}<br />
                Are you Sure to stop this ride forcefully!
            </div>;
        let self = this;
        Modal.confirm({
            title: title,
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk() {
                self.stopRideForceFully(rideId);
            }
        });
    }
    stopRideForceFully = async (rideId) => {
        try {
            let obj = {};
            obj.rideId = rideId;
            let response = await axios.post('admin/iot/stop-ride-force-fully', obj);
            if (response && response.code === "OK") {
                message.success(response.message);
                this.props.handleFetch();
            } else {
                message.error(response.message);
            }
        } catch (error) {
            message.error(error.message);
        }
    }
    render() {
        const { vehicleRecord } = this.props;

        return (
            <Card className="cardPaddingLess">
                <div className="cardInnerHead">
                    <h3 className="dashboardCardTitle gx-mb-4">
                        <IntlMessages id="app.vehicle.iotCommands" defaultMessage="Iot Commands" />
                                        </h3>
                </div>
                <Row className="IotCommands">
                    {
                        vehicleRecord.onGoingRide && vehicleRecord.onGoingRide.id ?
                            <Col>
                                <Card onClick={this.handleStopRide.bind(this, vehicleRecord.onGoingRide.id)} className="iot-card">
                                    {this.returnComponent('Stop')}
                                    <p>{vehicleRecord.onGoingRide.status === RIDE_STATUS.ON_GOING ? <IntlMessages id="app.vehicle.stopRide" defaultMessage="Stop Ride" /> : <IntlMessages id="app.vehicle.cancelRide" defaultMessage="Cancel Ride" />}</p>
                                </Card>
                            </Col> :
                            null
                    }
                    {
                        vehicleRecord.type == VEHICLE_TYPES.BIKE ? /*vehicleRecord.type !== VEHICLE_TYPES.BICYCLE*/
                            <Col>
                                <Card onClick={this.onLockUnlock.bind(this, 'lock')} className="iot-card">
                                    {this.returnComponent('Lock')}
                                    <p>{vehicleRecord.type === VEHICLE_TYPES.BIKE ? <IntlMessages id="app.vehicle.turnOff" defaultMessage="Turn Off" />  : <IntlMessages id="app.vehicle.lock" defaultMessage="Lock"/> }</p>
                                </Card>
                            </Col> :
                            null
                    }
                    <Col>
                        <Card onClick={this.onLockUnlock.bind(this, 'unlock')} className="iot-card">
                            {this.returnComponent('Unlock')}
                            <p>{vehicleRecord.type === VEHICLE_TYPES.BIKE ? <IntlMessages id="app.vehicle.turnOn" defaultMessage="Turn On"/> : <IntlMessages id="app.vehicle.unlock" defaultMessage="Unlock"/>}</p>
                        </Card>
                    </Col>
                    {
                        (vehicleRecord.manufacturer && vehicleRecord.manufacturer.code === 'ZIMO') ?
                            <>
                                <Col>
                                    <Card onClick={this.onLockUnlock.bind(this, 'start')} className="iot-card">
                                        {this.returnComponent('Start')}
                                        <p>Start</p>
                                    </Card>
                                </Col>
                                <Col>
                                    <Card onClick={this.onLockUnlock.bind(this, 'stop')} className="iot-card">
                                        {this.returnComponent('Stop')}
                                        <p>Stop</p>
                                    </Card>
                                </Col>
                            </> :
                            null
                    }
                    {vehicleRecord.manufacturer && _.map(IOT_COMMANDS[vehicleRecord.manufacturer.code], (item, index) => {
                        // if (item.types.indexOf(vehicleRecord.type) === -1) {
                        //     return;
                        // }

                        return (
                            <Col>
                                <Card onClick={this.props.handleAction.bind(this, item.command, item.isPopUp, index, item.isNewMethod, vehicleRecord.manufacturer.code)} className="iot-card">
                                    {this.returnComponent(item.icon)}
                                    <p>{(item.isPopUp && !item.isNewMethod) ? `Set ${item.label}` : item.label}</p>
                                </Card>
                            </Col>
                        );
                    })
                    }
                </Row>
            </Card>
        );
    }
}

export default IotButtons;
