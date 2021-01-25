/* eslint-disable no-nested-ternary */
import { Affix, Button, DatePicker, Divider, Input, List, Row, Tag, Icon, Form, message } from 'antd';
import React, { Component } from 'react';
import {
    DEFAULT_VEHICLE,
    DISPUTE_STATUS_ARRAY,
    FILTER_BY_VEHICLE_TYPE,
    FILTER_VISIBLE,
    PAGE_PERMISSION,
    PRIORITY_FILTER,
    USER_TYPES,
    FRANCHISEE_LABEL,
    SORT_BY_REQUEST_DATE,
    QUESTION_TYPE,
    DEALER_LABEL,
    DEALER_ROUTE,
    RIDER_ROUTE,
    FRANCHISEE_ROUTE,
    GUEST_USER,
    FILTER_BY_DISPUTE_TYPES,
    FRANCHISEE_VISIBLE,
    CLIENT_VISIBLE,
    FILTER_BY_QUESTION_TYPES
} from '../../constants/Common';
import ESPagination from '../../components/ESPagination';
// import { getFranchisee } from '../../appRedux/actions/franchisee';
import FilterDropdown from '../../components/FilterDropdown';
import { ReactComponent as SelectCheck } from '../../assets/svg/selectCheck.svg';
import UpdateStatus from './updateStatus';
import AddService from './addServiceModel';
import AddButton from '../../components/ESAddButton';

import { ReactComponent as Email } from "../../assets/svg/email.svg";
import { ReactComponent as Mobile } from "../../assets/svg/mobile.svg";
import UpdatePriority from './updatePriority';
import UtilService from '../../services/util';
import axios from 'util/Api';
import Search from '../../components/ESSearch';
import { connect } from 'react-redux';
import UserId from '../CommonComponent/UserId';
import FranchiseeName from '../../components/ESFranchiseeName';
import ActivityTrack from './activityTrack';
import moment from "moment";
import ESToolTip from '../../components/ESToolTip';
import { Link } from 'react-router-dom';
import IntlMessages from '../../util/IntlMessages';
const { RangePicker } = DatePicker;
const _ = require('lodash');
const { TextArea } = Input;
const dateFormat = "DD/MM/YYYY";
class RideDispute extends Component {
    constructor(props) {
        super(props);
        let redirectFilter = this.props.location.filter;
        this.status = redirectFilter && redirectFilter.filter && redirectFilter.filter.status
            ? _.find(DISPUTE_STATUS_ARRAY, f => f.type === redirectFilter.filter.status).value
            : _.find(DISPUTE_STATUS_ARRAY, f => f.value === 1).value;

        this.state = {
            id: '',
            loading: false,
            filterVisible: false,
            filterApplied: false,
            selectedRecord: [],
            data: [],
            total: 0,
            loginUser: this.props.auth && this.props.auth.authUser ? this.props.auth.authUser : null,
            filter: {
                page: 1,
                limit: 20,
                sort: 'createdAt DESC',
                filter: {
                    createdAt: {
                        ">=": UtilService.getStartOfTheDay(moment().subtract(1, "months").startOf("day").toISOString()),
                        "<=": UtilService.getEndOfTheDay(moment().toISOString())
                    },
                    status: this.status,
                    vehicleType: FILTER_BY_VEHICLE_TYPE[DEFAULT_VEHICLE].type,
                    // userType: USER_TYPES.RIDER,
                }
            },
            paginate: false,
            showModal: false,
            showPriorityModel: false,
            addservicemodel: false,
            seeConversationModel: false,
            activityModel: false,
            activityTrack: '',
            date: [moment().subtract(1, "months"), moment()],
            dealerList: [],
            dealerFilterVisible: false,
            resposeDataId: ''
        };
        this.vehicleType = redirectFilter && redirectFilter.filter && redirectFilter.filter.vehicleType
            ? _.find(FILTER_BY_VEHICLE_TYPE, f => _.isEqual(f.type, redirectFilter.filter.vehicleType)).value
            : DEFAULT_VEHICLE;
        this.franchiseeId = 0;
        this.dealerId = 0;
        this.priority = PRIORITY_FILTER[0].value;
        this.pagename = window.location.pathname.split('/')[2];
        this.sort = 1;

        let menuPermission = this.props.auth.authUser.accessPermission;
        let riderIndexes = _.findIndex(menuPermission, { module: Number(PAGE_PERMISSION.RIDERS) });
        this.hasRidersViewPermission =
            menuPermission[riderIndexes] &&
            menuPermission[riderIndexes].permissions &&
            menuPermission[riderIndexes].permissions.view;
        let dealerIndexes = _.findIndex(menuPermission, { module: Number(PAGE_PERMISSION.DEALER) });
        this.hasDealerViewPermission =
            menuPermission[dealerIndexes] &&
            menuPermission[dealerIndexes].permissions &&
            menuPermission[dealerIndexes].permissions.view;
        this.type = redirectFilter && redirectFilter.filter && redirectFilter.filter.type
            ? _.find(FILTER_BY_DISPUTE_TYPES, f => f.type === redirectFilter.filter.type).value
            : 1;
    }

    componentDidMount() {
        this.getDealerList();

        if (this.pagename === 'service-request') {
            this.setState((state) => {
                // state.filter.filter.userType = USER_TYPES.FRANCHISEE;
                state.filter.filter.type = QUESTION_TYPE.SERVICE_REQUEST;
                delete state.filter.filter.vehicleType;
            });
        }
        let self = this;
        let filter = this.props.location.filter;
        if (filter) {
            let datevalue = [moment(filter.filter.createdAt['>=']), moment(filter.filter.createdAt['<='], 'YYYY/MM/DD')];
            this.setState({ filter: filter, paginate: false, date: datevalue }, () => {
                self.fetch();
            });
        } else {
            this.fetch();
        }
        // this.props.getFranchisee(); // called from App/index.js
    }

    async fetch(page) {
        this.setState({ loading: true, data: [] });
        if (page) {
            this.setState((state) => {
                state.filter.page = page;
                return state;
            });
        }
        try {
            let response = await axios.post(
                'admin/ride-complaint-dispute/paginate',
                this.state.filter
            );

            if (response.code === 'OK') {
                this.setState((state) => {
                    state.total = response.data.count;
                    state.data = response.data.list;
                    state.loading = false;
                    state.paginate = true;
                    state.selectedRecord = [];
                    state.resposeDataId = '';
                    return state;
                });
            } else {
                this.setState({ loading: false });
            }
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    }
    getDealerList = async (franchiseeId) => {
        let filter = {
            filter: {
                addOwnUser: true,
                isDeleted: false,
                isActive: true,
            }
        }
        if (franchiseeId) {
            if (franchiseeId.type === null) {
                filter.filter.dealerId = null;
                filter.filter.addOwnUser = false;
            }
            filter.filter.franchiseeId = franchiseeId.type;
        }
        try {
            let data = await axios.post('admin/user/dealer-list', filter);
            if (data.code === 'OK') {
                let response = [{ label: <IntlMessages id="app.all" />, value: 0 }];

                _.each(data.data.list, (value, index) => {
                    response.push({ label: value.name, value: index + 1, type: value.id });
                });
                this.setState({ dealerList: response, dealerFilterVisible: true })
            } else {
                console.log('payload: data.error', data.error);
            }
        } catch (error) {
            console.log('Error****:', error.message);
        }
    }
    onSearch = (newState) => {
        this.setState(
            {
                filter: newState,
                paginate: false
            },
            () => {
                this.fetch();
            }
        );
    };

    handleSelection = (selectedVal, isAscending, key, listData) => {
        let obj = {
            selectedVal: selectedVal,
            isAscending: isAscending,
            key: key,
            listData: listData
        };
        let self = this;
        let data = UtilService.commonFilter(obj);
        self[key] = selectedVal;
        self.setState((state) => {
            if (data !== 'error') {
                if (key === 'sort') {
                    state.filter[key] = data;
                } else {
                    state.filter.filter[key] = data.type;
                }
            } else if (key === 'sort') {
                delete state.filter[key];
            } else {
                delete state.filter.filter[key];
            }
        });
        if (key === 'franchiseeId') {
            this.setState({ dealerFilterVisible: false })
            this.getDealerList(data);
        }
        self.setState(
            (state) => {
                state.filter.page = 1;
                state.paginate = false;
            },
            () => {
                return self.fetch();
            }
        );
    };
    selectRecord = (record) => {
        // set state selected
        if (record) {
            this.setState({
                disabled: true
            });

            let stateData = _.clone(this.state.data);

            let index = _.findIndex(stateData, { id: record.id });
            if (index >= 0) {
                stateData[index].selected = !stateData[index].selected;

                this.setState({ data: stateData });
                if (stateData[index].selected) {
                    this.state.selectedRecord.push({
                        id: record.id,
                        remark: record.remark,
                        uniqNumber: record.uniqNumber,
                        priority: record.priority
                    });
                    this.setState({ status: record.status });
                } else {
                    let existId = _.findIndex(this.state.selectedRecord, {
                        id: record.id
                    });
                    this.state.selectedRecord.splice(existId, 1);
                }
            }
        }
    };
    dateChange = (date, dateString) => {
        let from = UtilService.getStartOfTheDay(moment(date[0])
            .startOf("day")
            .toISOString());
        let to = UtilService.getEndOfTheDay(date[1].toISOString());
        let range = { ">=": from, "<=": to };
        let value = [moment(date[0]), moment(date[1])]
        this.setState(state => {
            state.filter.filter.createdAt = range;
            state.filter.page = 1;
            state.paginate = false;
            state.date = value;
        });
        this.fetch();
    };
    handleClick = () => {
        this.setState({ showModal: true });
    };
    handleSubmit = () => {
        this.handleCancel();
    };
    handleCancel = () => {
        this.setState((state) => {
            state.paginate = false;
            state.filter.page = 1;
            state.showModal = false;
            state.selectedRecord = [];
            state.activityModel = false;
            state.resposeDataId = '';
        }, () => {
            this.fetch();
        });
    };
    handleConversationCancel = () => {
        this.setState({ seeConversationModel: false })
    }
    handleActivityCancel = () => {
        this.setState({ activityModel: false })

    }
    handelPriority = () => {
        this.setState({ showPriorityModel: true });
    };
    handlePrioritySubmit = () => {
        this.handlePriorityCancel();
    };
    handlePriorityCancel = () => {
        this.setState((state) => {
            state.paginate = false;
            state.filter.page = 1;
            state.showPriorityModel = false;
            state.selectedRecord = [];
        });
        this.fetch();
    };
    addservice = () => {
        this.setState({ addservicemodel: true },
        );
    }
    handleServiceSubmit = () => {
        this.setState({
            addservicemodel: false
        }, () => {
            this.fetch();
        });
    };
    handleServiceCancel = () => {
        this.setState({
            addservicemodel: false
        });
    };
    handleResponse = (id) => {
        if (this.state.resposeDataId === id) {
            this.setState({ resposeDataId: '' })
        } else {
            this.setState({
                resposeDataId: id,
                id: id
            });
        }
    }
    activityTrack = (value) => {
        this.setState({ activityTrack: value, activityModel: true });
    }
    submitMessage = () => {
        const { form } = this.props;
        form.validateFields(async (err, values) => {
            if (err) {
                return;
            }
            form.resetFields();
            let obj = {
                disputeId: this.state.id,
                remark: values.remark
            };
            try {
                let response = await axios.post('admin/ride-complaint-dispute/send-conversation', obj);
                if (response.code === 'OK') {
                    message.success(response.message);
                }
                this.fetch();
            } catch (err) {
                console.log('Error****:', err.message);
            }
        });
    }
    getName = (item) => {
        let riderRoute = `/e-scooter/${RIDER_ROUTE}/view/${item.userId.id}`;
        let franchiRoute = `/e-scooter/${FRANCHISEE_ROUTE}/view/${item.userId.id}`;
        let dealerRoute = `/e-scooter/${DEALER_ROUTE}/view/${item.userId.id}`;
        const { loginUser } = this.state;
        let returnObj;
        if (this.pagename === 'service-request') {
            if (loginUser.type === USER_TYPES.FRANCHISEE || loginUser.type === USER_TYPES.DEALER) {
                if (item.userId.id === loginUser.id) {
                    returnObj = <div>
                        <h3 style={{ textTransform: 'capitalize' }} >
                            <b style={{ color: 'black' }}>{item.userId.name.length > 0 ? item.userId.name : GUEST_USER}</b>
                        </h3>
                    </div >
                } else {
                    returnObj = <div className="gx-pointer">
                        <h3 style={{ textTransform: 'capitalize', cursor: 'pointer' }}>
                            <Link to={dealerRoute}>
                                <b style={{ color: 'black' }}>{item.userId.name.length > 0 ? item.userId.name : GUEST_USER}</b>
                            </Link>
                        </h3>
                    </div >
                }
            } else {
                if (item.userType === USER_TYPES.FRANCHISEE) {
                    returnObj = <div className="gx-pointer">
                        <h3 style={{ textTransform: 'capitalize', cursor: 'pointer' }}>
                            <Link to={franchiRoute}>
                                <b style={{ color: 'black' }}>{item.userId.name.length > 0 ? item.userId.name : GUEST_USER}</b>
                            </Link>
                        </h3>
                    </div >
                } else {
                    returnObj = <div>
                        <h3 style={{ textTransform: 'capitalize' }} >
                            <b style={{ color: 'black' }}>{item.userId.name.length > 0 ? item.userId.name : GUEST_USER}</b>
                        </h3>
                    </div >
                }
            }
        } else {
            if (this.hasRidersViewPermission) {
                returnObj = <div className="gx-pointer">
                    <h3 style={{ textTransform: 'capitalize', cursor: 'pointer' }}>
                        <Link to={riderRoute}>
                            <b style={{ color: 'black' }}>{item.userId.name.length > 0 ? item.userId.name : GUEST_USER}</b>
                        </Link>
                    </h3>
                </div >
            } else {
                returnObj = <div>
                    <h3 style={{ textTransform: 'capitalize' }} >
                        <b style={{ color: 'black' }}>{item.userId.name.length > 0 ? item.userId.name : GUEST_USER}</b>
                    </h3>
                </div >
            }
        }
        return returnObj;
    }
    render() {
        const { selectedRecord, data, loading, loginUser } = this.state;
        let isFranchisee = loginUser && loginUser.type === USER_TYPES.FRANCHISEE;
        let isDealer = loginUser && loginUser.type === USER_TYPES.DEALER;
        const { authUser } = this.props.auth;
        const { form } = this.props;
        let FilterArray = [
            {
                title: <IntlMessages id="app.browse" />,
                list: DISPUTE_STATUS_ARRAY,
                defaultSelected: this.status,
                key: 'status',
                visible: true
            },
            {
                title: <IntlMessages id="app.vehicleType" />,
                list: FILTER_BY_VEHICLE_TYPE,
                defaultSelected: this.vehicleType,
                key: 'vehicleType',
                visible: FILTER_VISIBLE
            },
            {
                title: <IntlMessages id="app.priority" />,
                list: PRIORITY_FILTER,
                defaultSelected: this.priority,
                key: 'priority',
                visible: true
            },
            {
                title: FRANCHISEE_LABEL,
                list: this.props.franchisee.franchisee,
                defaultSelected: this.franchiseeId,
                key: 'franchiseeId',
                visible: this.props.franchisee.franchisee.length > 2 && !isFranchisee && !isDealer && FRANCHISEE_VISIBLE
            },
            {
                title: DEALER_LABEL,
                list: this.state.dealerList,
                defaultSelected: this.dealerId,
                key: 'dealerId',
                visible: this.state.dealerList.length > 2 && !isDealer && this.state.dealerFilterVisible && CLIENT_VISIBLE
            },
            {
                title: <IntlMessages id="app.sortBy" />,
                list: SORT_BY_REQUEST_DATE,
                sorter: true,
                isDesc: true,
                defaultSelected: this.sort,
                key: 'sort',
                visible: this.pagename === 'service-request'
            },
            {
                title: <IntlMessages id="app.type" />,
                list: FILTER_BY_DISPUTE_TYPES,
                defaultSelected: this.type,
                key: "type",
                visible: this.pagename !== 'service-request'
            }
        ];

        return (
            <div className="gx-module-box gx-mw-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            {this.pagename === 'service-request' ?
                                <h1 className="pageHeading"><IntlMessages id="app.dispute.serviceRequest" /></h1> :
                                <h1 className="pageHeading"><IntlMessages id="app.dispute.rideDispute" /></h1>
                            }
                            <div className="SearchBarwithBtn">
                                {authUser.type !== USER_TYPES.FRANCHISEE && <Search
                                    handelSearch={this.onSearch}
                                    filter={this.state.filter}
                                    // keys={['uniqNumber']}
                                    placeholder={this.pagename === 'service-request' ? 'Search by Service No' : "Search by ride number"}
                                    keys={['uniqNumber']}
                                />}
                                {(authUser.type === USER_TYPES.FRANCHISEE || authUser.type === USER_TYPES.DEALER) && this.pagename === 'service-request' ?
                                    <AddButton
                                        onClick={this.addservice}
                                        text={<IntlMessages id="app.dispute.addRequest" />}
                                        pageId={PAGE_PERMISSION.SERVICE_REQUEST}
                                    /> :
                                    ''}
                            </div>
                        </Row>
                        <Row
                            type="flex"
                            align="middle"
                            justify="space-between"
                            style={{ marginTop: 20 }}
                        >
                            <div className="DropdownWidth">
                                {FilterArray.map((filter) => {
                                    return (filter.visible &&
                                        <FilterDropdown
                                            title1={filter.title}
                                            list={filter.list}
                                            key={filter.key}
                                            sorter={
                                                filter && filter.sorter
                                            }
                                            isDesc={
                                                filter && filter.isDesc
                                            }
                                            defaultSelected={
                                                filter.defaultSelected
                                            }
                                            handleSelection={(val, isAscending) => {
                                                this.handleSelection(
                                                    val,
                                                    isAscending,
                                                    filter.key,
                                                    filter.list
                                                );
                                            }}
                                        />

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
                                        format={dateFormat}
                                        value={this.state.date}
                                        onChange={this.dateChange.bind(this)}
                                    />
                                </div>
                            </div>
                            {this.state.paginate ?
                                <ESPagination
                                    limit={this.state.filter.limit}
                                    total={this.state.total}
                                    fetch={this.fetch.bind(this)}
                                    page={this.state.filter.page}
                                />
                                : null}
                        </Row>
                    </div>
                </Affix>
                <div className="RidersList">
                    <List
                        itemLayout="horizontal"
                        dataSource={data}
                        loading={loading}
                        renderItem={(item) => {
                            let disputeType = FILTER_BY_QUESTION_TYPES.find((ele) => { return ele.type === item.type; })
                            return (
                                <List.Item
                                    className={item.selected ? 'list-item-selected' : ''}
                                >
                                    <div className="ant-list-item-meta">
                                        <div
                                            className="totalRideCounter ant-list-item-meta-avatar"
                                            onClick={item.userId.id !== loginUser.id && this.selectRecord.bind(this, item)}
                                        >
                                            <span className={`ant-avatar ant-avatar-circle ant-avatar-image ${item.userId.id !== loginUser.id ? "gx-pointer" : ""}`}>
                                                {item.selected &&
                                                    this.state.status !== 4 ?
                                                    <SelectCheck /> :
                                                    item.image ?
                                                        <img
                                                            alt=""
                                                            src={item.image}
                                                        /> :
                                                        <h2
                                                            style={{
                                                                lineHeight: '70px'
                                                            }}
                                                        >
                                                            {
                                                                item.userId.name.length > 0
                                                                    ? item.userId.name
                                                                        .charAt(0)
                                                                        .toUpperCase()
                                                                    : GUEST_USER
                                                                        .charAt(0)
                                                                        .toUpperCase()
                                                            }
                                                        </h2>
                                                }
                                            </span>
                                        </div>
                                        <div className="ant-list-item-meta-content">
                                            <Row type="flex" justify="start" style={{ alignItems: 'center' }}>
                                                <h4
                                                    className="ant-list-item-meta-title"
                                                    style={{ marginBottom: '-5px', display: 'flex' }}
                                                >
                                                    {this.getName(item)}
                                                    {item.userType === USER_TYPES.DEALER && item.franchiseeId && item.franchiseeId.id ?
                                                        < div style={{ fontSize: '16px' }}>
                                                            <FranchiseeName
                                                                name={item.franchiseeId.name}
                                                                userId={item.franchiseeId.id}
                                                            /></div> :
                                                        ''}
                                                    {
                                                        item.userType === USER_TYPES.RIDER &&
                                                        (<>
                                                            {item.franchiseeId && item.franchiseeId.id &&
                                                                < div style={{ fontSize: '16px' }}>
                                                                    <FranchiseeName
                                                                        name={item.franchiseeId.name}
                                                                        userId={item.franchiseeId.id}
                                                                    /></div>}

                                                            {FRANCHISEE_VISIBLE && loginUser.type !== USER_TYPES.DEALER && item.franchiseeId && item.dealerId && item.dealerId.id ?
                                                                this.hasDealerViewPermission ?
                                                                    <div className="gx-pointer">
                                                                        <h3 style={{ textTransform: 'capitalize', cursor: 'pointer' }}>
                                                                            <Link to={`/e-scooter/${DEALER_ROUTE}/view/${item.dealerId.id}`}>
                                                                                <b style={{ color: 'black' }}>&nbsp; ({item.dealerId.name})</b>
                                                                            </Link>
                                                                        </h3>
                                                                    </div >
                                                                    : <div style={{ textTransform: 'capitalize' }}>
                                                                        <b style={{ color: 'black' }}>&nbsp;({item.dealerId.name})</b>
                                                                    </div>
                                                                : ''}
                                                        </>
                                                        )
                                                    }
                                                    {item.priority ? <div style={{ paddingLeft: '10px' }}>
                                                        <Tag color={item.priority === 1 ? 'red' : item.priority === 2 ? 'yellow' : item.priority === 3 ? 'blue' : 'grey'}>
                                                            {_.filter(PRIORITY_FILTER, (num) => {
                                                                return num.value === item.priority;
                                                            })[0].label}
                                                        </Tag>
                                                    </div> : ''}
                                                </h4>
                                                <div className="gx-flex-row">
                                                    {
                                                        (item.userId.mobiles && item.userId.mobiles.length > 0) && <React.Fragment>
                                                            <div
                                                                className="ant-list-item-meta-description"
                                                                style={{
                                                                    marginRight: "50px",
                                                                    marginLeft: "10px"
                                                                }}
                                                            >
                                                                <Mobile />{" "}
                                                                {
                                                                    (item.userId.mobiles !== null && item.userId.mobiles.length > 0)
                                                                        ? item.userId.mobiles[0].mobile
                                                                        : '-'
                                                                }
                                                            </div>
                                                        </React.Fragment>
                                                    }
                                                    {
                                                        (item.userId.emails && item.userId.emails.length > 0) && <React.Fragment>
                                                            <div
                                                                className="ant-list-item-meta-description"
                                                                style={{
                                                                    marginRight: "10px",
                                                                    marginLeft: "20px"
                                                                }}
                                                            >
                                                                <Email /> {" "}
                                                                <strong>
                                                                    {
                                                                        (item.userId.emails !== null && item.userId.emails.length > 0)
                                                                            ? item.userId.emails[0].email
                                                                            : '-'
                                                                    }
                                                                </strong>
                                                            </div>
                                                        </React.Fragment>
                                                    }
                                                    <div
                                                        className="ant-list-item-meta-description"
                                                        style={{
                                                            marginLeft: "10px"
                                                        }}
                                                    >
                                                        {
                                                            (this.type === 1) ?
                                                                <Tag color="green">
                                                                    {disputeType && disputeType.label}
                                                                </Tag> : null
                                                        }
                                                    </div>
                                                </div>
                                            </Row>
                                            <div className="gx-flex-row">
                                                <div
                                                    className="ant-list-item-meta-description"
                                                    style={{
                                                        marginRight: '50px'
                                                    }}
                                                >
                                                    {this.pagename === 'service-request' ? <IntlMessages id="app.dispute.serviceNo" /> : <IntlMessages id="app.dispute.disputeNo" />}&nbsp;
                                                    <strong>
                                                        {item.uniqNumber ?
                                                            item.uniqNumber :
                                                            '-'}
                                                    </strong>
                                                </div>
                                                {this.pagename !== 'service-request' && item.rideId &&
                                                    item.rideId.rideNumber && <div
                                                        className="ant-list-item-meta-description"
                                                        style={{
                                                            marginRight: '50px'
                                                        }}
                                                    >
                                                        <IntlMessages id="app.payment.rideRequestNo" />:{' '}
                                                        <strong>
                                                            {item.rideId.rideNumber}
                                                        </strong>
                                                    </div>}
                                            </div>
                                            {this.pagename === 'service-request' &&
                                                <div className="gx-flex-row">
                                                    <div
                                                        className="ant-list-item-meta-description"
                                                        style={{ marginRight: '50px' }}
                                                    >
                                                        <IntlMessages id="app.wallet.remark" /> : &nbsp;
                                                    <strong>{item.remark ? item.remark : '-'}</strong>
                                                    </div>
                                                </div>
                                            }
                                        </div>

                                        <div className="cardRightThumb">
                                            <div className="cardRightContainer">
                                                <div className="action-btnsWithSignupDate">
                                                    {this.pagename === 'service-request' &&
                                                        <div className="scooterActionItem">
                                                            {/* <div className="scooterIC">
                                                                <a onClick={() => { return this.setState({ seeConversationModel: true, conversationTrack: item.conversationTrack }); }}>
                                                                    <Icon type="wechat" />
                                                                </a>
                                                            </div> */}
                                                            <div className="scooterIC">
                                                                <a
                                                                    href="/#" onClick={(e) => {
                                                                        e.preventDefault();
                                                                        this.activityTrack(item.activityTrack)

                                                                    }}>
                                                                    <ESToolTip placement="top" text={<IntlMessages id="app.dispute.viewActivityTrack" />}>
                                                                        <Icon type="profile" />
                                                                    </ESToolTip>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    }
                                                    <div className="signupDate">
                                                        <IntlMessages id="app.dispute.requestDate" />:
                                                        {UtilService.displayDate(
                                                            item.createdAt ?
                                                                item.createdAt :
                                                                ''
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <Divider type="horizontal" />
                                        <div className="ant-list-item-meta-content">
                                            <div className="ant-list-item-meta-description">
                                                <b>{item.question}</b>
                                            </div>
                                            <div className="ant-list-item-meta-description">
                                                {item.answer}
                                            </div>
                                        </div>
                                        {this.pagename === 'service-request' && <div className="cardRightThumb">
                                            <div>
                                                <Button
                                                    onClick={this.handleResponse.bind(this, item.id)}
                                                >
                                                    <IntlMessages id="app.dispute.sendResponse" />
                                                </Button>
                                            </div>
                                        </div>}
                                        {(this.state.resposeDataId === item.id && item.conversationTrack) && <>
                                            <Divider type="horizontal" />
                                            <div className="d-flex messageWrapper">
                                                <div className="messageList">
                                                    {_.map(item.conversationTrack, (data) => {
                                                        return <div className="messageListItem">
                                                            <div className="gx-d-flex messgaeLeft">
                                                                <div className='messageContent'>
                                                                    <b>{data.userId ? `${data.userId.name} : ` : ''}</b>
                                                                </div>
                                                                <div className='messageRemark'>
                                                                    {data.remark ? data.remark : ''}
                                                                </div>
                                                            </div>
                                                            <div className='messageDate'>
                                                                {data.dateTime ? UtilService.displayDate(data.dateTime ? data.dateTime : '') : ''}
                                                            </div>
                                                        </div>
                                                    })
                                                    }
                                                </div>
                                                <div className="ant-list-item-meta-content messgeRight">
                                                    <Form>
                                                        <Form.Item label={<IntlMessages id="app.dispute.message" />}>
                                                            {form.getFieldDecorator('remark', {
                                                                rules: [{
                                                                    required: true,
                                                                    message: 'Please Enter the message you want to send!'
                                                                }]
                                                            })(
                                                                <TextArea multiline="true"
                                                                    rows={3}
                                                                    placeholder="Enter the message you want to send!"
                                                                    margin="none" />
                                                            )}
                                                        </Form.Item>
                                                    </Form>
                                                    <div className="buttonLeft">
                                                        <Button
                                                            onClick={this.submitMessage.bind(this)}
                                                        >
                                                            <IntlMessages id="app.notification.send" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </>}
                                    </div>
                                </List.Item>
                            );
                        }}
                    />
                </div>
                {
                    selectedRecord.length > 0 && this.state.status !== 4 ?
                        <div className="selectOptionBottom">
                            <div className="selectRideOptions">
                                <div className="selectAllOption">
                                    <a href="/#" onClick={(e) => {
                                        e.preventDefault();
                                    }}>
                                        {selectedRecord.length} <IntlMessages id="app.dispute.disputeSelected" />
                                    </a>
                                    <Button
                                        type="primary"
                                        onClick={this.handleClick}
                                    >
                                        <IntlMessages id="app.dispute.updateStatus" />
                                    </Button>
                                    <Button
                                        type="primary"
                                        onClick={this.handelPriority}
                                    >
                                        <IntlMessages id="app.dispute.updatePriority" />
                                    </Button>
                                    {this.state.showModal ?
                                        <UpdateStatus
                                            onCancel={this.handleCancel}
                                            onCreate={this.handleSubmit}
                                            record={selectedRecord}
                                            status={this.state.status}
                                        /> :
                                        null}
                                    {this.state.showPriorityModel ?
                                        <UpdatePriority
                                            onCancel={this.handlePriorityCancel}
                                            onCreate={this.handlePrioritySubmit}
                                            record={selectedRecord}
                                            priority={this.priority}
                                            status={this.state.status}
                                        /> :
                                        null}

                                </div>
                            </div>
                        </div> :
                        null
                }
                {
                    this.state.addservicemodel &&
                    <AddService
                        handleSubmit={this.handleServiceSubmit}
                        onCancel={this.handleServiceCancel}
                    />
                }
                {/* {
                    this.state.seeConversationModel && <SeeConversation
                        conversationTrack={this.state.conversationTrack}
                        onCancel={this.handleConversationCancel}
                    />
                } */}
                {
                    this.state.activityModel && <ActivityTrack
                        data={this.state.activityTrack}
                        onCancel={this.handleActivityCancel}
                    />
                }


            </div>
        );
    }
}

const WrappedRideDispute = Form.create({ name: 'RideDispute' })(RideDispute);
const mapStateToProps = function (props) {
    return props;
};
export default connect(mapStateToProps)(WrappedRideDispute);
