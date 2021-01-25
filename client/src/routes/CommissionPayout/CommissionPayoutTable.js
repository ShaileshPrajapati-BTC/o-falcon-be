import { Button, Table, message, Modal } from "antd";
import React, { Component } from "react";
import ActionButton from "./action";
// import MasterUpsertForm from "./MasterUpsertForm";
// import MasterView from "./MasterView";
import { COMMISSION_PAYOUT_TYPE, USER_TYPES } from "../../constants/Common";
import { DEFAULT_BASE_CURRENCY, FRANCHISEE_LABEL } from "../../constants/Setup";

import axios from "util/Api";
import { connect } from "react-redux";
import { getList } from "../../appRedux/actions/Master";
import UtilService from "../../services/util";
import CommissionUpsertRequest from "./CommissionUpsertRequest";

const _ = require("lodash");
class CommissionPayoutTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            id: null,
            total: 0,
            showTransferModal: false,
            commissionPayoutIds: [],
            selectedRowKeys: [],
            remark: '',
            isNotRequestTab: this.props.filter.filter && this.props.filter.filter.status !== COMMISSION_PAYOUT_TYPE.REQUESTED,
            loginUser: this.props.auth && this.props.auth.authUser ? this.props.auth.authUser : null,
            commissionPayoutUpsertVisible: false,
            commissionPayoutUpdateRecord: null
        };
    }

    componentDidMount() {
        this.initializeTableColumns();
    }

    initializeTableColumns = () => {
        this.columns = [
            {
                title: "Request No",
                dataIndex: "requestId"
            },
            // {
            //     title: "",
            //     dataIndex: "icon",
            //     width: "7%",
            //     align: "center",
            //     render: (text, record) => {
            //         return (
            //             <div
            //                 className="totalRideCounter"
            //                 style={{
            //                     height: "40px",
            //                     width: "40px",
            //                     fontSize: "18px",
            //                     marginLeft: "17px"
            //                 }}
            //             >
            //                 {record.name.charAt(0).toUpperCase()}
            //             </div>
            //         );
            //     }
            // },
            {
                title: `${FRANCHISEE_LABEL} Name`,
                dataIndex: "franchiseeId.name"
            },
            {
                title: "Amount",
                dataIndex: "amount",
                render: (text, record) => {
                    return (
                        <span>
                            {text.toFixed(2)} {DEFAULT_BASE_CURRENCY}
                        </span>
                    )
                }
            },
            {
                title: 'Request Date',
                dataIndex: "createdAt",
                render: (text, record) => {
                    return UtilService.displayDate(record.createdAt);
                }
            },
            // {
            //     title: this.props.tab === "transfer" ? this.props.tab === "cancel" ? 'Cancel Date' : 'Transfer Date' : 'Request Date',
            //     dataIndex: "createdAt",
            //     render: (text, record) => {
            //         if (this.props.tab === "transfer") {
            //             const data = _.filter(record.statusTrack, (e) => {
            //                 return e.status === COMMISSION_PAYOUT_TYPE.TRANSFERRED;
            //             })
            //             return UtilService.displayDate(data.length > 0 ? data[0].dateTime : null);
            //         }
            //         else if (this.props.tab === "cancel") {
            //             const data = _.filter(record.statusTrack, (e) => {
            //                 return e.status === COMMISSION_PAYOUT_TYPE.REJECTED;
            //             })
            //             return UtilService.displayDate(record.createdAt);
            //         } else { return (UtilService.displayDate(record.createdAt)); }
            //     }
            // },
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
                                disabled={this.state.selectedRowKeys.length > 0}
                                onClick={() => this.showCommissionPayoutUpdate(record)}
                            >
                                Edit
                            </Button>
                            <Button
                                disabled={this.state.selectedRowKeys.length > 0}
                                onClick={() => this.showTransferModal(record)}
                            >
                                Transfer/Cancel
                            </Button>
                        </span>
                    );
                }
            },
            // {
            //     title: "Sub Master",
            //     dataIndex: "",
            //     align: "center",
            //     render: (text, record) => {
            //         return (
            //             <Link to={`sub-master/${record.id}`}>
            //                 <span className="gx-link">View</span>
            //             </Link>
            //         );
            //     }
            // },
            // {
            //     title: "Actions",
            //     align: "center",
            //     width: "120px",
            //     render: (text, record) => {
            //         return (
            //             <span>
            //                 <ActionButtons
            //                     pageId={PAGE_PERMISSION.MASTER}
            //                     view={() => {
            //                         return this.showViewModal(record);
            //                     }}
            //                     edit={() => {
            //                         return this.handleEdit(record);
            //                     }}
            //                     deleteObj={{
            //                         documentId: record.id,
            //                         model: "master",
            //                         isSoftDelete: true
            //                     }}
            //                     deleteFn={res => {
            //                         if (res === "success") {
            //                             this.fetch();
            //                         }
            //                     }}
            //                 />
            //             </span>
            //         );
            //     }
            // }
        ];

        let isFranchiseeType = false;
        isFranchiseeType = this.state.loginUser && this.state.loginUser.type === USER_TYPES.FRANCHISEE;
        if (this.state.isNotRequestTab) {
            this.columns = _.filter(this.columns, e => e.key !== 'transferCancel');

            this.columns.push({
                title: "Remark",
                key: "showRemark",
                align: "center",
                render: (text, record) => {
                    return (
                        <span>
                            <Button onClick={() => this.showRemarkDetails(record)} >
                                Show
                            </Button>
                        </span>
                    );
                }
            });
        }
        if (!this.state.isNotRequestTab && isFranchiseeType) {
            this.columns = _.filter(this.columns, e => e.key !== 'transferCancel');
        }
    };

    handleEdit = record => {
        this.setState({
            modalVisible: true,
            id: record.id
        });
    };
    handleSubmit = () => {
        this.props.fetch();
        this.props.handleCancel();
    };
    handleCancel = () => {
        this.setState({
            id: null,
            modalVisible: false
        });
    };

    createPageRequest = () => {
        this.setState({
            modalVisible: true
        });
    };

    handlePayoutSubmit = async (e) => {
        try {
            console.log(e);
            let reqObj = {
                status: e.value ? COMMISSION_PAYOUT_TYPE.TRANSFERRED : COMMISSION_PAYOUT_TYPE.REJECTED,
                remark: e.remark,
                ids: this.state.commissionPayoutIds
            };
            if (this.state.selectedRowKeys && this.state.selectedRowKeys.length > 0) {
                reqObj.ids = this.state.selectedRowKeys;
            }
            let response = await axios.post("/admin/franchisee/commission-payout/change-status", reqObj);

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
            commissionPayoutIds: [record.id]
        });
    }

    handleOuterTransferCancelClick = () => {
        this.setState({
            commissionPayoutIds: [],
            showTransferModal: true
        });
    }

    hideTransferModal = () => {
        this.setState({
            showTransferModal: false,
            selectedRowKeys: [],
            commissionPayoutIds: []
        });
    }
    // showViewModal(record) {
    //     this.setState({
    //         showViewModal: true,
    //         viewId: record.id
    //     });
    // }

    // hideViewModal() {
    //     this.setState({
    //         showViewModal: false
    //     });
    // }
    // handleChange = (pagination, filters, sorter) => {
    //     console.log("Various parameters", pagination, filters, sorter);
    //     this.setState({
    //         sortedInfo: sorter
    //     });
    // };
    // handleSelection = (selectedVal, isAscending, key, listData) => {
    //     let obj = {
    //         selectedVal: selectedVal,
    //         isAscending: isAscending,
    //         key: key,
    //         listData: listData
    //     };
    //     let self = this;
    //     let data = UtilService.commonFilter(obj);
    //     self[key] = selectedVal;
    //     self.setState(
    //         state => {
    //             if (data !== "error") {
    //                 state.filter.filter[key] = data.type;
    //             } else {
    //                 delete state.filter.filter[key];
    //             }
    //         },
    //         () => self.fetch()
    //     );
    // };

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
    }
    showCommissionPayoutUpdate = (record) => {
        this.setState({
            commissionPayoutUpsertVisible: true,
            commissionPayoutUpdateRecord: record
        });
    }

    hideCommissionPayoutUpdate = () => {
        this.setState({
            commissionPayoutUpsertVisible: false,
            commissionPayoutUpdateRecord: null
        });
        this.props.fetch();
    }
    handleUpdateCommissionRequest = async obj => {
        let reqObj = {
            id: obj.id,
            amount: obj.amount,
            franchiseeId: obj.franchiseeId
        };
        await axios
            .put("/admin/franchisee/commission-payout/update-amount", reqObj)
            .then(async data => {
                if (data.code === "OK") {
                    message.success(data.message);
                }
            })
            .catch(error => {
                console.log("Error****:", error.message);
                message.error(error.message);
            });
        this.hideCommissionPayoutUpdate();
    };
    render() {
        let {
            selectedRowKeys,
            isNotRequestTab,
            commissionPayoutUpsertVisible,
            commissionPayoutUpdateRecord
        } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectedRowKeysChange,
        };

        let isFranchiseeType = false;
        isFranchiseeType = this.state.loginUser && this.state.loginUser.type === USER_TYPES.FRANCHISEE;

        return (
            <div className="gx-module-box gx-mw-100">
                <div className="RidersList RiderTableList">
                    <Table
                        className="gx-table-responsive"
                        rowSelection={(isNotRequestTab || isFranchiseeType) ? null : rowSelection}
                        columns={this.columns}
                        loading={this.props.loading}
                        dataSource={this.props.data}
                        rowKey="id"
                        onChange={this.props.handleChange}
                        pagination={false}
                        onRow={(record) => ({
                            onClick: () => {
                                this.selectRow(record);
                            },
                        })}
                    />
                </div>
                {this.state.modalVisible && (
                    // <MasterUpsertForm
                    //     id={this.state.id}
                    //     handleSubmit={this.handleSubmit}
                    //     onCancel={this.handleCancel}
                    // />
                    <div />
                )}

                {this.state.showTransferModal && (
                    <ActionButton
                        onCreate={this.handlePayoutSubmit}
                        onCancel={this.hideTransferModal}
                    />
                )}

                {commissionPayoutUpsertVisible && (
                    <CommissionUpsertRequest
                        title="Update request"
                        onCreate={this.handleUpdateCommissionRequest}
                        onCancel={this.hideCommissionPayoutUpdate}
                        data={commissionPayoutUpdateRecord}
                    />
                )}

                {selectedRowKeys.length > 0 ? (
                    <div className="selectOptionBottom">
                        <div className="selectRideOptions">
                            <div className="selectAllOption">
                                <Button
                                    type="primary"
                                    onClick={this.handleOuterTransferCancelClick}
                                >
                                    Transfer/Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        );
    }
}

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps, { getList })(CommissionPayoutTable);
