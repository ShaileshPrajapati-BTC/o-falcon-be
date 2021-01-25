import React, { Component } from 'react';
import { Row, Form, Col, Button, InputNumber, message, Table, Icon, Popover } from 'antd';
import { ONLY_NUMBER_REQ_EXP, SETTING_TYPE, DEFAULT_BASE_CURRENCY, USER_TYPES, PARTNER_WITH_CLIENT_FEATURE } from '../../constants/Common';
import { connect } from 'react-redux';
import axios from 'util/Api';
import Search from '../../components/ESSearch';
import StatusTrack from '../Commission/statusTrack';
import IntlMessages from '../../util/IntlMessages';
var _ = require('lodash')

const EditableContext = React.createContext();

class EditableCell extends React.Component {
  getInput = () => {
    return <InputNumber />
  };

  renderCell = ({ getFieldDecorator }) => {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      children,
      ...restProps
    } = this.props;
    let value = record && record[dataIndex];
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{ margin: 0, width: '100%' }}>
            {getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: true,
                  message: `${<IntlMessages id="app.rental.pleaseInput" />} ${title}!`,
                },
              ],
              initialValue: value,
            })(this.getInput())}
          </Form.Item>
        ) : (
            children
          )}
      </td>
    );
  };

  render() {
    return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
  }
}

class Rental extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: false,
      editingKey: '',
      userOwnRentData: {},
      isStatusTrackModal: false,
      statusTrack: [],
      filter: {
        filter: {}
      }
    };
    this.inItTable()
  }

  componentDidMount = () => {
    this.fetch()
  }
  fetch = async () => {
    const { authUser } = this.props.auth;
    let key;
    const isSuperAdmin = authUser.type === USER_TYPES.SUPER_ADMIN
    const isFranchisee = authUser.type === USER_TYPES.FRANCHISEE
    const isDealer = authUser.type === USER_TYPES.DEALER
    if (isSuperAdmin) { key = 'franchiseeVehicleRentAmount' }
    if (isFranchisee) { key = 'dealerVehicleRentAmount' }
    this.setState({ loading: true });
    try {
      let response = await axios.post('admin/rent-list', this.state.filter);
      if (isFranchisee || isDealer) {
        let userOwnRentData = await axios.get(`admin/rent/${authUser.id}`);
        this.setState({ userOwnRentData: userOwnRentData.data })
      }
      let defaultCommisionResponse = await axios.post('admin/settings', { type: SETTING_TYPE.COMMISSION })
      let record = response.data;
      const formObj = _.pick(defaultCommisionResponse.data, key);
      const { form } = this.props;
      form.setFieldsValue({ defaultRent: formObj[key] });
      this.setState({ data: record.list, loading: false });
    } catch (error) {
      console.log('Error****:', error.message);
      message.error(`${error.message}`);
      this.setState({ loading: false });
    }
  }
  onSearch = (newState) => {
    this.setState(
      {
        filter: newState,
      },
      () => {
        this.fetch();
      }
    );
  };
  inItTable = () => {
    this.columns = [
      {
        title: <IntlMessages id="app.name" />,
        dataIndex: 'referenceId.name',
        editable: false,
      },
      {
        title: <IntlMessages id="app.rent" />,
        dataIndex: 'vehicleRentAmount',
        editable: true,
        render: (text, record) => `${record.vehicleRentAmount} ${DEFAULT_BASE_CURRENCY}`
      },
      {
        title: <IntlMessages id="app.action" />,
        key: 'action',
        render: (text, record) => {
          const { editingKey } = this.state;
          const editable = this.isEditing(record);
          return <React.Fragment>
            {editable ? (
              <span>
                <EditableContext.Consumer>
                  {form => (
                    <a href="/#"
                      onClick={(e) => {
                        e.preventDefault();
                        this.save(form, record)
                      }}
                      style={{ marginRight: 8 }}
                    ><IntlMessages id="app.save" /></a>
                  )}
                </EditableContext.Consumer>
                <a href="/#"
                  onClick={(e) => {
                    e.preventDefault();
                    this.cancel(record.id)
                  }}><IntlMessages id="app.cancel" /></a>
              </span>
            ) : (
                <a href="/#"
                  onClick={(e) => {
                    e.preventDefault();
                    this.edit(record.id)
                  }}
                  disabled={editingKey !== ''}><IntlMessages id="app.edit" /></a>
              )}
            <div className="scooterIC" style={{ display: 'inline-block', paddingLeft: '15px' }}>
              <Popover content={<IntlMessages id="app.rental.rentalTrack"/>} title={null}>
                <a href="/#" onClick={(e) => {
                  e.preventDefault();
                }}>
                  <Icon
                    type="profile"
                    onClick={() => this.statusTrack(record.track)}
                  />
                </a>
              </Popover>
            </div>
          </React.Fragment>
        }
      }
    ]
  }

  updateDefaultRent = async () => {
    const { form } = this.props;
    form.validateFields(async (err, values) => {
      if (err) return
      try {
        let response = await axios.put(`/admin/rent/update-default-rent`, { vehicleRentAmount: values.defaultRent });
        message.success(`${response.message}`);
      } catch (error) {
        console.log('Error****:', error.message);
        message.error(`${error.message}`);
      }
    })
  }


  isEditing = record => record.id === this.state.editingKey;

  cancel = () => this.setState({ editingKey: '' });

  edit = (key) => this.setState({ editingKey: key })

  save = async (form, key) => {
    await form.validateFields(async (error, values) => {
      if (error) return;

      if (key.id === this.state.editingKey) {
        const amount = _.pick(values, 'vehicleRentAmount');
        let obj = { vehicleRentAmount: amount.vehicleRentAmount, referenceId: key.referenceId.id }
        try {
          let response = await axios.put(`/admin/rent/update-user-rent`, obj);
          message.success(`${response.message}`);
          this.setState({ editingKey: '' })
          this.fetch()
        } catch (error) {
          console.log('Error****:', error.message);
          message.error(`${error.message}`);
        }
      }
    });
  }


  statusTrack = async (value) => {
    await this.setState({ isStatusTrackModal: true, statusTrack: value });
  };
  hideStatusTrack = () => {
    this.setState({ isStatusTrackModal: false, statusTrack: [] });
  }
  render() {
    const { form, auth } = this.props;
    const { getFieldDecorator } = form;
    const { track, vehicleRentAmount, referenceId } = this.state.userOwnRentData;
    let newTrackData = [];
    if (track && track.length > 0) {
      newTrackData = track.map(el => ({
        vehicleRentAmount: el.vehicleRentAmount,
        dateTime: el.dateTime,
        userId: el.userId,
        data: el.data,
        user: { id: el.user.id, name: el.user.name }
      }))
    }
    const isFranchisee = auth.authUser.type === USER_TYPES.FRANCHISEE;
    const isDealer = auth.authUser.type === USER_TYPES.DEALER
    const components = { body: { cell: EditableCell } };
    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: col.dataIndex === 'name' ? 'text' : 'number',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record),
        }),
      };
    });

    let showRentList = !isDealer;
    if (PARTNER_WITH_CLIENT_FEATURE) {
      showRentList = showRentList && !isFranchisee;
    }

    return (
      <div className="gx-module-box gx-mw-100">
        <div className="gx-module-box-header">
          <Row type="flex" align="middle" justify="space-between">
            <h1 className="pageHeading"><IntlMessages id="app.rental" /></h1>
            <div className="SearchBarwithBtn">
              <Search
                handelSearch={this.onSearch}
                filter={this.state.filter}
                keys={['name']}
                placeholder="Search by name"
              />
            </div>
          </Row>
        </div>
        <div className="gx-module-box-content" style={{ display: (isFranchisee || isDealer) ? 'inline-block' : 'none' }}>
          <div className="gx-mt-15">
            <Form layout="vertical">
              <Row type="flex" justify="start">
                <Col span={6} >
                  Rent ({DEFAULT_BASE_CURRENCY}/Vehicle/Month)
                            {' :'}
                  {'vehicleRentAmount' in this.state.userOwnRentData ? <span style={{fontSize: '20px'}}> {vehicleRentAmount} </span> : ' Not Configured!'}
                  {/* show track button here */}
                  {newTrackData && newTrackData.length > 0 &&
                    <div className="scooterIC" style={{ display: 'inline-block', paddingLeft: '15px' }}>
                      <Popover content="Rent Track" title={null}>
                        <a href="/#" onClick={(e) => {
                          e.preventDefault();
                        }}>
                          <Icon
                            type="profile"
                            onClick={() => this.statusTrack(newTrackData)}
                          />
                        </a>
                      </Popover>
                    </div>}
                </Col>
              </Row>
            </Form>
          </div>
        </div>
        <div className="gx-module-box-content" style={{ display: (isFranchisee || isDealer) ? 'none' : 'inline-block' }}>
          <div className="gx-mt-15">
            <Form layout="vertical">
              <Row type="flex" justify="start">
                <Col span={6} >
                  <Form.Item label={<><IntlMessages id="app.rent"/> ({DEFAULT_BASE_CURRENCY}/<IntlMessages id="app.vehicle"/>/<IntlMessages id="app.month"/>)</>} >
                    {getFieldDecorator('defaultRent', {
                      rules: [
                        {
                          required: true,
                          message: <IntlMessages id="app.rental.pleaseAddAmount" />
                        },
                        {
                          pattern: new RegExp(ONLY_NUMBER_REQ_EXP),
                          message: <IntlMessages id="app.invalid" />
                        }
                      ]
                    })(
                      <InputNumber placeholder="Rent" />
                    )}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Button type="primary" onClick={this.updateDefaultRent} style={{ marginTop: 25 }}>
                    <IntlMessages id="app.update" /></Button>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
        {
          showRentList && <React.Fragment>
            <div className="RidersList RiderTableList">
              <EditableContext.Provider value={this.props.form}>
                <Table
                  components={components}
                  className="gx-table-responsive"
                  bordered
                  dataSource={this.state.data}
                  columns={columns}
                  rowClassName="franchisee-editable-row"
                  rowKey="id"
                  loading={this.state.loading}
                  pagination={{ onChange: this.cancel }}
                />
              </EditableContext.Provider>
            </div>
          </React.Fragment>
        }
        {
          this.state.isStatusTrackModal && <StatusTrack
            data={this.state.statusTrack}
            onCancel={this.hideStatusTrack}
            visible={this.state.isStatusTrackModal}
          />
        }
      </div>
    );
  }
}


const WrappedRental = Form.create({ name: 'rentalForm' })(Rental);

const mapStateToProps = function (props) {
  return props;
};

export default connect(mapStateToProps)(WrappedRental);