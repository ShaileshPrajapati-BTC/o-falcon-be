/* eslint-disable max-lines-per-function */
import {
    Form, Input, InputNumber, message, Select,
    Table, Icon, Popover
} from 'antd';
import React, { Component } from 'react';
import {
    COMMISSION_TYPE_ARRAY, COMMISSION_TYPE, FRANCHISEE_LABEL
} from '../../constants/Common';
import axios from 'util/Api';
import { connect } from 'react-redux';
import StatusTrack from "./statusTrack";

const _ = require('lodash');

const EditableContext = React.createContext();

class EditableCell extends React.Component {
    getInput = () => {
        const { dataIndex, inputType, title } = this.props;
        if (dataIndex === 'type') {
            return <Select style={{ width: '100%' }} >
                {_.map(COMMISSION_TYPE_ARRAY, (item) => {
                    return <Select.Option
                        key={item.value}
                        value={item.value}
                    >
                        {item.label}
                    </Select.Option>;
                })}
            </Select>
        } else if (inputType === 'number' && title !== 'type') {
            return <InputNumber />;
        }
        return <Input />;
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
        if (dataIndex === 'percentage' && record && record.type === COMMISSION_TYPE.AMOUNT) {
            value = record.amount;
        } else if (dataIndex === 'percentage' && record) {
            value = record.percentage;
        }

        return (
            <td {...restProps}>
                {editing ? (
                    <Form.Item style={{ margin: 0, width: '100%' }}>
                        {getFieldDecorator(dataIndex, {
                            rules: [
                                {
                                    required: true,
                                    message: `Please Input ${title}!`,
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

class FranchiseeCommissionUpsert extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            franchiseeCommissionsList: [],
            editingKey: '',
            showStatusTrackModal: false,
            statusTrack: []
        };

        this.columns = [
            {
                title: `${FRANCHISEE_LABEL} Name`,
                dataIndex: 'franchiseeId.name',
                width: '25%',
                editable: false,
            },
            {
                title: 'Type',
                dataIndex: 'type',
                width: '25%',
                editable: true,
                render: (text, record) => {
                    let res = _.find(COMMISSION_TYPE_ARRAY, a => a.value === text);
                    return res.label;
                    // return (
                    //     <Select style={{ width: '100%' }} defaultValue={text}
                    //         disabled={this.state.editingKey !== record.id}>
                    //         {_.map(COMMISSION_TYPE_ARRAY, (item) => {

                    //             return <Select.Option
                    //                 key={item.value}
                    //                 value={item.value}
                    //             >
                    //                 {item.label}
                    //             </Select.Option>;
                    //         })}
                    //     </Select>
                    // )
                }
            },
            {
                title: 'Commission',
                dataIndex: 'percentage',
                width: '20%',
                editable: true,
                render: (text, record) => {
                    if (record.type === COMMISSION_TYPE.AMOUNT) {
                        return record.amount
                    } else {
                        return record.percentage;
                    }
                }
            },
            {
                title: 'Action',
                dataIndex: 'operation',
                render: (text, record) => {
                    const { editingKey } = this.state;
                    const editable = this.isEditing(record);
                    return <React.Fragment>
                        {editable ? (
                            <span>
                                <EditableContext.Consumer>
                                    {form => (
                                        <a
                                            href="/#" onClick={(e) => {
                                                e.preventDefault();
                                                this.save(form, record.id)
                                            }}
                                            style={{ marginRight: 8 }}
                                        >
                                            Save
                                        </a>
                                    )}
                                </EditableContext.Consumer>
                                <a
                                    href="/#" onClick={(e) => {
                                        e.preventDefault();
                                        this.cancel(record.id)
                                    }}>Cancel</a>
                            </span>
                        ) : (
                                <a
                                    href="/#" onClick={(e) => {
                                        e.preventDefault();
                                        this.edit(record.id)
                                    }}
                                    disabled={editingKey !== ''}>
                                    Edit
                                </a>
                            )}
                        <div className="scooterIC" style={{ display: 'inline-block', paddingLeft: '15px' }}>
                            <Popover content="Commission Track" title={null}>
                                <a href="/#" onClick={(e) => {
                                    e.preventDefault();
                                }}>
                                    <Icon
                                        type="profile"
                                        onClick={this.statusTrack.bind(
                                            this,
                                            record.track
                                        )}
                                    />
                                </a>
                            </Popover>
                        </div>
                    </React.Fragment>
                },
            }
        ];
    }

    componentDidMount() {
        this.fetch();
    }

    componentDidUpdate(prevProps) {
        if (prevProps && prevProps['reFetch'] !== undefined &&
            prevProps.reFetch !== this.props.reFetch && this.props.reFetch === true) {
            this.initialize();
            this.props.handleFetchFranchiseeCommission(false);
        }
    }

    initialize = async () => {
        await this.fetch();
    }

    fetch = async () => {
        this.setState({ loading: true });
        try {
            let response = await axios.post('/admin/franchisee/commission-list', {});
            let record = response.data.list;
            // const formObj = _.omit(record, ['id']);
            // const { form } = this.props;
            // form.setFieldsValue(formObj);
            this.setState({ loading: false, franchiseeCommissionsList: record });
        } catch (error) {
            console.log('Error****:', error.message);
            message.error(`${error.message}`);
            this.setState({ loading: false });
        }
    }

    updateFranchiseeCommission = async (req) => {
        try {
            let reqData = {
                franchiseeId: req.franchiseeId.id,
                type: req.type
            }
            if (req.type === COMMISSION_TYPE.AMOUNT) {
                reqData.amount = req.percentage;
            } else if (req.type === COMMISSION_TYPE.PERCENTAGE) {
                reqData.percentage = req.percentage;
            }
            let response = await axios.put('/admin/franchisee/commission/update-commission', reqData);
            console.log('response', response);
            message.success(`${response.message}`);
            this.props.handleFetchFranchiseeCommission(true);
        } catch (error) {
            console.log('Error****:', error.message);
            message.error(`${error.message}`);
        }
    };

    isEditing = record => record.id === this.state.editingKey;

    cancel = () => {
        this.setState({ editingKey: '' });
    };

    save = async (form, key) => {
        await form.validateFields(async (error, row) => {
            if (error) {
                return;
            }
            if (row.type === COMMISSION_TYPE.AMOUNT) {
                row.amount = row.percentage;
            } else if (row.type === COMMISSION_TYPE.PERCENTAGE) {
                row.percentage = row.percentage;
                if (row.percentage > 100) {
                    message.error("Percentage value can not be greater than 100.")
                    return;
                }
            }
            const newData = [...this.state.franchiseeCommissionsList];
            const index = newData.findIndex(item => key === item.id);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row,
                });
                await this.updateFranchiseeCommission(newData[index]);
                this.setState({ franchiseeCommissionsList: newData, editingKey: '' });
            }
            // else {
            //     newData.push(row);
            //     this.setState({ franchiseeCommissionsList: newData, editingKey: '' });
            // }
        });
    }

    edit = (key) => {
        this.setState({ editingKey: key });
    }

    statusTrack = value => {
        console.log("status track", value);
        this.setState({ showStatusTrackModal: true, statusTrack: value });
    };
    hideStatusTrack = () => {
        this.setState({ showStatusTrackModal: false });
    }

    render() {
        const components = {
            body: {
                cell: EditableCell,
            },
        };

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

        return (
            <div className="RidersList RiderTableList">
                <EditableContext.Provider value={this.props.form}>
                    <Table
                        className="gx-table-responsive"
                        components={components}
                        bordered
                        dataSource={this.state.franchiseeCommissionsList}
                        columns={columns}
                        rowClassName="franchisee-editable-row"
                        pagination={{
                            onChange: this.cancel,
                        }}
                    />
                </EditableContext.Provider>
                <StatusTrack
                    data={this.state.statusTrack}
                    onCancel={this.hideStatusTrack}
                    visible={this.state.showStatusTrackModal}
                />
            </div>
        );
    }
}


const WrappedFranchiseeCommissionUpsertModal = Form.create({ name: 'franchiseeCommissionUpsertForm' })(FranchiseeCommissionUpsert);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedFranchiseeCommissionUpsertModal);
