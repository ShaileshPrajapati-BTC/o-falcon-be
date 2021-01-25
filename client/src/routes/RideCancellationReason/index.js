import {
    Icon, Row, Tooltip, message, Empty, Spin, Affix
} from 'antd';
import React, { Component } from 'react';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import { PAGE_PERMISSION } from '../../constants/Common';
import ActionButtons from '../../components/ActionButtons';
import AddButton from '../../components/ESAddButton';
import ESPagination from '../../components/ESPagination';
import UpsertForm from './upsert';
import Search from '../../components/ESSearch';
import axios from 'util/Api';
import { connect } from 'react-redux';
import IntlMessages from '../../util/IntlMessages';


const DragHandle = SortableHandle(() => {
    return <Tooltip title={<IntlMessages id="app.dragToChangeSequence" defaultMessage="Drag to change sequence"/>} placement="topLeft" arrowPointAtCenter={true}>
        <span className="gx-draggable-icon gx-text-dark" style={{ marginTop: 12 }}>
            <Icon type="drag" />
        </span>
    </Tooltip>;

}
);

const SortableItem = SortableElement(({ parent, indexNo, value }) => {
    return <tr key={indexNo} className="ant-table-row ant-table-row-level-0">
        <td>{indexNo + 1}</td>
        <td>{value.reason}</td>
        <td>
            <div className="scooterActionItem">
                <DragHandle />
                <ActionButtons
                    pageId={PAGE_PERMISSION.CANCELLATION_REASON}
                    edit={parent.handleEdit.bind(parent, value)}
                    deleteObj={{
                        documentId: value.id,
                        model: 'cancellationreason'
                    }}
                    deleteFn={(res) => {
                        if (res.toString() === 'success') {
                            parent.setState((state) => {
                                state.filter.page = 1;
                                state.paginate = false;
                            });
                            parent.fetch();
                        }
                    }} />
            </div>
        </td>
    </tr>;
});

const SortableList = SortableContainer(({ items, parent }) => {
    return (
        <div className="RidersList RiderTableList">
            <table className="gx-w-100">
                <thead className="ant-table-thead">
                    <tr>
                        <th className="ant-table-header-column"><IntlMessages id="app.no" defaultMessage="No"/></th>
                        <th className="ant-table-header-column"><IntlMessages id="app.reason" defaultMessage="Reason"/></th>
                        <th className="ant-table-header-column gx-text-right" style={{ paddingRight: '5%' }} >
                            <IntlMessages id="app.action" defaultMessage="Action"/>
                        </th>
                    </tr>
                </thead>
                <tbody className="ant-table-tbody">
                    {items.map((value, index) => {
                        return (
                            <SortableItem key={`item-${index}`}
                                parent={parent} index={index} indexNo={index} value={value}
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
});


class RideCancellationReason extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: false,
            total: 0,
            filter: {
                page: 1,
                limit: 15,
                filter: {}
            },
            modalVisible: false,
            loginUser: this.props.auth && this.props.auth.authUser ? this.props.auth.authUser : null,
            paginate: false
        };
    }

    componentDidMount() {
        this.fetch();
    }

    fetch = async (page) => {
        this.setState((state) => {
            state.loading = true;
            state.total = 0;
            state.data = [];

            return state;
        });
        if (page) {
            this.setState((state) => {
                state.filter.page = page;

                return state;
            });
        }
        try {
            let response = await axios.post(
                'admin/cancellation-reasons/paginate',
                this.state.filter
            );
            this.setState({
                total: response.data.list.length,
                loading: false,
                data: response.data.list,
                paginate: true
            });
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    }

    handleEdit = (record) => {
        this.setState({
            modalVisible: true,
            id: record.id
        });
    };

    handleSubmit = () => {
        this.setState((state) => {
            state.filter.page = 1;
            state.paginate = false;
        });
        this.fetch();
        this.handleCancel();
    }

    handleCancel = () => {
        this.setState({
            id: null,
            modalVisible: false
        });
    };

    onSearch = (newState) => {
        this.setState({
            filter: newState,
            paginate: false
        }, () => {
            this.fetch();
        });
    };

    addData = () => {
        this.setState({
            modalVisible: true
        });
    };


    handleChange = (pagination, filters, sorter) => {
        console.log('Various parameters', pagination, filters, sorter);
        this.setState({
            sortedInfo: sorter
        });
    };

    onSortEnd = ({ oldIndex, newIndex }, e) => {
        e.stopPropagation();
        if (oldIndex === newIndex) {
            return;
        }

        this.setState(({ data }) => {
            return {
                data: arrayMove(data, oldIndex, newIndex)
                // updateSequence: true
            };
        }, () => {
            // let seq = [];

            console.log(this.state.data);
            const seq = this.state.data.map((v, index) => {
                // seq.push({
                //     id: v.id,
                //     sequence: index + 1
                // });
                return {
                    id: v.id,
                    sequence: index + 1
                }
            });

            const obj = { sequences: seq };

            axios
                .post('admin/cancellation-reasons/bulk-sequence-update', obj)
                .then((data) => {
                    if (data.code === 'OK') {
                        message.success(`${data.message}`);
                    } else {
                        message.error(`${data.message}`);
                    }
                })
                .catch((error) => {
                    let errMsg = error.message;
                    message.error(`${errMsg}`);
                });
        });
    };

    render() {
        let { data, loading } = this.state;

        return (
            <div className="gx-module-box gx-mw-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <h1 className="pageHeading"><IntlMessages id="app.rideCancellationReason" defaultMessage="Ride Cancellation Reason"/></h1>
                            <div className="SearchBarwithBtn">
                                <Search
                                    handelSearch={this.onSearch}
                                    filter={this.state.filter}
                                    keys={['reason']}
                                    placeholder="Search by reason"
                                />
                                <AddButton onClick={this.addData.bind(this)} text={<IntlMessages id="app.add" defaultMessage="Add"/>} pageId={PAGE_PERMISSION.CANCELLATION_REASON} />
                            </div>
                        </Row>
                        <Row type="flex" align="middle" justify="space-between" style={{ marginTop: 20 }}>
                            <div className="DropdownWidth"></div>
                            {this.state.paginate ?
                                <ESPagination
                                    limit={this.state.filter.limit}
                                    total={this.state.total}
                                    fetch={this.fetch.bind(this)}
                                /> :
                                null}
                        </Row>
                    </div>
                </Affix>
                <div className="gx-module-box-content container">
                    <Spin spinning={loading} delay={100}>
                        {
                            data.length ?
                                <SortableList items={data}
                                    onSortEnd={this.onSortEnd}
                                    useDragHandle={true}
                                    lockToContainerEdges={true}
                                    parent={this}
                                    loading={loading}
                                /> :
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        }
                        {this.state.modalVisible && <UpsertForm
                            onCancel={this.handleCancel}
                            handleSubmit={this.handleSubmit}
                            id={this.state.id}
                            parentId={this.state.filter.parentId}
                        />}
                    </Spin>
                </div>
            </div>
        );
    }
}

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(RideCancellationReason);
