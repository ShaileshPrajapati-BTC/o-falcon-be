import { Collapse, Modal, Table } from 'antd';
import React, { Component } from 'react';
import UtilService from '../../services/util';
import { VEHICLE_REPORT_STATUS, FILTER_BY_VEHICLE_REPORT_STATUS } from '../../constants/Common';

class StatusTrack extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        const { data, onCancel, visible } = this.props;
        let columns = [
            {
                title: 'Date',
                dataIndex: 'dateTime',
                render: (text) => {
                    return UtilService.displayDate(text);
                }
            },
            {
                title: 'Before',
                dataIndex: 'before',
                render: (text) => {
                    let before = text && FILTER_BY_VEHICLE_REPORT_STATUS.find((el) => { return el.type === text })
                    return before ? before.label : '-';
                }
            },
            {
                title: 'After',
                dataIndex: 'after',
                render: (text) => {
                    let after = text && FILTER_BY_VEHICLE_REPORT_STATUS.find((el) => { return el.type === text })
                    return after ? after.label : '-';
                }
            },
            // {
            //     title: 'User',
            //     dataIndex: 'user.name',
            // },
            {

                title: 'Remark',
                dataIndex: 'remark',
                render: (text) => {
                    return text ? text : '-';
                }
            }
        ];
        return (
            <Modal
                visible={visible}
                title="Status Track"
                footer=""
                width="70vw"
                onCancel={onCancel}>
                <div style={{ maxHeight: 330, overflow: 'auto' }}>
                    <div className="RidersList RiderTableList">
                        <Table
                            className="gx-table-responsive"
                            columns={columns}
                            dataSource={data}
                            rowKey="id"
                            pagination={false} />
                    </div>
                </div>
            </Modal >
        );
    }

}
export default StatusTrack;
