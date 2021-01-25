/* eslint-disable max-lines-per-function */
import {
    Avatar, Card, Dropdown, Icon, Input, Menu, Row
} from 'antd';
import React, { Component } from 'react';
import { ReactComponent as Email } from '../../assets/svg/email.svg';
import { ReactComponent as Mobile } from '../../assets/svg/mobile.svg';
const { Search } = Input;
const menu =
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
    </Menu>;
    
class Payment extends Component {
    render() {
        
        return (
            <div className="gx-module-box gx-mw-100">
                <div className="gx-module-box-header">
                    <Row type="flex" align="middle" justify="space-between">
                        <h1 className="pageHeading">Payments</h1>
                        <div className="SearchBarwithBtn">
                            <Search placeholder="Search Request" onSearch={this.onSearch} style={{ width: 300 }} />
                        </div>
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
                        <div className="box-HeaderRightSide">
                            <div className="datePickerPayment"></div>
                            <div className="paymentPagination"></div>
                            <div className="paymentFilter"></div>
                        </div>
                    </Row>
                </div>
                <div className="paymentHistory">
                    <Card>
                        <div className="paymentCommon">
                            <Avatar size={64} icon="user" />
                            <div className="paymentUsersDetail">
                                <div className="paymentUsersDetailTop">
                                    <h3>Naomi Woods</h3>
                                    <div className="moneySender">
                                        <div className="moneyLabel">Send Money to :</div>
                                        <div className="moneySenderName">Scarlett Walters</div>
                                    </div>
                                    <a className="btnRemark">View Remark</a>
                                </div>
                                <div className="paymentUsersDetailBottom">
                                    <div className="moneySender">
                                        <div className="moneyLabel">Ride Request no. :</div>
                                        <div className="moneySenderName">JOB000386REQ</div>
                                    </div>
                                    <div className="moneySender">
                                        <div className="moneyLabel"><Mobile /></div>
                                        <div className="moneySenderName">(442)-170-4039</div>
                                    </div>
                                    <div className="moneySender">
                                        <div className="moneyLabel"><Email /></div>
                                        <div className="moneySenderName">sonia.montgomery54@example.com</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="paymentAmountDate">
                            <h3 className="addMoney">425.35 $</h3>
                            <p>13 March 2019</p>
                        </div>
                    </Card>
                    <Card>
                        <div className="paymentCommon">
                            <Avatar size={64} style={{ color: '#5cc395', backgroundColor: '#e2faff' }}>U</Avatar>
                            <div className="paymentUsersDetail">
                                <div className="paymentUsersDetailTop">
                                    <h3>Naomi Woods</h3>
                                    <div className="moneySender">
                                        <div className="moneyLabel">Send Money to :</div>
                                        <div className="moneySenderName">Scarlett Walters</div>
                                    </div>
                                    <a className="btnRemark">View Remark</a>
                                </div>
                                <div className="paymentUsersDetailBottom">
                                    <div className="moneySender">
                                        <div className="moneyLabel">Ride Request no. :</div>
                                        <div className="moneySenderName">JOB000386REQ</div>
                                    </div>
                                    <div className="moneySender">
                                        <div className="moneyLabel"><Mobile /></div>
                                        <div className="moneySenderName">(442)-170-4039</div>
                                    </div>
                                    <div className="moneySender">
                                        <div className="moneyLabel"><Email /></div>
                                        <div className="moneySenderName">sonia.montgomery54@example.com</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="paymentAmountDate">
                            <h3 className="cutMoney">- 1275.90 $</h3>
                            <p>13 March 2019</p>
                        </div>
                    </Card>
                    <Card>
                        <div className="paymentCommon">
                            <Avatar size={64} icon="user" />
                            <div className="paymentUsersDetail">
                                <div className="paymentUsersDetailTop">
                                    <h3>Naomi Woods</h3>
                                    <div className="moneySender">
                                        <div className="moneyLabel">Send Money to :</div>
                                        <div className="moneySenderName">Scarlett Walters</div>
                                    </div>
                                    <a className="btnRemark">View Remark</a>
                                </div>
                                <div className="paymentUsersDetailBottom">
                                    <div className="moneySender">
                                        <div className="moneyLabel">Ride Request no. :</div>
                                        <div className="moneySenderName">JOB000386REQ</div>
                                    </div>
                                    <div className="moneySender">
                                        <div className="moneyLabel"><Mobile /></div>
                                        <div className="moneySenderName">(442)-170-4039</div>
                                    </div>
                                    <div className="moneySender">
                                        <div className="moneyLabel"><Email /></div>
                                        <div className="moneySenderName">sonia.montgomery54@example.com</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="paymentAmountDate">
                            <h3 className="addMoney">425.35 $</h3>
                            <p>13 March 2019</p>
                        </div>
                    </Card>
                    <Card>
                        <div className="paymentCommon">
                            <Avatar size={64} icon="user" />
                            <div className="paymentUsersDetail">
                                <div className="paymentUsersDetailTop">
                                    <h3>Naomi Woods</h3>
                                    <div className="moneySender">
                                        <div className="moneyLabel">Send Money to :</div>
                                        <div className="moneySenderName">Scarlett Walters</div>
                                    </div>
                                    <a className="btnRemark">View Remark</a>
                                </div>
                                <div className="paymentUsersDetailBottom">
                                    <div className="moneySender">
                                        <div className="moneyLabel">Ride Request no. :</div>
                                        <div className="moneySenderName">JOB000386REQ</div>
                                    </div>
                                    <div className="moneySender">
                                        <div className="moneyLabel"><Mobile /></div>
                                        <div className="moneySenderName">(442)-170-4039</div>
                                    </div>
                                    <div className="moneySender">
                                        <div className="moneyLabel"><Email /></div>
                                        <div className="moneySenderName">sonia.montgomery54@example.com</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="paymentAmountDate">
                            <h3 className="cutMoney">- 1275.90 $</h3>
                            <p>13 March 2019</p>
                        </div>
                    </Card>
                    <Card>
                        <div className="paymentCommon">
                            <Avatar size={64} icon="user" />
                            <div className="paymentUsersDetail">
                                <div className="paymentUsersDetailTop">
                                    <h3>Naomi Woods</h3>
                                    <div className="moneySender">
                                        <div className="moneyLabel">Send Money to :</div>
                                        <div className="moneySenderName">Scarlett Walters</div>
                                    </div>
                                    <a className="btnRemark">View Remark</a>
                                </div>
                                <div className="paymentUsersDetailBottom">
                                    <div className="moneySender">
                                        <div className="moneyLabel">Ride Request no. :</div>
                                        <div className="moneySenderName">JOB000386REQ</div>
                                    </div>
                                    <div className="moneySender">
                                        <div className="moneyLabel"><Mobile /></div>
                                        <div className="moneySenderName">(442)-170-4039</div>
                                    </div>
                                    <div className="moneySender">
                                        <div className="moneyLabel"><Email /></div>
                                        <div className="moneySenderName">sonia.montgomery54@example.com</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="paymentAmountDate">
                            <h3 className="addMoney">425.35 $</h3>
                            <p>13 March 2019</p>
                        </div>
                    </Card>
                    <Card>
                        <div className="paymentCommon">
                            <Avatar size={64} icon="user" />
                            <div className="paymentUsersDetail">
                                <div className="paymentUsersDetailTop">
                                    <h3>Naomi Woods</h3>
                                    <div className="moneySender">
                                        <div className="moneyLabel">Send Money to :</div>
                                        <div className="moneySenderName">Scarlett Walters</div>
                                    </div>
                                    <a className="btnRemark">View Remark</a>
                                </div>
                                <div className="paymentUsersDetailBottom">
                                    <div className="moneySender">
                                        <div className="moneyLabel">Ride Request no. :</div>
                                        <div className="moneySenderName">JOB000386REQ</div>
                                    </div>
                                    <div className="moneySender">
                                        <div className="moneyLabel"><Mobile /></div>
                                        <div className="moneySenderName">(442)-170-4039</div>
                                    </div>
                                    <div className="moneySender">
                                        <div className="moneyLabel"><Email /></div>
                                        <div className="moneySenderName">sonia.montgomery54@example.com</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="paymentAmountDate">
                            <h3 className="cutMoney">- 1275.90 $</h3>
                            <p>13 March 2019</p>
                        </div>
                    </Card>
                    <Card>
                        <div className="paymentCommon">
                            <Avatar size={64} icon="user" />
                            <div className="paymentUsersDetail">
                                <div className="paymentUsersDetailTop">
                                    <h3>Naomi Woods</h3>
                                    <div className="moneySender">
                                        <div className="moneyLabel">Send Money to :</div>
                                        <div className="moneySenderName">Scarlett Walters</div>
                                    </div>
                                    <a className="btnRemark">View Remark</a>
                                </div>
                                <div className="paymentUsersDetailBottom">
                                    <div className="moneySender">
                                        <div className="moneyLabel">Ride Request no. :</div>
                                        <div className="moneySenderName">JOB000386REQ</div>
                                    </div>
                                    <div className="moneySender">
                                        <div className="moneyLabel"><Mobile /></div>
                                        <div className="moneySenderName">(442)-170-4039</div>
                                    </div>
                                    <div className="moneySender">
                                        <div className="moneyLabel"><Email /></div>
                                        <div className="moneySenderName">sonia.montgomery54@example.com</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="paymentAmountDate">
                            <h3 className="addMoney">425.35 $</h3>
                            <p>13 March 2019</p>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }
}


export default Payment;
