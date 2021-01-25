import { Button, Table, message, Modal } from "antd";
import React, { Component } from "react";
import ActionButton from "./action";
import { RENTAL_PAYMENT_TYPE, USER_TYPES, RENT_PAYMENT_TYPE, DEALER_LABEL, DEFAULT_BASE_CURRENCY, FRANCHISEE_LABEL, DEALER_ROUTE, FRANCHISEE_ROUTE } from "../../constants/Common";

import axios from "util/Api";
import { connect } from "react-redux";
import { getList } from "../../appRedux/actions/Master";
import UtilService from "../../services/util";
import { Link } from "react-router-dom";

const _ = require("lodash");
class RentalPaymentTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      id: null,
      total: 0,
      showTransferModal: false,
      rentalPaymentIds: [],
      selectedRowKeys: [],
      remark: '',
      isNotRequestTab: this.props.filter.filter && this.props.filter.filter.status !== RENTAL_PAYMENT_TYPE.REQUESTED,
      loginUser: this.props.auth && this.props.auth.authUser ? this.props.auth.authUser : null,
      isFranchiseeType: false,
      isDealerType: false,
      receivableRecordSelected: false
    };
  }

  componentDidMount() {
    this.initializeTableColumns();
  }

  initializeTableColumns = () => {
    const { loginUser } = this.state;
    let isFranchiseeType = false;
    let isDealerType = false;
    isFranchiseeType = loginUser && loginUser.type === USER_TYPES.FRANCHISEE;
    isDealerType = loginUser && loginUser.type === USER_TYPES.DEALER;
    this.columns = [
      {
        title: 'Request Date',
        dataIndex: "dateTime",
        render: (text, record) => UtilService.displayDate(record.dateTime)
      },
      {
        title: "Request No",
        dataIndex: "requestId"
      },
      {
        title: (this.props.auth.authUser.type === USER_TYPES.FRANCHISEE) ? `${DEALER_LABEL} Name` : `${FRANCHISEE_LABEL} Name`,
        dataIndex: "referenceId.name",
        render: (text, record) => {
          return (
            record.referenceId.id === loginUser.id
              ? text
              : this.props.auth.authUser.type === USER_TYPES.FRANCHISEE ?
                <div style={{ textTransform: 'capitalize' }}>
                  <Link to={`/e-scooter/${DEALER_ROUTE}/view/${record.referenceId.id}`}>
                    <span style={{ color: 'black' }} className="gx-pointer">{text}</span></Link>
                </div>
                : <div style={{ textTransform: 'capitalize' }}>
                  <Link to={`/e-scooter/${FRANCHISEE_ROUTE}/view/${record.referenceId.id}`}>
                    <span style={{ color: 'black' }} className="gx-pointer">{text}</span></Link>
                </div>
          )
        }
      },
      {
        title: 'Type',
        key: 'type',
        render: (text, record) => {
          return <React.Fragment>
            {this.getRentPaymentType(record)}
          </React.Fragment>
        }
      },
      {
        title: "Amount",
        dataIndex: "amount",
        render: (text, record) => {
          return (
            <span>
              <b> {text.toFixed(2)} {DEFAULT_BASE_CURRENCY}</b>
            </span>
          )
        }
      },
      {
        title: this.props.tab === "transfer" ? 'Transfer Date' : null || this.props.tab === "cancel" ? 'Cancel Date' : null,
        dataIndex: "createdAt",
        align: 'left',
        render: (text, record) => {
          if (this.props.tab === "transfer") {
            return UtilService.displayDate(record.transferredDateTime);
          }
          else if (this.props.tab === "cancel") {
            return UtilService.displayDate(record.rejectionDatetime);
          }
        }
      },
      {
        title: "Action",
        key: "transferCancel",
        align: "center",
        render: (text, record) => {
          return (
            <span>
              <Button
                style={{ margin: 0 }}
                disabled={this.state.selectedRowKeys.length > 0 || record.referenceId.id === loginUser.id}
                onClick={() => this.showTransferModal(record)}
              >Transfer/Cancel</Button>
            </span>
          );
        }
      },
    ];
    if (this.props.auth.authUser.type === USER_TYPES.DEALER) {
      this.columns = _.filter(this.columns, e => e.dataIndex !== 'referenceId.name');
    }
    if (this.state.isNotRequestTab) {
      this.columns = _.filter(this.columns, e => e.key !== 'transferCancel');
      this.columns.push({
        title: "Remark",
        key: "showRemark",
        align: "center",
        render: (text, record) => {
          return (<span><Button onClick={() => this.showRemarkDetails(record)} >Show</Button></span>);
        }
      });
    }
    if (isDealerType) {
      this.columns = _.filter(this.columns, e => e.key !== 'transferCancel');
    }

  };

  getRentPaymentType = record => {
    let payableType = record.type === RENT_PAYMENT_TYPE.ACCOUNT_PAYABLE;
    if (this.state.loginUser.id === record.referenceId.id) {
      payableType = !payableType;
    }
    return payableType ? <span>Payable</span> : <span>Receivable</span>
  }

  handlePaymentSubmit = async (e) => {
    try {
      console.log(e);
      let reqObj = {
        status: e.value ? RENTAL_PAYMENT_TYPE.TRANSFERRED : RENTAL_PAYMENT_TYPE.REJECTED,
        remark: e.remark,
        ids: this.state.rentalPaymentIds
      };
      if (this.state.selectedRowKeys && this.state.selectedRowKeys.length > 0) {
        reqObj.ids = this.state.selectedRowKeys;
      }
      // console.log("handlePaymentSubmit -> reqObj", reqObj)
      let response = await axios.post("/admin/rent-payment/change-status", reqObj);

      if (response.code === "OK") {
        console.log('response', response);
        message.success(`${response.message}`);
      }
      this.setState({ selectedRowKeys: [], });
    } catch (error) {
      console.log('Error****:', error.message);
      message.error(`${error.message}`);
    }
    this.hideTransferModal();
    this.props.fetch();
  };

  showRemarkDetails = (record) => {
    Modal.info({
      title: 'Remark',
      content: (
        <div>
          <p>{record.remark}</p>
        </div>
      ),
      onOk() { },
    });
  }

  showTransferModal = (record) => {
    console.log('showTransferModal ---- ', record)
    this.setState({
      showTransferModal: true,
      rentalPaymentIds: [record.id]
    });
    this.checkIfReceivableSelected([record.id]);
  }

  handleOuterTransferCancelClick = () => {
    this.setState({
      rentalPaymentIds: [],
      showTransferModal: true
    });
  }

  hideTransferModal = () => {
    this.setState({
      showTransferModal: false,
      selectedRowKeys: [],
      rentalPaymentIds: []
    });
  }

  selectRow = (record) => {
    if (record.key) {
      let selectedRowKeys = [...this.state.selectedRowKeys];
      if (selectedRowKeys.indexOf(record.key) >= 0) {
        selectedRowKeys.splice(selectedRowKeys.indexOf(record.key), 1);
      } else {
        selectedRowKeys.push(record.key);
      }
      if (selectedRowKeys) {
        this.setState({ selectedRowKeys });
      }
    }
  }
  onSelectedRowKeysChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
    this.checkIfReceivableSelected(selectedRowKeys);
  }

  checkIfReceivableSelected = (ids) => {
    let { data } = this.props;
    let _this = this;
    data = _.filter(data, record => {
      let result = ids.includes(record.id);
      let payableType = record.type === RENT_PAYMENT_TYPE.ACCOUNT_PAYABLE;
      if (_this.state.loginUser.id === record.referenceId.id) {
        payableType = !payableType;
      }
      result = result && !payableType;
      return result;
    });
    console.log("data.length > 0 - ", data.length > 0)
    this.setState({ receivableRecordSelected: data.length > 0 });
  }

  render() {
    let { selectedRowKeys, isNotRequestTab, loginUser, receivableRecordSelected } = this.state;
    let isFranchiseeType = false;
    let isDealerType = false;
    isFranchiseeType = loginUser && loginUser.type === USER_TYPES.FRANCHISEE;
    isDealerType = loginUser && loginUser.type === USER_TYPES.DEALER;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectedRowKeysChange,
      getCheckboxProps: record => {
        return ({
          disabled: loginUser ? record.referenceId.id === loginUser.id : false,
        })
      }
    };
    let hideRowSelection = isNotRequestTab || isDealerType;
    return (
      <div className="gx-module-box gx-mw-100">
        <div className="RidersList RiderTableList">
          <Table
            className="gx-table-responsive rent-payment-table"
            // rowSelection={null}
            rowSelection={hideRowSelection ? null : rowSelection}
            columns={this.columns}
            loading={this.props.loading}
            dataSource={this.props.data}
            rowKey="id"
            onChange={this.props.handleChange}
            pagination={false}
            size="small"
            onRow={(record) => ({ onClick: () => this.selectRow(record) })}
          />
        </div>
        {
          this.state.showTransferModal && <ActionButton
            receivableRecordSelected={receivableRecordSelected}
            onCreate={this.handlePaymentSubmit}
            onCancel={this.hideTransferModal}
          />
        }
        {
          (selectedRowKeys && selectedRowKeys.length > 0) &&
          <div className="selectOptionBottom">
            <div className="selectRideOptions">
              <div className="selectAllOption">
                <Button type="primary" onClick={this.handleOuterTransferCancelClick}
                >Transfer/Cancel</Button>
              </div>
            </div>
          </div>
        }
      </div>
    );
  }
}
const mapStateToProps = function (props) {
  return props;
};
export default connect(mapStateToProps, { getList })(RentalPaymentTable);
