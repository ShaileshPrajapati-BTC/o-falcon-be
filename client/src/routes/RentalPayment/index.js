/* eslint-disable no-nested-ternary */
import { Row, Affix, Tabs, DatePicker, Button } from "antd";
import {
  FILTER_BY_ACTIVE,
  RENTAL_PAYMENT_TYPE,
  RENTAL_PAYMENT_FILTER_TYPE,
  RENT_PAYMENT_TYPE,
  FRANCHISEE_LABEL,
  USER_TYPES,
  PROJECT_NAME
} from "../../constants/Common";
import React, { Component } from "react";
import ESPagination from "../../components/ESPagination";
import FilterDropdown from "../../components/FilterDropdown";
import UtilService from "../../services/util";
import axios from "util/Api";
import Search from "../../components/ESSearch";
import RentalPaymentTable from './RentalPaymentTable';
import moment from "moment";
import { DEFAULT_BASE_CURRENCY, DEALER_LABEL } from "../../constants/Setup";
import { connect } from "react-redux";

const _ = require("lodash");
const { TabPane } = Tabs;
const dateFormat = "DD/MM/YYYY";
const { RangePicker } = DatePicker;

class RentalPayment extends Component {
  constructor(props) {
    super(props);
    const { auth } = this.props;
    let filter = {
      status: RENTAL_PAYMENT_TYPE.REQUESTED,
      createdAt: {
        ">=": UtilService.getStartOfTheDay(moment().subtract(1, "months").toISOString()),
        "<=": UtilService.getEndOfTheDay(moment().toISOString())
      },
    };
    if (auth && auth.authUser && auth.authUser.type === USER_TYPES.FRANCHISEE) {
      filter.referenceId = auth.authUser.id;
    }
    this.state = {
      data: [],
      total: 0,
      fileUploadProcess: false,
      loading: false,
      disabled: false,
      selectedRecord: [],
      paginate: false,
      filter: {
        page: 1,
        limit: 10,
        filter: filter,
        sort: "dateTime DESC"
      },
      statusWiseCount: [],
      date: [moment().subtract(1, "months"), moment()],
      loginUser: auth && auth.authUser ? auth.authUser : null,
      accountReceivable: 0,
      accountPayable: 0
    };
    let redirectFilter = this.props.location.filter;
    this.SORT_BY_ARRAY = [
      {
        label: "Amount",
        key: "amount",
        value: 1,
        type: "amount"
      },
      {
        label: "Request Date",
        key: "dateTime",
        value: 2,
        type: "dateTime"
      }
    ];
    this.defaultFilterBy = 1;
    this.sort = 2;
    this.type = 1;
    this.isDesc = redirectFilter && redirectFilter.sort ? (redirectFilter.sort.split(" ")[1] === 'ASC' ? false : true) : true;
    this.isActive = redirectFilter && redirectFilter.filter && redirectFilter.filter.isActive
      ? UtilService.getDefaultValue(FILTER_BY_ACTIVE, redirectFilter.filter.isActive)
      : 1;
    this.franchiseeList = _.filter(this.props.franchisee.franchisee, (data) => { return data.type !== null });
    // this.dealerList = _.filter(this.props.dealer.dealersList, (data) => { return data.type !== null });
    this.referenceId = 0;
  }
  componentDidMount() {
    if (this.state.loginUser.type === USER_TYPES.FRANCHISEE) {
      this.setState((state) => {
        state.filter.filter.parentId = this.state.loginUser.id;
      })
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
    // this.fetchSummary();
  }
  componentWillReceiveProps = (nextProps) => {
    if (this.props.franchisee && this.props.franchisee.franchisee !== nextProps.franchisee.franchisee) {
      this.franchiseeList = _.filter(nextProps.franchisee.franchisee, (data) => { return data.type !== null });
    }
    // if (this.props.dealer && this.props.dealer.dealersList !== nextProps.dealer.dealersList) {
    //   this.dealerList = _.filter(nextProps.dealer.dealersList, (data) => { return data.type !== null });
    // }
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
      let response = await axios.post("/admin/rent-payment/paginate", this.state.filter);
      if (response.code === "OK") {
        this.setState({
          total: response.data.count,
          statusWiseCount: response.data.statusWiseCount,
          loading: false,
          data: response.data.list,
          paginate: true
        });
      }
      this.setState({ loading: false });
      this.fetchSummary();
    } catch (error) {
      console.log("Error****:", error.message);
      this.setState({ loading: false });
    }
  };
  fetchSummary = async () => {
    try {
      this.setState({ loading: true });
      const { loginUser } = this.state;
      let summaryData = await axios.post(`/admin/rent-payment/summary`, this.state.filter);
      let { accountReceivable, accountPayable } = summaryData.data;
      this.setState({ loading: false, accountReceivable, accountPayable });
    } catch (error) {
      console.log('Error****:', error.message);
      this.setState({ loading: false });
    }
  }
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

  dateChange = async (date, dateString) => {
    let from = UtilService.getStartOfTheDay(moment(date[0]).startOf("day").toISOString());
    let to = UtilService.getEndOfTheDay(moment(date[1]).toISOString());
    let range = { ">=": from, "<=": to };
    let value = [moment(date[0]), moment(date[1])]
    this.setState(state => {
      state.filter.filter.createdAt = range;
      state.filter.page = 1;
      state.paginate = false;
      state.date = value;
    }, async () => {
      await this.fetch();
    });
  };

  tabCallback = async (key) => {
    this.setState({
      filter: {
        ...this.state.filter,
        page: 1,
        filter: { ...this.state.filter.filter, status: parseInt(key) }
      },
      paginate: false,
    }, async () => await this.fetch())
  }

  getStatusWiseCount = () => {
    const { statusWiseCount } = this.state;
    let requestedCount = 0;
    let transferredCount = 0;
    let cancelledCount = 0;

    let requestedCountObj = _.find(statusWiseCount, e => e.status === RENTAL_PAYMENT_TYPE.REQUESTED);
    if (requestedCountObj) {
      requestedCount = requestedCountObj.count;
    }

    let transferredCountObj = _.find(statusWiseCount, e => e.status === RENTAL_PAYMENT_TYPE.TRANSFERRED);
    if (transferredCountObj) {
      transferredCount = transferredCountObj.count;
    }

    let cancelledCountObj = _.find(statusWiseCount, e => e.status === RENTAL_PAYMENT_TYPE.REJECTED);
    if (cancelledCountObj) {
      cancelledCount = cancelledCountObj.count;
    }

    return {
      requestedCount,
      transferredCount,
      cancelledCount
    }
  }

  generateData = async () => {
    try {
      this.setState({ loading: true });
      await axios.get('/admin/rent-payment/make-dummy-data');
      this.fetch();
      this.setState({ loading: false });
    } catch (error) {
      console.log('Error****:', error.message);
      this.setState({ loading: false });
    }
  }

  render() {
    const { data, loading, filter, accountReceivable, accountPayable, loginUser } = this.state;
    let isSuperAdmin = loginUser && loginUser.type === USER_TYPES.SUPER_ADMIN;
    let isFranchisee = loginUser && loginUser.type === USER_TYPES.FRANCHISEE;
    let isDealer = loginUser && loginUser.type === USER_TYPES.DEALER;

    let FilterArray = [
      {
        title: "Sort by",
        list: this.SORT_BY_ARRAY,
        sorter: true,
        isDesc: this.isDesc,
        defaultSelected: this.sort,
        key: "sort",
        visible: true
      },
      // {
      //   title: "Type",
      //   list: RENTAL_PAYMENT_FILTER_TYPE,
      //   defaultSelected: this.type,
      //   key: "type",
      //   visible: true
      // },
      {
        title: FRANCHISEE_LABEL,
        list: this.franchiseeList,
        defaultSelected: this.referenceId,
        key: 'referenceId',
        visible: this.props.franchisee.franchisee.length > 2 && !isFranchisee && !isDealer
      },
      // {
      //   title: `${DEALER_LABEL}`,
      //   list: this.dealerList,
      //   defaultSelected: this.referenceId,
      //   key: 'referenceId',
      //   visible: this.props.dealer.dealersList.length > 2 && isFranchisee
      // }
    ];

    const { requestedCount, transferredCount, cancelledCount } = this.getStatusWiseCount();
    const showAmount = <React.Fragment>
      <span style={{ marginRight: 10 }}>Payable : <span style={{ color: "red" }}>{accountPayable.toFixed(2)} {DEFAULT_BASE_CURRENCY}</span></span>
      <span style={{ marginRight: 10 }}>Receivable : <span style={{ color: "green" }}>{accountReceivable.toFixed(2)} {DEFAULT_BASE_CURRENCY}</span></span>
    </React.Fragment >

    let pageHeading = "Rental Payment";
    if (isFranchisee) {
      pageHeading = `${PROJECT_NAME} Payments`;
    }

    return (
      <div className="gx-module-box gx-mw-100">
        <Affix offsetTop={1}>
          <div className="gx-module-box-header">
            <Row type="flex" align="middle" justify="space-between">
              <h1 className="pageHeading">{pageHeading}</h1>
              {/* {isSuperAdmin && <Button onClick={() => {this.generateData()}}type="primary">
                Generate Data
              </Button>} */}
              <div className="SearchBarwithBtn">
                <Search
                  filter={filter}
                  keys={["requestId"]}
                  handelSearch={this.handleSearch}
                  placeholder="Search by Request ID"
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
                    filter.visible && <FilterDropdown
                      title1={filter.title}
                      list={filter.list}
                      sorter={filter && filter.sorter}
                      isDesc={filter && filter.isDesc}
                      defaultSelected={filter.defaultSelected}
                      handleSelection={(val, isAscending) => {
                        this.handleSelection(val, isAscending, filter.key, filter.list);
                      }}
                    />
                  );
                })}
                <div className="graphFilterWithCalander gx-d-flex">
                  <div className="dateRanges">
                    <RangePicker
                      defaultValue={[moment().subtract(1, "months"), moment()]}
                      value={this.state.date}
                      format={dateFormat}
                      onChange={this.dateChange.bind(this)}
                    />
                  </div>
                </div>
              </div>
              {
                this.state.paginate && <ESPagination
                  limit={this.state.filter.limit}
                  total={this.state.total}
                  fetch={this.fetch.bind(this)}
                  page={this.state.filter.page}
                />
              }
            </Row>
          </div>
        </Affix>
        <div className="RidersList RidersListingWithWidth project-config-tab">
          <Tabs onChange={this.tabCallback} tabBarExtraContent={showAmount}>
            <TabPane tab={<div>Requests <span className="payout-tab-count">{requestedCount}</span></div>}
              key={RENTAL_PAYMENT_TYPE.REQUESTED}>
              <RentalPaymentTable
                tab="request"
                data={data}
                filter={filter}
                fetch={this.fetch}
                loading={loading}
              />
            </TabPane>
            <TabPane tab={<div>Transferred <span className="payout-tab-count">{transferredCount}</span></div>}
              key={RENTAL_PAYMENT_TYPE.TRANSFERRED}>
              <RentalPaymentTable
                tab="transfer"
                data={data}
                filter={filter}
                fetch={this.fetch}
                loading={loading}
              />
            </TabPane>
            <TabPane tab={<div>Cancelled <span className="payout-tab-count">{cancelledCount}</span></div>}
              key={RENTAL_PAYMENT_TYPE.REJECTED}>
              <RentalPaymentTable
                tab="cancel"
                data={data}
                filter={filter}
                fetch={this.fetch}
                loading={loading}
              />
            </TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}

const mapStateToProps = function (props) {
  return props;
};

export default connect(mapStateToProps)(RentalPayment);
