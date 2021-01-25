import React, { Component } from "react";
import { Row, Col } from 'antd';
import { Input } from 'antd';
import { Button } from 'antd';
import { Menu, Dropdown, Icon } from 'antd';
import { Card } from 'antd';
import { ReactComponent as Info } from './info.svg';
import { ReactComponent as RightArrow } from './right-arrow.svg';
import { ReactComponent as Battery } from './battery.svg';
import { ReactComponent as ChangePassword } from './change-password.svg';
import { ReactComponent as Delete } from './delete.svg';
import { ReactComponent as Edit } from './edit.svg';
const { Search } = Input;
const ButtonGroup = Button.Group;
const menu = (
    <Menu>
        <Menu.Item key="0" className={'active-selectDropdown'}>
            <a>First Name</a>
            <Icon type="check" />
        </Menu.Item>
        <Menu.Item key="1">
            <a>Last Name</a>
        </Menu.Item>
        <Menu.Item key="2">
            <a>Signup Date</a>
        </Menu.Item>
        <Menu.Item key="3">
            <a>Highest Completed Rides</a>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="5" className={'active-selectDropdown'}>
            <a>Ascending</a>
            <Icon type="check" />
        </Menu.Item>
        <Menu.Item key="6">
            <a>Descending</a>
        </Menu.Item>
    </Menu>
);
class Rides extends Component {
    render() {

        return (
            <div className="gx-module-box gx-mw-100">
                <Row gutter={8}>
                    <Col span={12}>
                        <div className="gx-module-box-header" style={{ paddingBottom: 0 }}>
                            <Row type="flex" align="middle" justify="space-between">
                                <h1 className="pageHeading">Rides</h1>
                            </Row>
                            <Row type="flex" align="middle" justify="space-between" style={{ marginTop: 20 }}>
                                <div className="DropdownWidth">
                                    <div className="dropdownUis">
                                        Browse
                                        <Dropdown overlay={menu} trigger={['click']}>
                                            <a className="ant-dropdown-link" href="#">
                                                All Riders <Icon type="down" />
                                            </a>
                                        </Dropdown>
                                    </div>
                                    <div className="dropdownUis">
                                        Sort by
                                        <Dropdown overlay={menu} trigger={['click']}>
                                            <a className="ant-dropdown-link" href="#">
                                                First Name <Icon type="down" />
                                            </a>
                                        </Dropdown>
                                    </div>
                                </div>
                            </Row>
                            <Row type="flex" align="middle" justify="space-between">
                                <div className="SearchBarwithBtn riderSearchBar gx-mt-4">
                                    <Search placeholder="Search Riders" onSearch={value => console.log(value)} />
                                </div>
                            </Row>
                            <div className="gx-mt-3 ridesListingScroll">
                                <Card className="vehicleListing">
                                    <div className="vehicleTobContent">
                                        <div className="vehicleRiderName">
                                            <h3>Sherry Pierce</h3>
                                            <div className="rideFromToDetail">
                                                <div className="vehicleFrom">
                                                    <h4>05:00 PM</h4>
                                                    <div className="cureentCity">
                                                        San Francisco<br />USA
                                                    </div>
                                                </div>
                                                <div className="timeDurationVehicle">
                                                    <div className="timeCount">
                                                        1 Hour <Info />
                                                    </div>
                                                    <RightArrow />
                                                    <div className="timeStopTime">
                                                        Stop time
                                                    </div>
                                                </div>
                                                <div className="vehicleFrom vehicleRight">
                                                    <h4>05:00 PM</h4>
                                                    <div className="cureentCity">
                                                        San Francisco<br />USA
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="vehicleHorizontal"></div>
                                        <div className="vehicleRiderDetail">
                                            <div className="scooterID">
                                                <div className="lbl">Scooter ID</div>
                                                <div className="ids">#0254678977</div>
                                            </div>
                                            <div className="scooterID">
                                                <div className="powerIC"><Battery /></div>
                                                <div className="lbl powerLbl">Power</div>
                                                <div className="ids">27%</div>
                                            </div>
                                            <div className="scooterActionItem">
                                                <div className="scooterIC">
                                                    <a><Edit /></a>
                                                </div>
                                                <div className="scooterIC">
                                                    <a><Delete /></a>
                                                </div>
                                                <div className="scooterIC">
                                                    <a><ChangePassword /></a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="shaprateVerticle"></div>
                                    <div className="VehicleCardFooter">
                                        <div className="totalLabel">
                                            Total Km Ride: <span className="darkLabel"> 6 </span> (Booked: 10Km)
                                        </div>
                                        <div className="totalLabel">
                                            Total Chanrges : <span className="darkLabel"> $200 apx.</span>
                                        </div>
                                    </div>
                                </Card>
                                <Card className="vehicleListing">
                                    <div className="vehicleTobContent">
                                        <div className="vehicleRiderName">
                                            <h3>Tracy Robinson</h3>
                                            <div className="rideFromToDetail">
                                                <div className="vehicleFrom">
                                                    <h4>05:00 PM</h4>
                                                    <div className="cureentCity">
                                                        San Francisco<br />USA
                                                    </div>
                                                </div>
                                                <div className="timeDurationVehicle">
                                                    <div className="timeCount">
                                                        1 Hour <Info />
                                                    </div>
                                                    <RightArrow />
                                                    <div className="timeStopTime">
                                                        Stop time
                                                    </div>
                                                </div>
                                                <div className="vehicleFrom vehicleRight">
                                                    <h4>05:00 PM</h4>
                                                    <div className="cureentCity">
                                                        San Francisco<br />USA
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="vehicleHorizontal"></div>
                                        <div className="vehicleRiderDetail">
                                            <div className="scooterID">
                                                <div className="lbl">Scooter ID</div>
                                                <div className="ids">#0254678977</div>
                                            </div>
                                            <div className="scooterID">
                                                <div className="powerIC"><Battery /></div>
                                                <div className="lbl powerLbl">Power</div>
                                                <div className="ids">27%</div>
                                            </div>
                                            <div className="scooterActionItem">
                                                <div className="scooterIC">
                                                    <a><Edit /></a>
                                                </div>
                                                <div className="scooterIC">
                                                    <a><Delete /></a>
                                                </div>
                                                <div className="scooterIC">
                                                    <a><ChangePassword /></a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="shaprateVerticle"></div>
                                    <div className="VehicleCardFooter">
                                        <div className="totalLabel">
                                            Total Km Ride: <span className="darkLabel"> 6 </span> (Booked: 10Km)
                                        </div>
                                        <div className="totalLabel">
                                            Total Chanrges : <span className="darkLabel"> $200 apx.</span>
                                        </div>
                                    </div>
                                </Card>
                                <Card className="vehicleListing">
                                    <div className="vehicleTobContent">
                                        <div className="vehicleRiderName">
                                            <h3>Gabriella Bowman</h3>
                                            <div className="rideFromToDetail">
                                                <div className="vehicleFrom">
                                                    <h4>05:00 PM</h4>
                                                    <div className="cureentCity">
                                                        San Francisco<br />USA
                                                    </div>
                                                </div>
                                                <div className="timeDurationVehicle">
                                                    <div className="timeCount">
                                                        1 Hour <Info />
                                                    </div>
                                                    <RightArrow />
                                                    <div className="timeStopTime">
                                                        Stop time
                                                    </div>
                                                </div>
                                                <div className="vehicleFrom vehicleRight">
                                                    <h4>05:00 PM</h4>
                                                    <div className="cureentCity">
                                                        San Francisco<br />USA
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="vehicleHorizontal"></div>
                                        <div className="vehicleRiderDetail">
                                            <div className="scooterID">
                                                <div className="lbl">Scooter ID</div>
                                                <div className="ids">#0254678977</div>
                                            </div>
                                            <div className="scooterID">
                                                <div className="powerIC"><Battery /></div>
                                                <div className="lbl powerLbl">Power</div>
                                                <div className="ids">27%</div>
                                            </div>
                                            <div className="scooterActionItem">
                                                <div className="scooterIC">
                                                    <a><Edit /></a>
                                                </div>
                                                <div className="scooterIC">
                                                    <a><Delete /></a>
                                                </div>
                                                <div className="scooterIC">
                                                    <a><ChangePassword /></a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="shaprateVerticle"></div>
                                    <div className="VehicleCardFooter">
                                        <div className="totalLabel">
                                            Total Km Ride: <span className="darkLabel"> 6 </span> (Booked: 10Km)
                                        </div>
                                        <div className="totalLabel">
                                            Total Chanrges : <span className="darkLabel"> $200 apx.</span>
                                        </div>
                                    </div>
                                </Card>
                                <Card className="vehicleListing">
                                    <div className="vehicleTobContent">
                                        <div className="vehicleRiderName">
                                            <h3>Tracy Robinson</h3>
                                            <div className="rideFromToDetail">
                                                <div className="vehicleFrom">
                                                    <h4>05:00 PM</h4>
                                                    <div className="cureentCity">
                                                        San Francisco<br />USA
                                                    </div>
                                                </div>
                                                <div className="timeDurationVehicle">
                                                    <div className="timeCount">
                                                        1 Hour <Info />
                                                    </div>
                                                    <RightArrow />
                                                    <div className="timeStopTime">
                                                        Stop time
                                                    </div>
                                                </div>
                                                <div className="vehicleFrom vehicleRight">
                                                    <h4>05:00 PM</h4>
                                                    <div className="cureentCity">
                                                        San Francisco<br />USA
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="vehicleHorizontal"></div>
                                        <div className="vehicleRiderDetail">
                                            <div className="scooterID">
                                                <div className="lbl">Scooter ID</div>
                                                <div className="ids">#0254678977</div>
                                            </div>
                                            <div className="scooterID">
                                                <div className="powerIC"><Battery /></div>
                                                <div className="lbl powerLbl">Power</div>
                                                <div className="ids">27%</div>
                                            </div>
                                            <div className="scooterActionItem">
                                                <div className="scooterIC">
                                                    <a><Edit /></a>
                                                </div>
                                                <div className="scooterIC">
                                                    <a><Delete /></a>
                                                </div>
                                                <div className="scooterIC">
                                                    <a><ChangePassword /></a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="shaprateVerticle"></div>
                                    <div className="VehicleCardFooter">
                                        <div className="totalLabel">
                                            Total Km Ride: <span className="darkLabel"> 6 </span> (Booked: 10Km)
                                        </div>
                                        <div className="totalLabel">
                                            Total Chanrges : <span className="darkLabel"> $200 apx.</span>
                                        </div>
                                    </div>
                                </Card>
                                <Card className="vehicleListing">
                                    <div className="vehicleTobContent">
                                        <div className="vehicleRiderName">
                                            <h3>Gabriella Bowman</h3>
                                            <div className="rideFromToDetail">
                                                <div className="vehicleFrom">
                                                    <h4>05:00 PM</h4>
                                                    <div className="cureentCity">
                                                        San Francisco<br />USA
                                                    </div>
                                                </div>
                                                <div className="timeDurationVehicle">
                                                    <div className="timeCount">
                                                        1 Hour <Info />
                                                    </div>
                                                    <RightArrow />
                                                    <div className="timeStopTime">
                                                        Stop time
                                                    </div>
                                                </div>
                                                <div className="vehicleFrom vehicleRight">
                                                    <h4>05:00 PM</h4>
                                                    <div className="cureentCity">
                                                        San Francisco<br />USA
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="vehicleHorizontal"></div>
                                        <div className="vehicleRiderDetail">
                                            <div className="scooterID">
                                                <div className="lbl">Scooter ID</div>
                                                <div className="ids">#0254678977</div>
                                            </div>
                                            <div className="scooterID">
                                                <div className="powerIC"><Battery /></div>
                                                <div className="lbl powerLbl">Power</div>
                                                <div className="ids">27%</div>
                                            </div>
                                            <div className="scooterActionItem">
                                                <div className="scooterIC">
                                                    <a><Edit /></a>
                                                </div>
                                                <div className="scooterIC">
                                                    <a><Delete /></a>
                                                </div>
                                                <div className="scooterIC">
                                                    <a><ChangePassword /></a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="shaprateVerticle"></div>
                                    <div className="VehicleCardFooter">
                                        <div className="totalLabel">
                                            Total Km Ride: <span className="darkLabel"> 6 </span> (Booked: 10Km)
                                        </div>
                                        <div className="totalLabel">
                                            Total Chanrges : <span className="darkLabel"> $200 apx.</span>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </Col>
                    <Col span={12}>
                        <div className="mapView">
                            <img alt="" src={require("assets/images/map.jpg")} />
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}


export default (Rides);
