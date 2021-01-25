/* eslint-disable */
import React, { Component } from "react";
import { connect } from "react-redux";
import ActiveDeactive from "../../components/custom/ActiveDeactive";
import {
  Affix,
  Card,
  Table,
  Input,
  message,
  Button,
  Badge,
  Row,
  Icon,
  Tooltip,
  Typography
} from "antd";
import axios from "util/Api";
import CustomScrollbars from "../../util/CustomScrollbars";
import LocationUpsertForm from "./LocationUpsert";
import HeaderTitle from "../../components/HeaderTitle";
import ActionButtons from "../../components/ActionButtons";
import ESPagination from "../../components/ESPagination";
import AddButton from '../../components/ESAddButton';
import Search from '../../components/ESSearch';
import { PAGE_PERMISSION, FILTER_BY_ACTIVE, LOCATION_TYPE, DEFAULT_API_ERROR } from "../../constants/Common";

import UtilService from '../../services/util';
import FilterDropdown from '../../components/FilterDropdown';

const { Title } = Typography;
const _ = require("lodash");

class Location extends Component {
  editId = null;
  isActive = 1
  state = {
    data: [],
    loading: false,
    total: 0,
    isEdit: false,
    breadCrumbList: [],
    filter: {
      page: 1,
      limit: 10,
      isOnlyParents: true,
      filter: {}
    },
    modalVisible: false,
    paginate: false,
    loginUser:
      this.props.auth && this.props.auth.authUser
        ? this.props.auth.authUser
        : null,
  };


  constructor(props) {
    super(props);
    this.columns = [
      {
        title: "Sr. No",
        key: "index",
        render: (text, record, index) => index + 1
      },
      {
        title: "Name",
        dataIndex: "name"
      },
      {
        title: "Parent",
        dataIndex: "parentId",
        render: text => (text && text.name ? text.name : "-")
      },
      {
        title: "Status",
        dataIndex: "isActive",
        align: 'center',
        render: (text, record) => (
          <span>
            <ActiveDeactive
              documentId={record.id}
              isActive={text}
              model="location"
              onSuccess={this.fetch.bind(this)}
            />
          </span>
        ),
      },
      {
        title: "",
        width: "130px",
        dataIndex: "subLocations",
        render: (text, record) =>
          text.length ? (
            <Button
              size="small"
              onClick={this.handleChildLocation.bind(this, record)}
            >
              Show Child Locations
            </Button>
          ) : null
      },
      {
        title: "Actions",
        align: "center",
        width: "120px",
        render: (text, record) => (
          <span>
            <ActionButtons
              pageId={PAGE_PERMISSION.LOCATION}
              edit={() => {
                return this.handleEdit(record);
              }}
            />
          </span>
        )
      }
    ];
  }

  handleSelection = (selectedVal, isAscending, key, listData) => {
    let obj = {
      selectedVal: selectedVal,
      isAscending: isAscending,
      key: key,
      listData: listData
    };
    let self = this;
    let data = UtilService.commonFilter(obj);
    console.log(this, key, selectedVal, this[key])
    self[key] = selectedVal;
    self.setState((state) => {
      if (data !== 'error') {
        if (key === 'sort') {
          state.filter[key] = data;
        } else {
          state.filter.filter[key] = data.type;
        }
      } else if (key === "sort") {
        delete state.filter[key];
      } else {
        delete state.filter.filter[key];
      }
    });
    self.setState(
      (state) => {
        state.filter.page = 1;
        state.paginate = false;
      },
      () => { return self.fetch() }
    );
  };


  componentDidMount() {
    this.fetch();
  }
  /* listing start */
  async fetch(params = {}) {
    this.setState({ loading: true, data: [] });
    await axios
      .post("admin/location/paginate", this.state.filter)
      .then(response => {
        if (response && response.code === "OK") {
          this.setState({
            total: response.data.count,
            loading: false,
            data: response.data.list,
            paginate: true
          });
        } else {
          message.error(response.message);
          this.setState({
            loading: false,
            total: 0,
            data: [],
            paginate: false
          });
        }
      })
      .catch(function (error) {
        let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
        message.error(errorMsg);
        this.setState({ loading: false });
      });
  }

  handleChildLocation = (parent, isFromList) => {
    if (parent || (!parent && isFromList)) {
      let breadCrumbList = _.clone(this.state.breadCrumbList);
      let existsIndex = _.findIndex(breadCrumbList, { id: parent.id });
      if (existsIndex < 0) {
        breadCrumbList.push({ name: parent.name, id: parent.id });
      }
      if (isFromList && existsIndex >= 0) {
        breadCrumbList.splice(existsIndex + 1, 1);
      }
      this.setState(state => {
        state.filter.isOnlyParents = false;
        state.breadCrumbList = breadCrumbList;
        state.filter.filter = { parentId: parent.id };
        return state;
      });

      if (!parent && isFromList) {
        this.setState(state => {
          state.filter.isOnlyParents = true;
          state.breadCrumbList = [];
          return state;
        });
      }
      this.fetch();
    }
  };

  handleTableChange = (pagination, filter, sorter) => {
    let self = this;
    self.setState({
      filter: Object.assign(this.state.filter, {
        limit: pagination.pageSize,
        page: pagination.current
      })
    });
    if (filter && _.size(filter)) {
      _.each(filter, function (v, key) {
        let obj = {};
        obj[key] = v;
        if (v && v.length) {
          self.setState(state => {
            state.filter.filter[key] = v;
            return state;
          });
        } else {
          let filters = _.clone(self.state.filter.filter);
          if (filters[key]) {
            delete filters[key];
          }
          self.setState(state => {
            state.filter.filter = { ...filters };
            return state;
          });
        }
      });
    }
    if (sorter && _.size(sorter)) {
      if (sorter.field && sorter.order === "descend") {
        self.setState(state => {
          state.filter.sort = `${sorter.field} DESC`;
          return state;
        });
      } else {
        self.setState(state => {
          state.filter.sort = `${sorter.field} ASC`;
          return state;
        });
      }
    } else {
      let filters = _.clone(self.state.filter);
      if (filters.sorter) {
        delete filters.sorter;
      }
      self.setState(state => {
        state.filter = { ...filters };
        return state;
      });
    }
    this.fetch();
  };

  onSearch = (newState) => {
    this.setState({
      filter: newState,
      paginate: false
    }, () => { this.fetch(); }
    );
  };

  onShowSizeChange = (current, size) => {
    this.setState({
      filter: Object.assign(this.state.filter, { limit: size })
    });
  };
  /* listing end */

  /* upsert start*/
  createLocation = () => {
    this.setState({
      modalVisible: true,
      isEdit: false
    });
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  handleCancel = e => {
    this.editId = null;

    this.setState({
      modalVisible: false
    });
  };

  handleEdit = record => {
    console.log('record ', record)
    const formObj = _.pick(record, [
      "name",
      "parentId",
      "geo",
      "isActive",
      "type"
    ]);
    this.editId = record.id;

    if (
      formObj.geo &&
      formObj.geo.coordinates &&
      formObj.geo.coordinates.length
    ) {
      formObj.latLang = {
        lat: formObj.geo.coordinates[1],
        lng: formObj.geo.coordinates[0]
      };
      delete formObj.geo;
    }
    if (formObj.parentId && formObj.parentId.id) {
      if (formObj.parentId.parentId) {
        formObj.parentId = [formObj.parentId.parentId, formObj.parentId.id];
      } else {
        formObj.parentId = [formObj.parentId.id];
      }
    }
    const { form } = this.formRef.props;
    this.setState(
      {
        modalVisible: true,
        isEdit: true,
      },
      () => {
        form.setFieldsValue(formObj);
      }
    );
  };

  handleUpsert = () => {
    const { form } = this.formRef.props;

    form.validateFields((err, values) => {
      if (
        err
        || (values.type === LOCATION_TYPE.STATE && values.parentId.length !== 1)
        || (values.type === LOCATION_TYPE.STATE && values.parentId.length === 2)
        || (values.type === LOCATION_TYPE.CITY && values.parentId.length !== 2)
      ) { return }
      console.log(values)
      let obj = values;
      if (obj.parentId && obj.parentId.length) {
        obj.parentId = _.last(obj.parentId);
      }
      if (obj && obj.latLang && obj.latLang.lat && obj.latLang.lng) {
        var coordinates = [obj.latLang.lng, obj.latLang.lat];
        obj.geo = {
          coordinates: coordinates,
          type: "Point"
        };
      }
      console.log("obj", obj);

      if (this.state.isEdit && this.editId) {
        axios
          .put("admin/location/" + this.editId, obj)
          .then(response => {
            if (response.code === "OK") {
              this.handleCancel();
              form.resetFields();
              message.success(`${response.message}`);
              this.fetch();
            } else {
              message.error(`${response.message}`);
            }
          })
          .catch(function (error) {
            console.log("Error****:", error.message);
            message.error(`${error.message}`);
          });
      } else {
        axios
          .post("admin/location/create", obj)
          .then(response => {
            if (response.code === "OK") {
              this.handleCancel();
              form.resetFields();
              message.success(`${response.message}`);
              this.fetch();
            } else {
              message.error(`${response.message}`);
            }
          })
          .catch(function (error) {
            console.log("Error****:", error.message);
            message.error(`${error.message}`);
          });
      }
    });
  };

  /* upsert end*/

  render() {
    let FilterArray = [
      {
        title: 'Status',
        list: FILTER_BY_ACTIVE,
        defaultSelected: this.isActive,
        key: 'isActive',
        visible: true
      }]
    return (
      <div className="gx-module-box gx-mw-100">
        <Affix offsetTop={1}>
          <div className="gx-module-box-header">
            <Row type="flex" align="middle" justify="space-between">
              <h1 className="pageHeading">Location</h1>
              <div className="SearchBarwithBtn">
                <Search
                  placeholder="Search by name"
                  handelSearch={this.onSearch}
                  filter={this.state.filter}
                  keys={['name']}
                />
                <AddButton
                  onClick={this.createLocation}
                  text="Add"
                  pageId={PAGE_PERMISSION.LOCATION}
                />
              </div>
            </Row>
            <Row
              type="flex"
              align="middle"
              justify="space-between"
              style={{ marginTop: 20 }}
            >
              <div className="DropdownWidth vehicleDropdownWidth">
                {FilterArray.map((filter) => {
                  return (filter.visible && <FilterDropdown
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
        <div className="RidersList RiderTableList Location">
          <Card className="locationBreadCrumb m-b-0">
            <Row type="flex" justify="space-between">
              {
                <span>
                  <a
                    className="m-r-10"
                    onClick={this.handleChildLocation.bind(this, "", true)}
                    style={{
                      color: !this.state.filter.filter.parentId
                        ? "#038fde"
                        : "#545454"
                    }}
                  >
                    <Icon type="home" /> All
                  </a>
                  {this.state.breadCrumbList && this.state.breadCrumbList.length
                    ? this.state.breadCrumbList.map(val => {
                      return (
                        <a
                          className="m-r-10"
                          key={val.id}
                          style={{
                            color:
                              val.id === this.state.filter.filter.parentId
                                ? "#038fde"
                                : "#545454"
                          }}
                          onClick={this.handleChildLocation.bind(
                            this,
                            val,
                            true
                          )}
                        >
                          / {val.name}
                        </a>
                      );
                    })
                    : null}
                </span>
              }
            </Row>
          </Card>
          <Table
            className="gx-table-responsive"
            columns={this.columns}
            loading={this.state.loading}
            dataSource={this.state.data}
            pagination={false}
            onChange={this.handleTableChange}
            rowKey="id"
          />
        </div>
        <LocationUpsertForm
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.modalVisible}
          onCancel={this.handleCancel}
          onCreate={this.handleUpsert}
          isEdit={this.state.isEdit}
        />
      </div>
    );
  }
}

const mapStateToProps = function (props) {
  return props;
};
export default connect(mapStateToProps)(Location);
