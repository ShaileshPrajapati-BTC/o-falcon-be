/* eslint-disable no-nested-ternary */
import { Button, List, Row, message, Affix, Tag, Icon } from "antd";
import {
    FILTER_BY_ACTIVE,
    USER_TYPES,
    PAGE_PERMISSION,
    SORT_BY_ARRAY_USER,
    GUEST_USER_STRING,
    BASE_URL,
    FEEDER_ROUTE,
    FEEDER_LABEL,
    FILTER_BY_TASK_LEVEL,
    RIDER_LABEL,
    RIDER_ROUTE,
    FEEDER_LABEL_STRING
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
import { ReactComponent as SelectCheck } from "../../assets/svg/selectCheck.svg";
import UtilService from "../../services/util";
import axios from "util/Api";
import Search from "../../components/ESSearch";
import FeederId from "../CommonComponent/FeederId";
import ESToolTip from "../../components/ESToolTip";
import ESTag from "../../components/ESTag";
import ChangeFeederLevel from "./ChangeFeederLevel";
const _ = require("lodash");

class Feeder extends Component {
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
                    type: USER_TYPES.FEEDER,
                    isDeleted: false
                }
            },
            changeLevelModal: false,
            changeLevelFeederId: "",
            cuurentFeederLevel: 0
        };
        let redirectFilter = this.props.location.filter;
        this.defaultFilterBy = 1;
        this.sort = redirectFilter && redirectFilter.sort
            ? _.find(SORT_BY_ARRAY_USER, f => f.type === redirectFilter.sort.split(" ")[0]).value
            : 3;
        this.isDesc = redirectFilter && redirectFilter.sort ? (redirectFilter.sort.split(" ")[1] === 'ASC' ? false : true) : true;
        this.isActive = redirectFilter && redirectFilter.filter && redirectFilter.filter.isActive
            ? UtilService.getDefaultValue(FILTER_BY_ACTIVE, redirectFilter.filter.isActive)
            : 1;
        this.level = redirectFilter && redirectFilter.filter && redirectFilter.filter.level
            ? UtilService.getDefaultValue(FILTER_BY_ACTIVE, redirectFilter.filter.level)
            : 0;
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
        try {
            let response = await axios.post("admin/feeder/paginate", this.state.filter);
            if (response.code === "OK") {
                this.setState({
                    total: response.data.count,
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
    changeLevel = (id, level) => {
        this.setState({ changeLevelModal: true, changeLevelFeederId: id, cuurentFeederLevel: level })
    }
    onChangeLevelSubmit = () => {
        this.onChangeLevelCancel();
        this.fetch();
    }
    onChangeLevelCancel = () => {
        this.setState({ changeLevelModal: false, changeLevelFeederId: "", cuurentFeederLevel: 0 })
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
                title: "Sort by",
                list: SORT_BY_ARRAY_USER,
                sorter: true,
                isDesc: this.isDesc,
                defaultSelected: this.sort,
                key: "sort"
            },
            {
                title: "Status",
                list: FILTER_BY_ACTIVE,
                defaultSelected: this.isActive,
                key: "isActive"
            },
            {
                title: "Feeder Level",
                list: FILTER_BY_TASK_LEVEL,
                defaultSelected: this.level,
                key: "level",
            }
        ];
        if (isTypeRedirect) {
            return (
                <Redirect
                    to={{
                        pathname: `/e-scooter/${FEEDER_ROUTE}/upsert`,
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
                            <h1 className="pageHeading">{FEEDER_LABEL}</h1>
                            <div className="SearchBarwithBtn">
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
                                    text={`Add ${FEEDER_LABEL_STRING}`}
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
                                    className={item.selected ? "list-item-selected" : ""} >
                                    <div className="ant-list-item-meta">
                                        <div
                                            className="totalRideCounter ant-list-item-meta-avatar"
                                            onClick={this.selectRecord.bind(this, item.id)}
                                        >
                                            <span className="ant-avatar ant-avatar-circle ant-avatar-image gx-pointer">
                                                {item.selected ?
                                                    <SelectCheck />
                                                    : item.image ?
                                                        <img alt="" src={`${BASE_URL}/${item.image}`} />
                                                        : <h2 style={{
                                                            lineHeight: "70px"
                                                        }}>
                                                            {item.name.length === 0
                                                                ? GUEST_USER_STRING
                                                                : item.name.charAt(0).toUpperCase()}
                                                        </h2>
                                                }
                                            </span>
                                        </div>
                                        <div className="ant-list-item-meta-content">
                                            <div
                                                className="user-title-note"
                                                style={{ marginBottom: "-3px", display: 'flex' }}
                                            >
                                                <FeederId
                                                    name={(item.name.length === 0) ? GUEST_USER_STRING : item.name}
                                                    userId={item.id}
                                                    currentPage={window.location.pathname}
                                                    filter={this.state.filter}
                                                />
                                                {item.customerId && item.customerId.id &&
                                                    <span style={{ marginLeft: 15 }}>
                                                        <Link to={`/e-scooter/${RIDER_ROUTE}/view/${item.customerId.id}`}>
                                                            <Tag color="green" className="gx-pointer">{RIDER_LABEL}</Tag>
                                                        </Link>
                                                    </span>
                                                }
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
                                                <div className="tagDisplay">
                                                    {item.level &&
                                                        <span style={{ marginLeft: 15 }}>
                                                            <ESTag
                                                                status={item.level}
                                                                filterArray={FILTER_BY_TASK_LEVEL}
                                                            />
                                                        </span>
                                                    }
                                                </div>
                                                <div className="totalRideCounter">
                                                    <div>
                                                        <h2>
                                                            {item.taskSummery &&
                                                                item.taskSummery.inProgressTotal
                                                                ? item.taskSummery.inProgressTotal
                                                                : 0}
                                                        </h2>
                                                        <div className="lbl">
                                                            Tasks
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="action-btnsWithSignupDate">
                                                    <div className="ActionNotification">
                                                        <ActiveDeactive
                                                            onSuccess={this.fetch.bind(this)}
                                                            key={item.id}
                                                            documentId={item.id}
                                                            isActive={item.isActive}
                                                            model="user"
                                                        />
                                                        <div className="filterIC">
                                                            <Link to={`/e-scooter/notification/notifyUser?id=${item.id}&&type=${item.type}`} >
                                                                <ESToolTip placement="top" text="Send Notification">
                                                                    <Notification />
                                                                </ESToolTip>
                                                            </Link>

                                                        </div>
                                                        <ActionButtons
                                                            pageId={PAGE_PERMISSION.FEEDER}
                                                            view={`/e-scooter/${FEEDER_ROUTE}/view/${item.id}`}
                                                            edit={`/e-scooter/${FEEDER_ROUTE}/upsert/${item.id}`}
                                                            filter={this.state.filter}
                                                            displayAfter={
                                                                <ESToolTip placement="top" text="Change Level">
                                                                    <div className="scooterIC">
                                                                        <a href="/#" onClick={(e) => e.preventDefault()}>
                                                                            <Icon
                                                                                type="rollback"
                                                                                onClick={() => { return this.changeLevel(item.id, item.level); }}
                                                                            />
                                                                        </a>
                                                                    </div>
                                                                </ESToolTip>
                                                            }
                                                        />
                                                    </div>
                                                    <div className="signupDate">
                                                        Signup Date:
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
                {this.state.changeLevelModal &&
                    <ChangeFeederLevel
                        onCreate={this.onChangeLevelSubmit}
                        onCancel={this.onChangeLevelCancel}
                        level={this.state.cuurentFeederLevel}
                        id={this.state.changeLevelFeederId}
                    />
                }
                {selectedRecord.length > 0 ? (
                    <div className="selectOptionBottom">
                        <div className="selectRideOptions">
                            <div className="selectAllOption">
                                <a href="/#" onClick={(e) => { e.preventDefault(); this.selectAll() }} >
                                    {selectedRecord.length === data.length
                                        ? `Deselect all ${FEEDER_LABEL}`
                                        : `Select all ${FEEDER_LABEL}`}
                                </a>
                                <Button
                                    // type="primary"
                                    onClick={this.handleClick}
                                    className="ridersButton"
                                >
                                    Active/Deactive
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

export default Feeder;
