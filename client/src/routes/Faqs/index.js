import {
    Icon, Row, Tooltip, message, Empty, Affix
} from 'antd';
import React, { Component } from 'react';

import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import { PAGE_PERMISSION } from '../../constants/Common';
import ActionButtons from '../../components/ActionButtons';
import AddButton from '../../components/ESAddButton';
import UpsertForm from './upsert';
import Search from '../../components/ESSearch';
import axios from 'util/Api';
import { connect } from 'react-redux';
import IntlMessages from '../../util/IntlMessages';


const DragHandle = SortableHandle(() => {
    return <Tooltip title="Drag to change sequence" arrowPointAtCenter={true}>
        <span className="gx-draggable-icon gx-text-dark" style={{ marginTop: 12 }}>
            <Icon type="drag" />
        </span>
    </Tooltip>;
}
);

const SortableItem = SortableElement(({ parent, indexNo, value }) => {
    return <tr key={indexNo} className="ant-table-row ant-table-row-level-0">
        <td>{indexNo + 1}</td>
        <td>{value.question}</td>
        <td>{value.answer}</td>
        <td>
            <div className="scooterActionItem">
                <DragHandle />
                <ActionButtons
                    pageId={PAGE_PERMISSION.FAQS}
                    edit={parent.handleEdit.bind(parent, value)}
                    deleteObj={{
                        documentId: value.id,
                        model: 'faqs'
                    }}
                    deleteFn={(res) => {
                        if (res.toString() === 'success') {
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
                        <th className="ant-table-header-column"><IntlMessages id="app.no"/></th>
                        <th className="ant-table-header-column"><IntlMessages id="app.question"/></th>
                        <th className="ant-table-header-column"><IntlMessages id="app.answer"/></th>
                        <th className="ant-table-header-column"><IntlMessages id="app.action"/></th>
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


class Faqs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: false,
            total: 0,
            filter: {},
            modalVisible: false,
            loginUser: this.props.auth && this.props.auth.authUser ? this.props.auth.authUser : null
        };
    }

    componentDidMount() {
        this.fetch();
    }

    fetch = async () => {
        this.setState((state) => {
            state.loading = true;
            state.total = 0;
            state.data = [];

            return state;
        });
        try {
            let response = await axios.post(
                'admin/faqs/paginate',
                this.state.filter
            );
            this.setState({
                total: response.data.list.length,
                loading: false,
                data: response.data.list
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
            filter: newState
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
                .post('admin/faqs/bulk-sequence-update', obj)
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
            <div className="gx-module-box gx-module-box-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <h1 className="pageHeading"><IntlMessages id="app.faqs"/></h1>

                            <div className="SearchBarwithBtn">
                                <div className="gx-mr-1">
                                    <Search
                                        handelSearch={this.onSearch}
                                        filter={this.state.filter}
                                        keys={['question']}
                                        placeholder="Search by Question"
                                    />
                                </div>
                                <AddButton onClick={this.addData.bind(this)} text={<IntlMessages id="app.add"/>} pageId={PAGE_PERMISSION.FAQS} />
                            </div>
                        </Row>
                    </div>
                </Affix>
                <div className="gx-module-box-content container">
                    {
                        data.length ?
                            <SortableList items={data}
                                loading={loading}
                                onSortEnd={this.onSortEnd}
                                useDragHandle={true}
                                lockToContainerEdges={true}
                                parent={this}
                            /> :
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    }
                    {this.state.modalVisible && <UpsertForm
                        onCancel={this.handleCancel}
                        handleSubmit={this.handleSubmit}
                        id={this.state.id}
                        parentId={this.state.filter.parentId}
                    />}
                </div>
            </div>
        );
    }
}

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(Faqs);
