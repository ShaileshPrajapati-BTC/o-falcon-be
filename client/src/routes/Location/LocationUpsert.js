/* eslint-disable */
import React from "react";
import { connect } from "react-redux";
import GeoLocation from "../../components/custom/GeoLocation";
import { LOCATION_TYPE, LOCATION_TYPE_FILTER } from "../../constants/Common";
import axios from "util/Api";

import { Form, Modal, Checkbox, Select, Input, Cascader } from "antd";
import IntlMessages from "util/IntlMessages";

const _ = require("lodash");
const Option = Select.Option;

class LocationUpsertModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      isCaseCaderChange: false,
      isSubmit: false,
    };
  }

  componentDidMount() {
    this.getParentLocation();
  }

  componentWillReceiveProps() {
    if (this.props.isEdit && !this.state.isCasCaderChange) {
      this.getParentLocation();
    }
  }

  getParentLocation = () => {
    let { form } = this.props;
    let obj = { projection: ["name", "parentId", "id"], isOnlyParents: true };
    axios
      .post("admin/location/paginate", obj)
      .then(response => {
        if (response.code === "OK") {
          if (response.data.list && response.data.list.length) {
            _.each(response.data.list, function (list) {
              list.isLeaf = false;
            });
          }
          let parentId = form.getFieldValue("parentId");
          if (parentId && parentId.length > 1) {
            let selectedData = _.find(response.data.list, { id: parentId[0] });
            this.loadData([selectedData]);
          }
          this.setState({
            data: response.data.list
          });
        }
      })
      .catch(function (error) {
        console.log("Error****:", error.message);
      });
  };

  loadData = selectedOptions => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;

    // load options lazily
    setTimeout(() => {
      let parentId = targetOption.id;
      let obj = {
        projection: ["name", "parentId", "id"],
        filter: { parentId: parentId }
      };
      axios
        .post("admin/location/paginate", obj)
        .then(response => {
          if (response.code === "OK") {
            if (response.data.list && response.data.list.length) {
              targetOption.loading = false;
              targetOption.children = response.data.list;
            }

            this.setState({
              data: [...this.state.data]
            });
          }
        })
        .catch(function (error) {
          console.log("Error****:", error.message);
        });
    }, 1000);
  };

  onchange = () => {
    this.setState({ isCaseCaderChange: true, isSubmit: false });
  };

  onSubmit = () => {
    this.setState({ isSubmit: true })
    this.props.onCreate()
  }

  onCancel = () => {
    this.setState({ isSubmit: false })
    this.props.onCancel()
  }
  render() {
    const { visible, onCancel, onCreate, isEdit, form } = this.props;
    const { getFieldDecorator, getFieldValue } = form;

    let locationType = getFieldValue('type')
    let parentId = getFieldValue('parentId')
    console.log(locationType, parentId, this.state.isSubmit)

    return (
      <Modal
        destroyOnClose="true"
        visible={visible}
        title={isEdit ? `Edit Location` : `Add Location`}
        okText={isEdit ? "Update" : "Add"}
        onCancel={this.onCancel}
        onOk={this.onSubmit}
        width={750}
      >
        <Form layout="vertical">
          <Form.Item label="Search Country ,State, City">
            {getFieldDecorator("parentId", {
              rules: [{ required: false }]
            })(
              <Cascader
                fieldNames={{ label: "name", value: "id" }}
                options={this.state.data}
                loadData={this.loadData}
                onChange={this.onchange}
                disabled={(parentId === undefined) && (locationType === LOCATION_TYPE.COUNTRY)}
                changeOnSelect
              />
            )}
            {
              (locationType && this.state.isSubmit) ?
                ((parentId ? parentId.length !== 1 : parentId === undefined)
                  && locationType === LOCATION_TYPE.STATE) && <h6 style={{ color: '#f5222d' }}>*Please select a country for the state</h6> : null
            }
            {
              (locationType && parentId && parentId.length) ?
                ((parentId ? parentId.length === 2 : null)
                  && locationType === LOCATION_TYPE.STATE) && <h6 style={{ color: '#f5222d' }}>*Please remove state from above</h6> : null
            }
            {
              (locationType && this.state.isSubmit) ?
                ((parentId ? parentId.length !== 2 : parentId === undefined)
                  && locationType === LOCATION_TYPE.CITY) && <h6 style={{ color: '#f5222d' }}>*Please select a state for the city</h6> : null
            }
          </Form.Item>

          <Form.Item>
            <Form.Item
              label="Name"
              hasFeedback
              className="inlineRow geoLocation"
            >
              {getFieldDecorator("name", {
                rules: [{ required: true, message: "Please add name" }]
              })(<GeoLocation form={form} isEdit={isEdit} />)}
            </Form.Item>
            <Form.Item
              label="Location Type"
              hasFeedback
              style={{ paddingLeft: "5px" }}
              className="inlineRow"
            >
              {getFieldDecorator("type", {
                rules: [
                  { required: true, message: "Please select Location type" }
                ]
              })(
                <Select
                  mode="single"
                  placeholder="Select Type"
                  disabled={isEdit}
                  style={{ width: "100%" }}
                >
                  {LOCATION_TYPE_FILTER.map(val => {
                    return (
                      <Option key={val.value} value={val.type}>
                        {val.label}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="">
              {getFieldDecorator("latLang")(<Input type="hidden" />)}
            </Form.Item>
          </Form.Item>
          <Form.Item>
            <Form.Item className="inlineRow">
              {getFieldDecorator("isActive", {
                valuePropName: "checked",
                initialValue: true
              })(
                <Checkbox>
                  <IntlMessages id="location.isActive" />
                </Checkbox>
              )}
            </Form.Item>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

const WrappedLocationUpsertModal = Form.create({ name: "locationUpsertForm" })(
  LocationUpsertModal
);

const mapStateToProps = function (props) {
  return props;
};

export default connect(mapStateToProps)(WrappedLocationUpsertModal);
