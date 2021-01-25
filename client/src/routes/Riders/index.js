/* eslint-disable no-nested-ternary */
import { Button, List, Row, message, Affix, Tag, Icon } from "antd";
import {
    FILTER_BY_ACTIVE,
    USER_TYPES,
    PAGE_PERMISSION,
    SORT_BY_ARRAY_USER,
    GUEST_USER_STRING,
    BASE_URL,
    RIDER_ROUTE,
    RIDER_LABEL,
    FEEDER_LABEL,
    FEEDER_VISIBLE,
    FEEDER_ROUTE,
    EXPORT_EXCEL
} from "../../constants/Common";
import React, { Component } from "react";
import ActionButton from "./action";
import ActionButtons from "../../components/ActionButtons";
import ActiveDeactive from "../../components/custom/ActiveDeactive";
import AddButton from "../../components/ESAddButton";
import { ReactComponent as DOB } from "../../assets/svg/dob.svg";
import ESPagination from "../../components/ESPagination";
import { ReactComponent as Email } from "../../assets/svg/email.svg";
import FilterDropdown from "../../components/FilterDropdown";
import { Link, Redirect } from "react-router-dom";
import { ReactComponent as Mobile } from "../../assets/svg/mobile.svg";
import { ReactComponent as Notification } from "../../assets/svg/notification.svg";
import { ReactComponent as SelectCheck } from "./selectCheck.svg";
import UtilService from "../../services/util";
import axios from "util/Api";
import Search from "../../components/ESSearch";
import UserId from "../CommonComponent/UserId";
import ESToolTip from "../../components/ESToolTip";
import IntlMessages from "../../util/IntlMessages";
import { CSVLink } from "react-csv";
const _ = require("lodash");
let exportRef = null;
class Riders extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            total: 0,
            fileUploadProcess: false,
            loading: false,
            showModal: false,
            disabled: false,
            selectedRecord: [],
            paginate: false,
            isTypeRedirect: false,
            filter: {
                page: 1,
                limit: 20,
                filter: {
                    type: USER_TYPES.RIDER,
                    isDeleted: false
                }
            },
             excelData: []
        };
        let redirectFilter = this.props.location.filter;
        this.defaultFilterBy = 1;
        this.sort = redirectFilter && redirectFilter.sort
            ? _.find(SORT_BY_ARRAY_USER, f => f.type === redirectFilter.sort.split(" ")[0]).value
            : 3;
        this.isDesc = redirectFilter && redirectFilter.sort ? (redirectFilter.sort.split(" ")[1] === 'ASC' ? false : true) : true;
        // this.isActive = redirectFilter && redirectFilter.filter && redirectFilter.filter.isActive
        //     ? _.find(FILTER_BY_ACTIVE, f => f.type === redirectFilter.filter.isActive).value
        //     : 1;
        this.isActive = redirectFilter && redirectFilter.filter && redirectFilter.filter.isActive
            ? UtilService.getDefaultValue(FILTER_BY_ACTIVE, redirectFilter.filter.isActive)
            : 1;
    }
    componentDidMount() {
        let self = this;
        let filter = this.props.location.filter;
        if (filter) {
            this.setState({ filter: filter, paginate: false }, () => {
                self.fetch();
            });
        } else {
            this.fetch();
        }
    }

    fetch = async page => {
        this.setState({ loading: true, data: [] });
        if (page) {
            this.setState(state => {
                state.filter.page = page;

                return state;
            });
        }
        localStorage.removeItem("pageFilter");
        try {
            let response = await axios.post(
                "admin/user/paginate",
                this.state.filter
            );

            if (response.code === "OK") {
                this.setState({
                    total: response.data.count,
                    loading: false,
                    data: response.data.list,
                    paginate: true
                });
            }

            this.setState({ loading: false });
        } catch (error) {
            console.log("Error****:", error.message);
            this.setState({ loading: false });
        }
    };
    handleClick = () => {
        this.setState({
            showModal: true
        });
    };
    handleSubmit = data => {
        let obj = {};
        obj.ids = this.state.selectedRecord;
        obj.isActive = data;
        let self = this;
        axios
            .put("/admin/user/active-deactive", obj)
            .then(data => {
                if (data.code === "OK") {
                    _.each(this.state.data, val => {
                        val.selected = false;
                    });
                    message.success(data.message);
                    this.setState(
                        state => {
                            state.selectRecord = [];
                            state.filter.page = 1;
                            state.paginate = false;
                            state.selectedRecord = [];
                        },
                        () => {
                            self.fetch();
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
            disabled: false
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
    handleSelection = (selectedVal, isAscending, key, listData) => {
        let self = this;

        let obj = {
            selectedVal: selectedVal,
            isAscending: isAscending,
            key: key,
            listData: listData
        };

        let data = UtilService.commonFilter(obj);
        self[key] = selectedVal;
        self.setState(state => {
            if (data !== "error") {
                if (key === "sort") {
                    state.filter[key] = data;
                } else {
                    state.filter.filter[key] = data.type;
                }
            } else {
                if (key === "sort") {
                    delete state.filter[key];
                } else {
                    delete state.filter.filter[key];
                }
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
    selectAll = () => {
        let self = this;
        this.setState({ disabled: true });
        if (this.state.selectedRecord.length !== this.state.data.length) {
            _.each(this.state.data, data => {
                data.selected = true;
                let existId = _.indexOf(self.state.selectedRecord, data.id);
                if (existId < 0) {
                    self.state.selectedRecord.push(data.id);
                }
            });
        } else {
            this.setState({
                selectedRecord: []
            });
            _.each(this.state.data, data => {
                data.selected = false;
            });
        }
    };
    handleSearch = newState => {
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
    getAddress = data => {
        if (data) {
            let address = {};
            let addressString = "";
            address = _.find(data, { isPrimary: true });
            if (!address && !_.size(address)) {
                address = _.first(address);
            }

            if (address && (address.line1 || address.state || address.city)) {
                addressString = `${address.line1}, ${address.state}, ${address.city}.`;
            }

            return addressString;
        }
    };
    onAdd = () => {
        this.setState({
            isTypeRedirect: true
        });
    };

    exportExcel = () => {
        this.setState({ loading: true })
        axios
            .post('admin/user/export-users', this.state.filter)
            .then(async (data) => {
                this.setState({ loading: false })
                if (data && data.data && data.data.list && data.data.list.length === 0) {
                    message.error('No records found!');
                    return;
                }
                if (data.code === 'OK' && data && data.data) {
                    data.data.list.map((data) => {
                        for (let key in data) {
                            if (['SignUpDate'].includes(key)) {
                                data[key] = UtilService.displayDate(data[key]);
                            }      
                        }
                    });
                    await this.setState({
                        excelData: data.data.list
                    });
                    exportRef.link.click();
                } else {
                    message.error(data.message)
                }
            })
            .catch((error) => {
                message.error(error.message)
                this.setState({ loading: false })
                console.log('ERROR   ', error);
            });
    }

    render() {
        const {
            data,
            loading,
            selectedRecord,
            isTypeRedirect,
            filter
        } = this.state;
        let FilterArray = [
            {
                title: <IntlMessages id="app.sortBy" />,
                list: SORT_BY_ARRAY_USER,
                sorter: true,
                isDesc: this.isDesc,
                defaultSelected: this.sort,
                key: "sort"
            },
            {
                title: <IntlMessages id="app.status" />,
                list: FILTER_BY_ACTIVE,
                defaultSelected: this.isActive,
                key: "isActive"
            }
        ];
        if (isTypeRedirect) {
            return (
                <Redirect
                    to={{
                        pathname: `/e-scooter/${RIDER_ROUTE}/upsert`,
                        type: filter.filter.type,
                        filter: filter
                    }
                    }
                />
            );
        }

        return (
            <div className="gx-module-box gx-mw-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <h1 className="pageHeading">{RIDER_LABEL}</h1>
                            <div className="SearchBarwithBtn">
                            { EXPORT_EXCEL  &&
                                        <span
                                            className="ant-radio-button-wrapper"
                                            style={{ marginRight: 10, borderRadius: 5 }}
                                            onClick={this.exportExcel}>
                                            <Icon type="download" />
                                        </span>
                                        }
                                    <CSVLink
                                        data={this.state.excelData}
                                        filename={'UserData.csv'}
                                        className="hidden"
                                        ref={(ref) => {
                                            exportRef = ref;
                                        }}
                                        target="_blank"
                                    />
                                <Search
                                    filter={this.state.filter}
                                    keys={[
                                        "name",
                                        "emails.email",
                                        "mobiles.mobile"
                                    ]}
                                    handelSearch={this.handleSearch}
                                    placeholder="Search by name, email or mobile"
                                />
                                <AddButton
                                    onClick={this.onAdd}
                                    text={<div style={{ display: "flex" }}><IntlMessages id="app.add" /> {RIDER_LABEL}</div>}
                                    pageId={PAGE_PERMISSION.RIDERS}
                                />
                            </div>
                        </Row>
                        <Row
                            type="flex"
                            align="middle"
                            justify="space-between"
                            style={{ marginTop: 20 }}
                        >
                            <div className="DropdownWidth">
                                {FilterArray.map(filter => {
                                    return (
                                        <FilterDropdown
                                            title1={filter.title}
                                            list={filter.list}
                                            sorter={filter && filter.sorter}
                                            isDesc={filter && filter.isDesc}
                                            defaultSelected={
                                                filter.defaultSelected
                                            }
                                            key={filter.key}
                                            handleSelection={(
                                                val,
                                                isAscending
                                            ) => {
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
                <div className="RidersList RidersListingWithWidth">
                    <List
                        itemLayout="horizontal"
                        dataSource={data}
                        loading={loading}
                        renderItem={item => {
                            return (
                                <List.Item
                                    className={
                                        item.selected
                                            ? "list-item-selected"
                                            : ""
                                    }
                                >
                                    <div className="ant-list-item-meta">
                                        <div
                                            className="totalRideCounter ant-list-item-meta-avatar"
                                            onClick={this.selectRecord.bind(
                                                this,
                                                item.id
                                            )}
                                        >
                                            <span className="ant-avatar ant-avatar-circle ant-avatar-image gx-pointer">
                                                {item.selected ? (
                                                    <SelectCheck />
                                                ) : item.image ? (
                                                    <img
                                                        alt=""
                                                        src={`${BASE_URL}/${item.image}`}
                                                    />
                                                ) : (
                                                            <h2
                                                                style={{
                                                                    lineHeight: "70px"
                                                                }}
                                                            >
                                                                {item.name.length === 0
                                                                    ? GUEST_USER_STRING.charAt(0).toUpperCase()
                                                                    : item.name.charAt(0).toUpperCase()}
                                                            </h2>
                                                        )}
                                            </span>
                                        </div>
                                        <div className="ant-list-item-meta-content">
                                            <div
                                                className="user-title-note"
                                                style={{ marginBottom: "-3px", display: 'flex' }}
                                            >
                                                <UserId
                                                    name={(item.name.length === 0) ? GUEST_USER_STRING : item.name}
                                                    userId={item.id}
                                                    currentPage={window.location.pathname}
                                                    filter={this.state.filter}
                                                />
                                                {FEEDER_VISIBLE && item.feederId && item.feederId.id &&
                                                    <span style={{ marginLeft: 15 }}>
                                                        <Link to={`/e-scooter/${FEEDER_ROUTE}/view/${item.feederId.id}`}>
                                                            <Tag color="green" className="gx-pointer">{FEEDER_LABEL}</Tag>
                                                        </Link>
                                                    </span>
                                                }
                                                {/* <AddNotes/>
                                            <Task/> */}
                                            </div>
                                            {
                                                item.dob.length !== 0 &&
                                                <div className="ant-list-item-meta-description">
                                                    <DOB />
                                                    <div className="locationEllipse">
                                                        {UtilService.displayDOB(
                                                            item.dob
                                                        )}
                                                    </div>
                                                </div>
                                            }
                                            {
                                                item.mobiles && item.mobiles.length !== 0 &&
                                                <div className="ant-list-item-meta-description">
                                                    &nbsp; <Mobile />{" "}
                                                    {_.size(item.mobiles) > 0 &&
                                                        UtilService.getPrimaryValue(
                                                            item.mobiles,
                                                            "mobile"
                                                        )}
                                                </div>
                                            }
                                        </div>
                                        <div className="listItems-otherDetail" style={{ marginTop: (item.dob.length !== 0 && item.mobiles && item.mobiles.length !== 0) ? 45 : (item.mobiles && item.mobiles.length > 0) ? 22 : 0 }}>
                                            {item.emails && item.emails.length !== 0 &&
                                                <div className="ant-list-item-meta-description">
                                                    <Email />{" "}
                                                    <span className="rider-email-span">
                                                        {_.size(item.emails) > 0 &&
                                                            UtilService.getPrimaryValue(
                                                                item.emails,
                                                                "email"
                                                            )}
                                                    </span>
                                                </div>
                                            }
                                        </div>
                                        <div className="cardRightThumb">
                                            <div className="cardRightContainer">
                                                <div className="totalRideCounter">
                                                    <div>
                                                        <h2>
                                                            {item.rideSummary &&
                                                                item.rideSummary
                                                                    .booked
                                                                ? item
                                                                    .rideSummary
                                                                    .booked
                                                                : 0}
                                                        </h2>
                                                        <div className="lbl">
                                                            <IntlMessages id="app.rides" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="action-btnsWithSignupDate">
                                                    <div className="ActionNotification">
                                                        <ActiveDeactive
                                                            onSuccess={this.fetch.bind(
                                                                this
                                                            )}
                                                            key={item.id}
                                                            documentId={item.id}
                                                            isActive={
                                                                item.isActive
                                                            }
                                                            model="user"
                                                        />
                                                        <div className="filterIC">

                                                            <Link
                                                                to={`/e-scooter/notification/notifyUser?id=${item.id}&&type=${item.type}`}
                                                            >
                                                                <ESToolTip placement="top" text={<IntlMessages id="app.rider.sendNotification" />}>
                                                                    <Notification />
                                                                </ESToolTip>
                                                            </Link>

                                                        </div>
                                                        <ActionButtons
                                                            pageId={
                                                                PAGE_PERMISSION.RIDERS
                                                            }
                                                            view={`/e-scooter/${RIDER_ROUTE}/view/${item.id}`}
                                                            edit={`/e-scooter/${RIDER_ROUTE}/upsert/${item.id}`}
                                                            filter={this.state.filter}
                                                        />
                                                    </div>
                                                    <div className="signupDate">
                                                        <IntlMessages id="app.signUpDate" />:
                                                        {UtilService.displayDate(
                                                            item.createdAt
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </List.Item>
                            );
                        }}
                    />
                </div>
                {selectedRecord.length > 0 ? (
                    <div className="selectOptionBottom">
                        <div className="selectRideOptions">
                            <div className="selectAllOption rider-anchor">
                                <a href="/#" onClick={(e) => { e.preventDefault(); this.selectAll() }} >
                                    {selectedRecord.length === data.length
                                        ? <><IntlMessages id="app.rider.deselectAll" /> {RIDER_LABEL}</>
                                        : <><IntlMessages id="app.rider.selectAll" /> {RIDER_LABEL}</>
                                    }
                                </a>
                                <Button
                                    // type="primary"
                                    onClick={this.handleClick}
                                    className="ridersButton"
                                >
                                    <IntlMessages id="app.activeDeactive" />
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
            </div>
        );
    }
}

export default Riders;
