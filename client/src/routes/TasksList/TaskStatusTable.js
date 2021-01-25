import { List, Icon, Tag, Modal, Button } from "antd";
import React, { Component } from "react";
import { PAGE_PERMISSION, TASK_PRIORITY } from "../../constants/Common";
import ActionButtons from "../../components/ActionButtons";
import { connect } from "react-redux";
import NoImage from '../../assets/images/no-image.png';
import ESToolTip from "../../components/ESToolTip";
import { ReactComponent as SelectCheck } from "../../assets/svg/selectCheck.svg";
import ChangeWorkFlow from './changeWorkFlow';
import { Link } from "react-router-dom";
import UtilService from "../../services/util";

const _ = require("lodash");
class TaskStatusTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.data,
            previewImage: '',
            previewVisible: false,
            selectedRecord: [],
            changeWorkFlowModel: false,
            workflowObj: {}
        };
    }
    componentWillReceiveProps = () => {
        this.setState({ selectedRecord: [] })
    }
    handlePreview = async (image) => {
        if (image) {
            this.setState({
                previewImage: image,
                previewVisible: true
            });
        }
    };
    handleCancel = () => {
        return this.setState({ previewVisible: false, previewImage: '' });
    };
    selectRecord = record => {
        let selectedRecord = [];
        this.setState({ selectedRecord: [] })
        let data = [...this.props.data]
        _.map(data, function (e) { e.selected = false });
        let index = _.findIndex(data, { id: record.id });
        if (index >= 0) {
            data[index].selected = !data[index].selected;
            if (data[index].selected) {
                selectedRecord.push(record);
            } else {
                let existId = _.indexOf(this.state.selectedRecord, { id: record.id });
                this.state.selectedRecord.splice(existId, 1);
            }
        }
        this.setState({ selectedRecord })
    };
    deselectTask = () => {
        this.setState({
            selectedRecord: []
        });
        _.each(this.props.data, data => {
            data.selected = false;
        });
    }
    changeWorkFlow = () => {
        let obj = {
            id: this.state.selectedRecord[0].id,
            level: this.state.selectedRecord[0].level,
            taskType: this.state.selectedRecord[0].taskType
        }
        this.setState({ changeWorkFlowModel: true, workflowObj: obj })
    }
    handelSubmitModel = async () => {
        this.handelCancelModel();
        this.deselectTask();
        this.props.changeWorkFlow();
    }
    handelCancelModel = () => {
        this.setState({ changeWorkFlowModel: false, workflowObj: {} })
    }
    onVehicleClick = (permission, referenceId) => {
        if (permission && referenceId && referenceId.id) {
            this.props.history.push(`/e-scooter/vehicle-details/${referenceId.id}`);
        }
    }
    render() {
        const { data, loading, tab } = this.props;
        const { previewVisible, previewImage, selectedRecord, changeWorkFlowModel } = this.state;
        const authpermission = this.props.auth.authUser.accessPermission;
        const vehiclePageId = PAGE_PERMISSION.VEHICLES;
        const getIndex = (el) => { return el.module === vehiclePageId };
        const index = authpermission.findIndex(getIndex);
        const vehicleViewPermission =
            index && authpermission[index] && authpermission[index].permissions ?
                authpermission[index].permissions.view :
                false;

        return (
            <div className="RidersList">
                <List
                    itemLayout="horizontal"
                    dataSource={data}
                    loading={loading}
                    renderItem={(item) => {
                        return (
                            <List.Item className={item.selected ? "list-item-selected" : ""}>
                                <div className="ant-list-item-meta">
                                    <div
                                        className="totalRideCounter ant-list-item-meta-avatar"
                                        onClick={this.selectRecord.bind(this, item)}
                                    >
                                        <span className="ant-avatar ant-avatar-circle ant-avatar-image gx-pointer">
                                            {item.selected ? (
                                                <SelectCheck />
                                            ) : (
                                                    <div className="scooterIdRound" style={{ paddingTop: 15 }}>
                                                        <h3>{item.taskNumber && item.taskNumber}</h3>
                                                        <div className="lbl" style={{ marginTop: -6 }}> Task Id </div>
                                                    </div>
                                                )}
                                        </span>
                                    </div>
                                    <div className="ant-list-item-meta-content" style={{ width: '50%' }}>
                                        <div className="ant-list-item-meta">
                                            <div className="ant-list-item-meta-description m-r-20">
                                                <h3 style={{ marginBottom: '0.3em' }}>
                                                    {item.referenceId && item.referenceId.id ?
                                                        vehicleViewPermission ?
                                                            <Link to={`/e-scooter/vehicle-details/${item.referenceId.id}`}>
                                                                <b style={{ color: '#595959' }}>
                                                                    {item.referenceId.name ? item.referenceId.name : "-"}{" "}
                                                                </b>
                                                            </Link>
                                                            : <b style={{ color: '#595959' }}>
                                                                {item.referenceId.name ? item.referenceId.name : "-"}{" "}
                                                            </b>
                                                        : '-'
                                                    }
                                                </h3>
                                                <span style={{ marginLeft: 15 }}>
                                                    Task: &nbsp;
                                                    <b>{item.taskHeading}</b>
                                                </span>
                                            </div>
                                            <div className="ant-list-item-meta-description">
                                                {item.isOverDue &&
                                                    <Tag color='red'>Over Due</Tag>
                                                }
                                                {item.priority &&
                                                    (item.priority === TASK_PRIORITY.URGENT ?
                                                        <Tag color='red'>Urgent</Tag>
                                                        : <Tag color='yellow'>Normal</Tag>
                                                    )
                                                }
                                            </div>
                                        </div>

                                        <div className="ant-list-item-meta-content" style={{ width: '100%' }}>
                                            <div className="gx-flex-row d-block-xs">
                                                {item.addedBy &&
                                                    <div className="ant-list-item-meta-description m-r-20">
                                                        Created By: &nbsp;
                                                        <b>{item.addedBy.name ? item.addedBy.name : '-'}</b>
                                                    </div>}
                                                {item.reportId &&
                                                    <div className="ant-list-item-meta-description">
                                                        Report Id: {' '}
                                                        <b>
                                                            {item.reportId.reportNumber ? item.reportId.reportNumber : '-'}
                                                        </b>
                                                    </div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="cardRightThumb">
                                        <div className="cardRightContainer flex-align-center">
                                            <div className="action-btnsWithSignupDate">
                                                <div className="ActionNotification">
                                                    <div className="scooterActionItem">
                                                        <ActionButtons
                                                            pageId={PAGE_PERMISSION.CREATE_TASK}
                                                            edit={() => { return this.props.handelEdit(item.id); }}
                                                            view={() => { return this.props.handleView(item.id); }}
                                                            filter={this.state.filter}
                                                            deleteObj={{
                                                                documentId: item.id,
                                                                page: 'tasklist'
                                                            }}
                                                            deleteMsg="Sure to delete this Task?"
                                                            deleteFn={res => { return this.props.deleteTask(res.documentId); }}
                                                        />
                                                        <div className="scooterIC">
                                                            <ESToolTip placement="top" text='Status Track'>
                                                                <a href="/#"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        this.props.statusTrack(item.statusTrack)
                                                                    }}
                                                                >
                                                                    <Icon type="profile" />
                                                                </a>
                                                            </ESToolTip>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="signupDate">
                                                    Created At:{' '}
                                                    <b>{UtilService.displayDate(item.createdAt)} </b>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </List.Item>
                        );
                    }}
                />
                {selectedRecord.length > 0 ? (
                    <div className="selectOptionBottom">
                        <div className="selectRideOptions">
                            <div className="selectAllOption">
                                <a href="/#" onClick={(e) => { e.preventDefault(); this.deselectTask() }} >
                                    Deselect Task
                                </a>
                                <Button
                                    // type="primary"
                                    onClick={this.changeWorkFlow}
                                    className="ridersButton"
                                >
                                    Change WorkFlow
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : null}
                {changeWorkFlowModel && (
                    <ChangeWorkFlow
                        obj={this.state.workflowObj}
                        taskWorkFlow={this.props.filter.filter.taskWorkFlow}
                        onCreate={this.handelSubmitModel}
                        onCancel={this.handelCancelModel}
                    />
                )}
            </div>
        );
    }
}

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(TaskStatusTable);
