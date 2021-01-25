import { Card, Table } from 'antd';
import React, { Component } from 'react';
import { ASSIGN_VEHICLE_OPERATION_TYPE, FRANCHISEE_LABEL, USER_TYPES } from '../../constants/Common';
import { ReactComponent as RightArrow } from '../../assets/svg/right-arrow.svg';
import UtilService from '../../services/util';
import IntlMessages from '../../util/IntlMessages';

const _ = require('lodash');


class AssignRetainVehicleTrack extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.columns = [
            {
                title: <IntlMessages id="app.notification.date" defaultMessage="Date" />,
                key: 'index',
                render: (text, record, index) => {
                    return UtilService.displayDate(record.createdAt)
                }
            },
            {
                title: <IntlMessages id="app.vehicle.assignRetain" defaultMessage="Assign/Retain" />,
                dataIndex: 'operationType',
                render: (text, record, index) => {
                    let operationType = ASSIGN_VEHICLE_OPERATION_TYPE.find((el) => { return el.type === record.operationType })
                    return operationType && operationType.label
                }
            },
            {
                title: FRANCHISEE_LABEL,
                dataIndex: 'referenceId',
                render: (text, record, index) => {
                    return this.props.userType === USER_TYPES.FRANCHISEE
                        ? record.userType === USER_TYPES.FRANCHISEE
                            ? record.assignerId && record.assignerId.name ? record.assignerId.name : '-'
                            : record.referenceId && record.referenceId.name ? record.referenceId.name : '-'
                        : this.props.userType === USER_TYPES.DEALER
                            ? record.assignerId && record.assignerId.name ? record.assignerId.name : '-'
                            : record.referenceId && record.referenceId.name ? record.referenceId.name : '-'
                }
            },
        ];
    }

    render() {
        const { data } = this.props;
        return (
            <div className="RidersList RiderTableList">
                <Table className="gx-table-responsive"
                    columns={this.columns}
                    dataSource={data}
                    rowKey="id"
                    pagination={false} />
            </div>
        );
    }
}
export default AssignRetainVehicleTrack;
