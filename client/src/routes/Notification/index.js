import {
    DEFAULT_API_ERROR,
    FILTER_VISIBLE,
    FILTER_BY_VEHICLE_TYPE,
    DEFAULT_VEHICLE,
    FRANCHISEE_LABEL,
    USER_TYPES,
    DEALER_LABEL,
    NOTIFICATION_STATUS,
    PAGE_PERMISSION,
    LIVE_NOTIFICATION_TYPES_FILETR,
    SOCKET_CONNECTION,
    FRANCHISEE_VISIBLE,
    CLIENT_VISIBLE
} from "../../constants/Common";
import { DatePicker, Row, Table, message, Affix, Icon, Checkbox, Col, Button, Modal, Tag } from "antd";
import React, { Component } from "react";
// import { getFranchisee } from "../../appRedux/actions/franchisee";
import ESPagination from "../../components/ESPagination";
import FilterDropdown from "../../components/FilterDropdown";
import UtilService from "../../services/util";
import axios from "util/Api";
import { connect } from "react-redux";
import moment from "moment";
import update from "immutability-helper";
import ESAutoComplete from "../../components/ESAutoComplete";
import ESToolTip from "../../components/ESToolTip";
import { Link } from "react-router-dom";
import IntlMessages from "../../util/IntlMessages";
const _ = require("lodash");
const { RangePicker } = DatePicker;
const dateFormat = "YYYY/MM/DD";
let NOTIFICATION_TYPES = LIVE_NOTIFICATION_TYPES_FILETR;
let error = false;
class Notification extends Component {
    constructor(props) {
        super(props);
        let filter = {
            vehicleType: FILTER_BY_VEHICLE_TYPE[0].type
        };
        if (!FRANCHISEE_VISIBLE) {
            filter.franchiseeId = null;
        }
        if (!CLIENT_VISIBLE) {
            filter.dealerId = null;
        }
        this.state = {
            data: [],
            loading: false,
            total: 0,
            loginUser: this.props.auth && this.props.auth.authUser ? this.props.auth.authUser : null,
            filter: {
                page: 1,
                limit: 15,
                filter: filter
            },
            paginate: false,
            selectedRowKeys: [],
            newNotificationCount: 0
        };
        this.vehicleType = DEFAULT_VEHICLE;
        this.type = NOTIFICATION_TYPES[0].value;
        this.franchiseeId = 0;
        this.dealerId = 0;
    }
    componentDidMount() {
        this.fetch();
        this.initializeTableColumns();
        if (!SOCKET_CONNECTION) {
            return;
        }
        this.props.auth.socket.emit('getAdminNotificationCount');
        this.props.auth.socket.on('adminNotificationCount', ({ data }) => {
            data && this.setState({ newNotificationCount: data.count })
        });
    }

    /* listing start */
    fetch = async page => {
        this.setState({ loading: true });
        if (page) {
            this.setState(state => {
                state.filter.page = page;

                return state;
            });
        }
        try {
            let response = await axios.post(
                "admin/notification/paginate",
                this.state.filter
            );

            if (response.code === "OK") {
                this.setState({
                    total: response.data.count,
                    data: response.data.list,
                    paginate: true
                });
            } else {
                this.setState({
                    total: 0,
                    data: []
                });
            }
            this.setState({ loading: false });
        } catch (error) {
            let resp = (error && error.data) || { message: DEFAULT_API_ERROR };
            message.error(`${resp.message}`);
            this.setState({ loading: false });
        }
    };

    initializeTableColumns = () => {
        this.columns = [
            {
                title: <IntlMessages id="app.srNo" />,
                key: "index",
                render: (text, record, index) => {
                    return index + 1;
                }
            },
            {
                title: <IntlMessages id="app.notification.notification" />,
                dataIndex: "title",
                align: "center",
                render: (text, record) => {
                    let newNotification = record.status && record.status === NOTIFICATION_STATUS.SEND ? <Tag color="green"><IntlMessages id="app.notification.new" /></Tag> : '';
                    return <div>{record.title}<span style={{ marginLeft: 15 }}><b>{newNotification}</b></span></div>;
                }
            },
            {
                title: <IntlMessages id="app.notification.vehicleName" />,
                dataIndex: "vehicleId",
                align: "center",
                render: (text, record) => {
                    let url = `/e-scooter/vehicle-details/${record.vehicleId.id}`;
                    if (record.status === NOTIFICATION_STATUS.SEND) {
                        url += `?nId=${record.id}`;
                    }
                    return <Link to={url}>
                        <span style={{ color: '#545454' }}>
                            {record.vehicleId.name}
                        </span>
                    </Link>
                    // <a data-id={record.id} onClick={() => this.onRowClick(record)} style={{ color: '#545454' }}>{record.vehicleId.name}</a>;
                }
            },
            {
                title: <IntlMessages id="app.notification.date" />,
                dataIndex: "createdAt",
                align: "center",
                render: (text, record) => {
                    return (
                        <div>{UtilService.displayDate(record.createdAt)}</div>
                    );
                }
            },
            {
                title: <IntlMessages id="app.type" />,
                dataIndex: "type",
                align: "center",
                render: (text, record) => {
                    let res = NOTIFICATION_TYPES.find(e => {
                        return e.type === text;
                    });
                    let typeLabel = res ? res.label : "";

                    return <div>{typeLabel}</div>;
                }
            },
            {
                title: '',
                render: (text, record) => {
                    return (
                        record.status && record.status === NOTIFICATION_STATUS.SEND &&
                        <div className="scooterIC">
                            <a href="/#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    this.setMarkAsRead(record.id)
                                }}
                            >
                                <ESToolTip placement="top" text={<IntlMessages id="app.notification.markAsRead" />}>
                                    <Icon type="eye" />
                                </ESToolTip>
                            </a>
                        </div>
                    );
                }
            }
        ];
    };
    onRowClick = async (data) => {
        if (data.status === NOTIFICATION_STATUS.SEND) {
            await this.setMarkAsRead(data.id);
        }
        if (!error) {
            if (data.module === PAGE_PERMISSION.VEHICLES) {
                this.props.history.push(`/e-scooter/vehicle-details/${data.vehicleId.id}`);
            } else if (data.module === PAGE_PERMISSION.USERS) {
                this.props.history.push(`/e-scooter/users`);
            }
        }
    }
    setMarkAsRead = async (id) => {
        try {
            this.setState({ loading: true })
            let response = await axios.post(`admin/notification/read-notification`, { id: id });
            if (response.code === "OK") {
                message.success(response.message);
                this.fetch();
            } else {
                error = true;
                message.error(response.message);
            }
            this.setState({ loading: false });
        } catch (error) {
            let resp = (error && error.data) || { message: DEFAULT_API_ERROR };
            message.error(`${resp.message}`);
            this.setState({ loading: false });
        }
    }
    setMarkAsAllRead = async () => {
        let self = this;
        Modal.confirm({
            title: "Are you sure to mark as read all notifications!",
            okText: "Yes",
            cancelText: "No",
            onOk() {
                self.callApiForReadAll()
            }
        });
    }
    callApiForReadAll = async () => {
        try {
            this.setState({ loading: true })
            let response = await axios.post(`admin/notification/read-all-notification`);
            if (response.code === "OK") {
                message.success(response.message);
                this.fetch();
            } else {
                message.error(response.message);
            }
            this.setState({ loading: false });
        } catch (error) {
            let resp = (error && error.data) || { message: DEFAULT_API_ERROR };
            message.error(`${resp.message}`);
            this.setState({ loading: false });
        }
    }
    handleSelection = (selectedVal, key, listData) => {
        let obj = {
            selectedVal: selectedVal,
            key: key,
            listData: listData
        };
        let self = this;
        let data = UtilService.commonFilter(obj);
        self[key] = selectedVal;
        self.setState(state => {
            if (data !== "error") {
                state.filter.filter[key] = data.type;
            } else {
                delete state.filter.filter[key];
            }
        });

        self.setState(
            state => {
                state.filter.page = 1;
                state.paginate = false;
            },
            () => self.fetch()
        );
    };

    handlePageChange = page => {
        const newState = update(this.state, {
            filter: { page: { $set: page } }
        });

        this.setState(newState, () => {
            this.fetch();
        });
    };

    dateRangeSelect = record => {
        let filterObj = { page: 1, dateRange: undefined };

        if (record && record.length) {
            let from = record[0] ? record[0] : null;
            let to = record[1] ? record[1] : null;

            if (from && to) {
                filterObj.dateRange = {
                    startDate: UtilService.getStartOfTheDay(moment(from)
                        .startOf("day")
                        .toISOString()),
                    endDate: UtilService.getEndOfTheDay(moment(to)
                        .endOf("day")
                        .toISOString())
                };
            }
        }

        const newState = update(this.state, { filter: { $merge: filterObj } });
        this.setState(newState, () => {
            this.fetch();
        });
    };
    onSelect = (id) => {
        this.setState((state) => {
            if (id && FRANCHISEE_VISIBLE) {
                state.filter.filter.franchiseeId = id;
            } else {
                delete state.filter.filter.franchiseeId;
            }
        }, () => {
            this.fetch();
        });
    }

    render() {
        let { loginUser, selectedRowKeys, newNotificationCount } = this.state;
        let isFranchisee = loginUser && loginUser.type === USER_TYPES.FRANCHISEE;
        let isDealer = loginUser && loginUser.type === USER_TYPES.DEALER;
        let FilterArray = [
            {
                title: <IntlMessages id="app.vehicleType" />,
                list: FILTER_BY_VEHICLE_TYPE,
                defaultSelected: this.vehicleType,
                key: "vehicleType",
                visible: FILTER_VISIBLE
            }, {
                title: <IntlMessages id="app.type" />,
                list: NOTIFICATION_TYPES,
                defaultSelected: this.type,
                key: "type",
                visible: true
            }, {
                title: FRANCHISEE_LABEL,
                list: this.props.franchisee.franchisee,
                defaultSelected: this.franchiseeId,
                key: 'franchiseeId',
                visible: this.props.franchisee.franchisee.length > 2 && !isFranchisee && !isDealer && FRANCHISEE_VISIBLE
            }, {
                title: DEALER_LABEL,
                list: this.props.dealer.dealersList,
                defaultSelected: this.dealerId,
                key: 'dealerId',
                visible: this.props.dealer.dealersList.length > 2 && isFranchisee && CLIENT_VISIBLE
            }
        ];
        return (
            <div className="gx-module-box gx-mw-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <h1 className="pageHeading has-notification-count"><IntlMessages id="app.notification.notification" /><span className="tot">{newNotificationCount}</span></h1>
                            <div className="SearchBarwithBtn">
                                {FRANCHISEE_VISIBLE &&
                                    <ESAutoComplete url='admin/user/franchisee-list'
                                        onSelect={this.onSelect.bind(this)} />
                                }
                            </div>
                        </Row>
                        <Row
                            type="flex"
                            align="middle"
                            justify="space-between"
                            style={{ marginTop: 15 }}
                        >
                            <div className="DropdownWidth">
                                {FilterArray.map(filter => {
                                    return (
                                        filter.visible && (
                                            <FilterDropdown
                                                title1={filter.title}
                                                list={filter.list}
                                                key={filter.key}
                                                defaultSelected={
                                                    filter.defaultSelected
                                                }
                                                handleSelection={val => {
                                                    this.handleSelection(
                                                        val,
                                                        filter.key,
                                                        filter.list
                                                    );
                                                }}
                                            />
                                        )
                                    );
                                })}
                            </div>
                            <div className="graphFilterWithCalander gx-d-flex">
                                <div className="dateRanges">
                                    <RangePicker
                                        defaultValue={[
                                            moment().subtract(1, "months"),
                                            moment()
                                        ]}
                                        onChange={this.dateRangeSelect.bind(
                                            this
                                        )}
                                        format={dateFormat}
                                    />
                                </div>
                            </div>
                            {this.state.paginate ? (
                                <ESPagination
                                    limit={this.state.filter.limit}
                                    total={this.state.total}
                                    fetch={this.fetch.bind(this)}
                                />
                            ) : null}
                        </Row>
                        {_.isNumber(newNotificationCount) && newNotificationCount > 0 && <Row>
                            <Col span={24} className="gx-text-right" style={{ paddingTop: 10 }}>
                                <div className="topbarCommonBtn" style={{ float: 'right' }}>
                                    <Button type="primary" onClick={this.setMarkAsAllRead}><IntlMessages id="app.notification.markAllRead" /></Button>
                                </div>
                            </Col>
                        </Row>}
                    </div>
                </Affix>
                <div className="gx-module-box-content">
                    <div className="RidersList RiderTableList">
                        <Table
                            className="gx-table-responsive"
                            columns={this.columns}
                            loading={this.state.loading}
                            dataSource={this.state.data}
                            rowKey="id"
                            pagination={false}
                        />
                    </div>
                    {/* <List size="small"
                            loading={this.state.loading}
                            dataSource={this.state.data}
                            renderItem={(item) =>
                                <List.Item className="gx-pl-3 gx-pr-3">
                                    <List.Item.Meta
                                        title={item.title}
                                    />
                                    <div><Icon type="calendar" />
                                        {UtilService.displayDate(item.createdAt)}
                                    </div>
                                </List.Item>
                            }>
                        </List> */}
                </div>
            </div>
        );
    }
}

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(Notification);
