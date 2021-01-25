import React, { Component } from 'react';
import { message, Affix, Row, Table, Icon, Tabs } from 'antd';
import axios from "util/Api";
import { DEFAULT_API_ERROR, VEHICLE_REPORT_ISSUE_TYPE, PAGE_PERMISSION, TASK_MODULE_VISIBLE, VEHICLE_REPORT_STATUS } from "../../constants/Common";
import Search from "../../components/ESSearch";
import ActionButtons from "../../components/ActionButtons";
import ESPagination from "../../components/ESPagination";
import { connect } from "react-redux";
import { ReactComponent as Vehicle } from '../../assets/svg/vehicle.svg';
import ESToolTip from "../../components/ESToolTip";
import ESCreateTask from '../../components/ESCreateTask';
import { Link } from 'react-router-dom';
import UtilService from '../../services/util';
import ImageModel from './ImageModel';
const { TabPane } = Tabs;
const _ = require('lodash');

class ReportTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.data,
            taskmodel: false,
            taskVehicleId: '',
            reportId: '',
            imageModel: false,
            reportImage: []
        }
    }

    componentDidMount = () => {
        this.inItTable()
    }
    inItTable = () => {
        const menuPermission = this.props.auth.authUser.accessPermission;
        const vehiclePageId = PAGE_PERMISSION.VEHICLES;
        const CreateTaskPageId = PAGE_PERMISSION.TASKSETUP;
        let vehicleIndex = _.findIndex(menuPermission, { module: vehiclePageId });
        let taskIndex = _.findIndex(menuPermission, { module: CreateTaskPageId });

        let hasTaskCreatePermission =
            taskIndex && menuPermission[taskIndex] && menuPermission[taskIndex].permissions ?
                menuPermission[taskIndex].permissions.insert : false;
        console.log("ReportTable -> inItTable -> hasTaskCreatePermission", hasTaskCreatePermission)
        console.log('TASK_MODULE_VISIBLE :>> ', TASK_MODULE_VISIBLE);
        let vehicleViewPermission =
            vehicleIndex && menuPermission[vehicleIndex] && menuPermission[vehicleIndex].permissions ?
                menuPermission[vehicleIndex].permissions.view :
                false;
        this.columns = [
            {
                title: 'Report Id',
                dataIndex: 'reportNumber',
            },
            {
                title: 'Reported Time',
                dataIndex: 'createdAt',
                render: (text, record) => {
                    return record.createdAt ? UtilService.displayDate(record.createdAt) : '-';
                }
            },
            {
                title: 'Category',
                dataIndex: 'categoryId',
                render: (text, record) => {
                    return (record.categoryId && record.categoryId.name ? record.categoryId.name : '-');
                }
            },
            {
                title: 'Sub-category',
                dataIndex: 'vehicleIssue',
                render: (text, record) => {
                    return (
                        record.vehicleIssue ?
                            record.vehicleIssue.map((element, i) => {
                                return i !== 0 ? ',  ' + element : element
                            })
                            : '-'
                    )
                }
            },
            {
                title: 'Comment',
                dataIndex: 'comment',
                render: (text, record) => {
                    let comment = record.comment.substring(0, 20) + '...';
                    return (
                        record.comment.length > 20 ?
                            <ESToolTip placement="top" text={record.comment}>
                                {comment}
                            </ESToolTip>
                            : record.comment
                    )
                }
            },
            {
                title: 'Vehicle',
                dataIndex: 'vehicleId',
                render: (text, record) => {
                    return (
                        record.vehicleId && record.vehicleId.id ?
                            vehicleViewPermission ?
                                <Link to={`/e-scooter/vehicle-details/${record.vehicleId.id}`}>
                                    <span style={{ color: '#595959' }}>
                                        {record.vehicleId.name ? record.vehicleId.name : "-"}{" "}
                                    </span>
                                </Link>
                                : <span style={{ color: '#595959' }}>
                                    {record.vehicleId.name ? record.vehicleId.name : "-"}{" "}
                                </span>
                            : '-'
                    );
                }
            },
            {
                title: 'Actions',
                key: 'actions',
                align: 'center',
                render: (text, record) => (
                    <>
                        <ActionButtons
                            pageId={PAGE_PERMISSION.VEHICLE_REPORT}
                            view={() => { return this.props.handleView(record.id); }}
                            // deleteObj={{ documentId: record.id, page: 'vehiclereport' }}
                            // deleteMsg="Sure to delete this Report?"
                            // deleteFn={res => this.props.deleteTask(res.documentId)}
                            displayAfter={
                                <>
                                    {this.props.tabkey === VEHICLE_REPORT_STATUS.SUBMITTED &&
                                        TASK_MODULE_VISIBLE &&
                                        hasTaskCreatePermission &&
                                        !record.taskId &&
                                        record.vehicleId &&
                                        record.vehicleId.id &&
                                        <div className="scooterIC" style={{ marginLeft: 7 }}>
                                            <ESToolTip placement="top" text="Create Task">
                                                <a href="/#" onClick={(e) => {
                                                    e.preventDefault();
                                                    this.viewTaskModel(record.vehicleId.id, record.id)
                                                }}>
                                                    <Icon type="plus" />
                                                </a>
                                            </ESToolTip>
                                        </div>
                                    }
                                    {record.images &&
                                        record.images.length > 0 &&
                                        <div className="scooterIC" style={{ marginLeft: 7 }}>
                                            <ESToolTip placement="top" text="Vehicle Images">
                                                <a href="/#" onClick={(e) => {
                                                    e.preventDefault();
                                                    this.viewImages(record.images)
                                                }}>
                                                    <Icon type="picture" />
                                                </a>
                                            </ESToolTip>
                                        </div>
                                    }
                                    <div className="scooterIC" style={{ marginLeft: 7 }}>
                                        <ESToolTip placement="top" text="Change Status">
                                            <a href="/#" onClick={(e) => {
                                                e.preventDefault();
                                                this.props.changeStatus(record.id)
                                            }}>
                                                <Icon type="rollback" />
                                            </a>
                                        </ESToolTip>
                                    </div>
                                    <div className="scooterIC">
                                        <ESToolTip placement="top" text='Status Track'>
                                            <a href="/#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    this.props.statusTrack(record.statusTrack)
                                                }}
                                            >
                                                <Icon type="profile" />
                                            </a>
                                        </ESToolTip>
                                    </div>
                                </>
                            }
                        />
                    </>
                )
            }
        ];
        if (TASK_MODULE_VISIBLE && (this.props.tabkey === VEHICLE_REPORT_STATUS.TASK_CREATED || this.props.tabkey === VEHICLE_REPORT_STATUS.RESOLVED)) {
            let obj = {
                title: 'Task Id',
                dataIndex: 'taskId',
                align: 'center',
                render: (text, record) => {
                    return (
                        record.taskId && record.taskId.taskNumber ?
                            <Link
                                to={{
                                    pathname: '/e-scooter/task-list',
                                    taskId: record.taskId.taskNumber
                                }}
                            >
                                <span style={{ color: '#595959' }}>
                                    {record.taskId.taskNumber}
                                </span>
                            </Link>
                            : '-'
                    )
                }
            };
            this.columns.splice(6, 0, obj);
        }
    }
    viewImages = (imgs) => {
        this.setState({ imageModel: true, reportImage: imgs })
    }
    handleImageCancel = () => {
        this.setState({ imageModel: false, reportImage: [] });
    };
    viewTaskModel = (id, reportId) => {
        this.setState({ taskmodel: true, taskVehicleId: id, reportId: reportId })
    }
    handleSubmitTask = async (taskId) => {
        try {
            let response = await axios.put(`/admin/report/${this.state.reportId}`, { taskId: taskId })
            if (response.code !== 'OK') {
                message.error(response.message)
            } else {
                await this.setState({ taskmodel: false, taskVehicleId: '', reportId: '' })
                this.props.taskCreated();
            }
        } catch (error) {
            let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
            message.error(errorMsg);
            this.setState({ loading: false });
        }
    }
    handleTaskCancel = () => {
        this.setState({ taskmodel: false, taskVehicleId: '', reportId: '' });
    };

    render() {
        const { taskmodel, taskVehicleId, reportId, imageModel, reportImage } = this.state;
        return (
            <>
                <div className="RidersList RiderTableList">
                    <Table
                        columns={this.columns}
                        loading={this.props.loading}
                        dataSource={this.props.data}
                        pagination={false}
                    />
                </div>
                {taskmodel &&
                    <ESCreateTask
                        visible={taskmodel}
                        id={taskVehicleId}
                        reportId={reportId}
                        onCancel={() => this.handleTaskCancel()}
                        onSubmit={this.handleSubmitTask}
                    />
                }
                {imageModel &&
                    <ImageModel
                        visible={imageModel}
                        reportImage={reportImage}
                        onCancel={() => this.handleImageCancel()}
                    />
                }
            </>
        );
    }
}

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(ReportTable);
