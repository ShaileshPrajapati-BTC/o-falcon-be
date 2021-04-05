import {
    AutoComplete,
    Card,
    DatePicker,
    Empty,
    Input,
    Popover,
    Row,
    Spin,
    Affix,
    Button,
    message
} from "antd";
import React, { Component } from "react";
// import { getFranchisee } from "../../appRedux/actions/franchisee";
import {
    CHARGE_TYPE,
    FILTER_VISIBLE,
    DEFAULT_VEHICLE,
    FILTER_BY_VEHICLE_TYPE,
    RIDE_TYPE,
    FRANCHISEE_LABEL,
    DEFAULT_BASE_CURRENCY,
    RIDE_TYPE_FILTER,
    FILTER_BY_PAYMENT_STATUS,
    USER_TYPES,
    GUEST_USER_STRING,
    BASE_URL,
    FRANCHISEE_VISIBLE,
    CLIENT_VISIBLE,
    IS_NOQOODY_PG
} from "../../constants/Common";
import ESPagination from "../../components/ESPagination";
import ESTag from "../../components/ESTag";
import { ReactComponent as Email } from "../../assets/svg/email.svg";
import { ReactComponent as Mobile } from "../../assets/svg/mobile.svg";
import UtilService from "../../services/util";

import axios from "util/Api";
import { connect } from "react-redux";
import moment from "moment";
import PaymentView from "./view";
import FilterDropdown from "../../components/FilterDropdown";
import UserId from "../CommonComponent/UserId";
import FranchiseeName from "../../components/ESFranchiseeName";
import IntlMessages from "../../util/IntlMessages";

const { RangePicker } = DatePicker;
const _ = require("lodash");
const dateFormat = "DD/MM/YYYY";

class Payment extends Component {
    constructor(props) {
        super(props);
        let filter = {
            createdAt: {
                ">=": UtilService.getStartOfTheDay(moment()
                    .subtract(1, "months")
                    .startOf("day")
                    .toISOString()),
                "<=": UtilService.getEndOfTheDay(moment().toISOString())
            },
            vehicleType: FILTER_BY_VEHICLE_TYPE[DEFAULT_VEHICLE].type,
            // status: PAYMENT_STATUS.SUCCEEDED      need to set this if we are changing default.
            rideType: RIDE_TYPE.DEFAULT
        };
        if (!FRANCHISEE_VISIBLE) {
            filter.franchiseeId = null;
        }
        if (!CLIENT_VISIBLE) {
            filter.dealerId = null;
        }
        this.state = {
            data: [],
            total: 0,
            loading: false,
            loginUser: this.props.auth && this.props.auth.authUser ? this.props.auth.authUser : null,
            filter: {
                page: 1,
                limit: 20,
                filter: filter
            },
            dataSource: [],
            paginate: false,
            search: false,
            defaultSearch: "",
            showModal: false,
            invoice: {},
            date: [moment().subtract(1, "months"), moment()]
        };
        let redirectFilter = this.props.location.filter;
        this.vehicleType = redirectFilter && redirectFilter.filter && redirectFilter.filter.vehicleType
            ? _.find(FILTER_BY_VEHICLE_TYPE, f => _.isEqual(f.type, redirectFilter.filter.vehicleType)).value
            : DEFAULT_VEHICLE;
        this.status = redirectFilter && redirectFilter.filter && redirectFilter.filter.status
            ? _.find(FILTER_BY_PAYMENT_STATUS, f => f.type === redirectFilter.filter.status).value
            : FILTER_BY_PAYMENT_STATUS[0].value;
        this.franchiseeId = 0;

        this.rideType = redirectFilter && redirectFilter.filter && redirectFilter.filter.rideType
            ? _.find(RIDE_TYPE_FILTER, f => f.type === redirectFilter.filter.rideType).value
            : RIDE_TYPE.DEFAULT;
    }

    componentDidMount() {
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
                "admin/payment/paginate",
                this.state.filter
            );
            if (response && response.code === "OK") {
                let dataSource;
                let filterdata = _.filter(response.data.list, function (num) {
                    return num.rideId && num.rideId.rideNumber ? num : '';
                })
                dataSource = _.uniq(
                    _.map(filterdata, "rideId.rideNumber")
                );
                this.setState({
                    total: response.data.count,
                    loading: false,
                    data: response.data.list,
                    dataSource: dataSource,
                    paginate: true,
                    search: true
                });
            } else {
                this.setState({
                    total: 0,
                    loading: false,
                    data: [],
                    paginate: true
                });
            }
        } catch (error) {
            console.log("Error****:", error.message);
            this.setState({ loading: false });
        }
    };
    // onSearch = search => {
    //     this.setState(state => {
    //         delete state.filter.filter.rideId;
    //         state.paginate = false;
    //     });
    //     this.fetch();
    // };
    onSearch = (search) => {
        if (search.trim()) {
            this.setState((state) => {
                delete state.filter.filter.rideId;
                state.filter.filter.rideNumber = search
                state.paginate = false;
            }, () => {
                this.fetch();
            });
        }
    }
    onSelect = value => {
        let findRideId = _.find(this.state.data, data => {
            return data.rideId && data.rideId.rideNumber ? data.rideId.rideNumber === value : '';
        });
        if (this.state.filter.filter.rideNumber) {
            delete this.state.filter.filter.rideNumber;
        }
        if (findRideId && findRideId.rideId && findRideId.rideId.id) {
            this.setState(state => {
                state.filter.filter.rideId = findRideId.rideId.id;
                state.paginate = false;
                state.search = false;
                state.filter.page = 1;
                state.defaultSearch = findRideId.rideId.rideNumber;
            }, () => {
                this.fetch();
            });
        }
    };
    handleKeyPress = value => {
        if (value) {
            this.onSearch(value)
        }
        this.setState((state) => {
            delete state.filter.filter.rideNumber;
            delete state.filter.filter.rideId
            state.paginate = false;
        }, () => {
            this.fetch();
        });
    };

    dateChange = (date) => {
        let from = UtilService.getStartOfTheDay(moment(date[0]));
        let to = UtilService.getEndOfTheDay(moment(date[1]));
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
    handleModal = rideId => {
        this.setState({ showModal: true, invoice: rideId });
    };
    handleCancel = () => {
        this.setState({ showModal: false });
    };
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
        if (this.rideType === RIDE_TYPE.DEFAULT) {
            let a = _.filter(FILTER_BY_VEHICLE_TYPE, (e) => {
                return e.value === this.vehicleType;
            })
            self.setState(state => {
                state.filter.filter.vehicleType = a[0].type;
                state.filter.page = 1;
                state.paginate = false;
            }, () => self.fetch())
        } else {
            self.setState(state => {
                delete state.filter.filter['vehicleType'];
                state.filter.page = 1;
                state.paginate = false;
            }, () => self.fetch())
        }
    };

    fetchLatestStatus = async () => {
        this.setState({ loading: true });
        try {
            let fromDate = UtilService.getStartOfTheDay();
            let response = await axios.post('admin/payment/updateStatusFormMPGSTransactions', { fromDate: fromDate });
            if (response && response.code === 'OK') {
                this.fetch();
            }
            message.success(response.message);
            this.setState({ loading: false });
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
            let errMsg = error.message;
            if (errMsg.message) {
                errMsg = errMsg.message;
            }
            message.error(errMsg);
        }
    };

    /* eslint-disable max-lines-per-function */
    render() {

        const { data, loading, loginUser } = this.state;
        let isFranchisee = loginUser && loginUser.type === USER_TYPES.FRANCHISEE;
        // let isDealer = loginUser && loginUser.type === USER_TYPES.DEALER;
        let FilterArray = [
            {
                title: <IntlMessages id="app.vehicleType" />,
                list: FILTER_BY_VEHICLE_TYPE,
                defaultSelected: this.vehicleType,
                key: "vehicleType",
                visible: FILTER_VISIBLE
            }, {
                title: <IntlMessages id="app.payment.paymentStatus" />,
                list: FILTER_BY_PAYMENT_STATUS,
                defaultSelected: this.status,
                key: "status",
                visible: true
            }, {
                title: FRANCHISEE_LABEL,
                list: this.props.franchisee.franchisee,
                defaultSelected: this.franchiseeId,
                key: 'franchiseeId',
                visible: this.props.franchisee.franchisee.length > 2 && !isFranchisee && FRANCHISEE_VISIBLE
            }, {
                title: <IntlMessages id="app.payment.rideType" />,
                list: RIDE_TYPE_FILTER,
                defaultSelected: this.rideType,
                key: "rideType",
                visible: RIDE_TYPE_FILTER.length > 2
            }
        ];

        return (
            <div className="gx-module-box gx-mw-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <h1 className="pageHeading"><IntlMessages id="app.payment.payments" /></h1>
                            <div className="SearchBarwithBtn">
                                {
                                    IS_NOQOODY_PG ?
                                        <div className="topbarCommonBtn m-r-20">
                                            <Button type="primary" title="" onClick={this.fetchLatestStatus.bind(this)}>
                                                <IntlMessages id="app.payment.fetchLatestPayments" defaultMessage="Update Today's Transaction Status" />
                                            </Button>
                                        </div> : null
                                }
                                {this.state.search && <AutoComplete
                                    defaultValue={this.state.defaultSearch}
                                    dataSource={this.state.dataSource}
                                    onSelect={this.onSelect}
                                    placeholder="Search Request"
                                    // onSearch={this.onSearch}
                                    defaultActiveFirstOption={false}
                                    filterOption={true}
                                    onSearch={this.handleKeyPress}
                                    style={{ width: 300 }}>
                                    <Input.Search />
                                </AutoComplete>}
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
                                        value={this.state.date}
                                        format={dateFormat}
                                        onChange={this.dateChange.bind(this)}
                                    />
                                </div>
                            </div>
                            {this.state.paginate ? (
                                <ESPagination
                                    limit={this.state.filter.limit}
                                    total={this.state.total}
                                    fetch={this.fetch.bind(this)}
                                    page={this.state.filter.page}
                                />
                            ) : null}
                        </Row>
                    </div>
                </Affix>
                <Spin spinning={loading} delay={100}>
                    {data && data.length ? (
                        <div className="paymentHistory">
                            {data.map(record => {
                                return (
                                    <Card key={record.id}>
                                        <div className="paymentCommon">
                                            <div
                                                className="totalRideCounter"

                                            >
                                                <span style={{
                                                    height: "70px",
                                                    width: "70px"
                                                }} className="ant-avatar ant-avatar-circle ant-avatar-image">
                                                    {record.transactionBy &&
                                                        record.transactionBy
                                                            .image ? (
                                                            <img
                                                                alt=""
                                                                src={`${BASE_URL}/${record.transactionBy.image}`}
                                                            />
                                                        ) : (
                                                            <h2>
                                                                {
                                                                    (record.transactionBy && record.transactionBy.name.length === 0)
                                                                        ? GUEST_USER_STRING.charAt(0).toUpperCase()
                                                                        : record.transactionBy &&
                                                                        record.transactionBy.name
                                                                            .charAt(0)
                                                                            .toUpperCase()}
                                                            </h2>
                                                        )}
                                                </span>
                                            </div>
                                            <div className="paymentUsersDetail">
                                                <div className="paymentUsersDetailTop">
                                                    <UserId
                                                        name={
                                                            (record.transactionBy && record.transactionBy.name.length === 0 ? GUEST_USER_STRING : record.transactionBy && record.transactionBy.name)
                                                        }
                                                        userId={record.transactionBy && record.transactionBy.id}
                                                        currentPage={window.location.pathname}
                                                        filter={this.state.filter}
                                                    />
                                                    {FRANCHISEE_VISIBLE && record.franchiseeId && record.franchiseeId.name ?
                                                        <div style={{ fontSize: '16px', marginLeft: '10px' }}>
                                                            <FranchiseeName
                                                                name={record.franchiseeId.name}
                                                                userId={record.franchiseeId.id}
                                                                tag={<>{FRANCHISEE_LABEL} <IntlMessages id="app.name" /></>}
                                                            /></div>
                                                        : ''}
                                                    <div className="moneySender">
                                                        {/* <div className="moneyLabel">Send Money to :</div>
                                                        <div className="moneySenderName" style={{ textTransform: 'capitalize' }}>{record.transactionTo && record.transactionTo.name ? record.transactionTo.name : '-'}</div> */}
                                                        <Popover
                                                            content={
                                                                <div>{record.remark}</div>
                                                            }
                                                            title={
                                                                record.rideId &&
                                                                    record.rideId
                                                                        .rideNumber
                                                                    ? `#${record.rideId.rideNumber}`
                                                                    : "-"
                                                            }
                                                        >
                                                            <div>
                                                                <IntlMessages id="app.payment.viewRemark" />
                                                            </div>
                                                        </Popover>
                                                    </div>
                                                    {FRANCHISEE_VISIBLE && record.rideId && record.rideId.franchiseeCommission ?
                                                        <div className="moneySender" >
                                                            <div className="moneyLabel"><IntlMessages id="app.payment.commission" />:</div>
                                                            <div className="moneySenderName gx-pointer">{DEFAULT_BASE_CURRENCY}{record.rideId.franchiseeCommission}</div>
                                                        </div>
                                                        : ''}
                                                    {record.rideId && (
                                                        <div className="mr-3">
                                                            <a
                                                                href="/#" onClick={(e) => {
                                                                    e.preventDefault();
                                                                    this.handleModal(record.rideId)
                                                                }}
                                                                className="btnRemark"
                                                            >
                                                                <IntlMessages id="app.payment.paymentBreakups" />
                                                            </a>
                                                        </div>
                                                    )}
                                                    {record.noqoodyReferenceId && (
                                                        <div className="mr-3">
                                                            <b>Reference Id: </b> {record.noqoodyReferenceId}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="paymentUsersDetailBottom">
                                                    {record.rideId && record.rideId.rideNumber ?
                                                        <div className="moneySender" style={{ marginRight: 9 }}>
                                                            <div className="moneyLabel">
                                                                <IntlMessages id="app.payment.rideNo" /> :
                                                        </div>
                                                            <div className="moneySenderName">
                                                                #{record.rideId.rideNumber}
                                                            </div>
                                                        </div>
                                                        : " "}
                                                    {record.paymentTransactionId
                                                        ? <div className="moneySender">
                                                            <div className="moneyLabel">
                                                                <IntlMessages id="app.payment.paymentId" /> :
                                                        </div>
                                                            <div className="moneySenderName">
                                                                {record.paymentTransactionId}

                                                            </div>
                                                        </div>
                                                        : " "}
                                                    <div className="moneySender">
                                                        {
                                                            (record.transactionBy
                                                                && record.transactionBy.mobiles
                                                                && record.transactionBy.mobiles.length !== 0)
                                                            && <React.Fragment>
                                                                <div className="moneyLabel">
                                                                    <Mobile />
                                                                </div>
                                                                <div className="moneySenderName">
                                                                    {" "}
                                                                    {record.transactionBy &&
                                                                        _.size(
                                                                            record
                                                                                .transactionBy
                                                                                .mobiles
                                                                        ) > 0 &&
                                                                        UtilService.getPrimaryValue(
                                                                            record
                                                                                .transactionBy
                                                                                .mobiles,
                                                                            "mobile"
                                                                        )}
                                                                </div>
                                                            </React.Fragment>
                                                        }
                                                    </div>
                                                    <div className="moneySender">
                                                        {
                                                            (record.transactionBy
                                                                && record.transactionBy.emails
                                                                && record.transactionBy.emails.length !== 0) &&
                                                            < React.Fragment >
                                                                <div className="moneyLabel">
                                                                    <Email />
                                                                </div>
                                                                <div className="moneySenderName">
                                                                    {record.transactionBy &&
                                                                        _.size(
                                                                            record
                                                                                .transactionBy
                                                                                .emails
                                                                        ) > 0 &&
                                                                        UtilService.getPrimaryValue(
                                                                            record
                                                                                .transactionBy
                                                                                .emails,
                                                                            "email"
                                                                        )}
                                                                </div>
                                                            </React.Fragment>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="paymentStatusTag">
                                            {record.status && <ESTag
                                                status={record.status}
                                                filterArray={FILTER_BY_PAYMENT_STATUS}
                                            />}
                                        </div>

                                        <div className="paymentAmountDate">
                                            <h3
                                                className={
                                                    record.type ===
                                                        CHARGE_TYPE.CREDIT || record.rideId && record.rideId.rideNumber
                                                        ? "cutMoney"
                                                        : "addMoney"
                                                }
                                            >
                                                {" "}
                                                {UtilService.displayPrice(
                                                    record.amount
                                                )}
                                            </h3>
                                            <p>
                                                {UtilService.displayDate(
                                                    record.createdAt
                                                )}
                                            </p>
                                        </div>
                                    </Card>
                                );
                            })}
                            {this.state.showModal && (
                                <PaymentView
                                    onCancel={this.handleCancel}
                                    invoice={this.state.invoice}
                                />
                            )}
                        </div>
                    ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                </Spin>
            </div >
        );
    }
}

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(Payment);
