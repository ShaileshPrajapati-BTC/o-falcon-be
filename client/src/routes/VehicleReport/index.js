import React, { Component } from 'react';
import { message, Affix, Row, Table, Icon, Tabs, DatePicker } from 'antd';
import axios from "util/Api";
import { DEFAULT_API_ERROR, VEHICLE_REPORT_ISSUE_TYPE, PAGE_PERMISSION, TASK_MODULE_VISIBLE, VEHICLE_REPORT_STATUS, SORT_BY_CREATED_AT_Report } from "../../constants/Common";
import Search from "../../components/ESSearch";
import ESPagination from "../../components/ESPagination";
import { connect } from "react-redux";
import ReportTable from './reportTable';
import ViewReport from './view';
import moment from "moment";
import UtilService from '../../services/util';
import FilterDropdown from '../../components/FilterDropdown';
import ChangeStatus from './ChangeStatus';
import StatusTrack from "./StatusTrack";
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const _ = require('lodash');
const dateFormat = "DD/MM/YYYY";
class VehicleReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: false,
      paginate: false,
      total: 0,
      filter: {
        page: 1,
        limit: 10,
        sort: "createdAt DESC",
        filter: {
          // taskId: null,
          status: VEHICLE_REPORT_STATUS.SUBMITTED,
          createdAt: {
            ">=": UtilService.getStartOfTheDay(moment().subtract(1, "months").toISOString()),
            "<=": UtilService.getEndOfTheDay(moment().toISOString())
          }
        }
      },
      viewModel: false,
      viewId: '',
      date: [moment().subtract(1, "months"), moment()],
      changeStatusModel: false,
      changeStatusReportObj: {},
      viewStatusTrack: false,
      statusTrack: [],
    }
    this.sort = 1;
    this.isDesc = true;
  }

  componentDidMount = () => {
    this.fetch()
  }
  fetch = async (page) => {
    this.setState({ loading: true })
    if (page) {
      this.setState(state => {
        state.filter.page = page
        return state
      })
    }

    try {
      let response = await axios.post("/admin/report/paginate", this.state.filter)
      if (response.code === 'OK') {
        this.setState({
          total: response.data.count,
          loading: false,
          paginate: true,
          data: response.data.list
        })
      } else {
        message.error(response.message)
      }
    } catch (error) {
      let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
      message.error(errorMsg);
      this.setState({ loading: false });
    }
  }
  tabCallback = async (key) => {
    this.setState({
      filter: {
        ...this.state.filter,
        page: 1,
        filter: {
          status: parseInt(key)
        }
      },
      paginate: false,
    }, async () => {
      await this.fetch();
    })
  }
  handelSearch = (search) => {
    this.setState({
      filter: search,
      paginate: false
    }, () => this.fetch());
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
  handleView = (id) => {
    this.setState({ viewModel: true, viewId: id })
  }
  handleViewCancel = () => {
    this.setState({ viewModel: false, viewId: '' })
  }
  dateChange = (date) => {
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

  changeStatus = (id) => {
    let obj = {
      id: id,
      currentStatus: this.state.filter.filter.status
    }
    this.setState({ changeStatusModel: true, changeStatusReportObj: obj })
  }
  handleOnCreate = () => {
    this.handleSatatusCancel();
    this.fetch();
  }
  handleSatatusCancel = (id) => {
    this.setState({ changeStatusModel: false, changeStatusReportObj: {} })
  }
  statusTrack = (data) => {
    this.setState({ viewStatusTrack: true, statusTrack: data })
  }
  onCancelStatusTrack = () => {
    this.setState({ viewStatusTrack: false, statusTrack: [] })
  }
  taskCreated = () => {
    this.props.history.push("/e-scooter/task-list")
  }
  render() {
    let FilterArray = [
      {
        title: "Sort by",
        list: SORT_BY_CREATED_AT_Report,
        sorter: true,
        isDesc: this.isDesc,
        defaultSelected: this.sort,
        key: "sort"
      },
    ];
    let tabObj = [
      {
        title: 'Submitted',
        tab: 'submitted',
        key: VEHICLE_REPORT_STATUS.SUBMITTED
      },
      {
        title: 'In Progress',
        tab: 'inProgress',
        key: VEHICLE_REPORT_STATUS.TASK_CREATED
      },
      {
        title: 'Resolved',
        tab: 'resolved',
        key: VEHICLE_REPORT_STATUS.RESOLVED
      },
      {
        title: 'Cancelled',
        tab: 'cancelled',
        key: VEHICLE_REPORT_STATUS.CANCELED
      },
    ];

    return (
      <div className="gx-module-box gx-vw-100">
        <Affix offsetTop={1}>
          <div className="gx-module-box-header">
            <Row type="flex" align="middle" justify="space-between">
              <h1 className="pageHeading">Vehicle Report</h1>
              <div className="SearchBarwithBtn">
                <Search
                  filter={this.state.filter}
                  keys={['reportNumber']} // put keywords here for search
                  handelSearch={this.handelSearch}
                  placeholder="Search by Report Id"
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
                      handleSelection={(val, isAscending) => {
                        this.handleSelection(val, isAscending, filter.key, filter.list);
                      }}
                    />
                  );
                })}
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
        <div className="RidersList RidersListingWithWidth project-config-tab">
          {/* {
            TASK_MODULE_VISIBLE ? */}
          <Tabs onChange={this.tabCallback}>
            {tabObj.map((item) => {
              return (
                <TabPane tab={<div>{item.title} </div>}
                  key={item.key}
                >
                  <ReportTable
                    loading={this.state.loading}
                    data={this.state.data}
                    tab={item.tab}
                    tabkey={item.key}
                    fetch={this.fetch}
                    taskCreated={this.taskCreated}
                    handleView={this.handleView}
                    changeStatus={this.changeStatus}
                    statusTrack={this.statusTrack}
                  />
                </TabPane>
              )
            })}
          </Tabs>
          {/* : <ReportTable
                loading={this.state.loading}
                data={this.state.data}
                tab='completed'
                fetch={this.fetch}
                handleView={this.handleView}
                changeStatus={this.changeStatus}
                statusTrack={this.statusTrack}
              />
          } */}
          {this.state.viewModel && (
            <ViewReport
              visible={this.state.viewModel}
              viewId={this.state.viewId}
              onCancel={this.handleViewCancel}
            />
          )}
          {this.state.changeStatusModel && (
            <ChangeStatus
              visible={this.state.changeStatusModel}
              obj={this.state.changeStatusReportObj}
              onCancel={this.handleSatatusCancel}
              onCreate={this.handleOnCreate}
            />
          )}
          {this.state.viewStatusTrack && (
            <StatusTrack
              data={this.state.statusTrack}
              visible={this.state.viewStatusTrack}
              onCancel={this.onCancelStatusTrack}
            />
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = function (props) {
  return props;
};

export default connect(mapStateToProps)(VehicleReport);
