import React, { Component } from 'react';
import { connect } from 'react-redux';
import { VERSION_PLATFORM, PAGE_PERMISSION } from '../../constants/Common';
import { Table, message, Row, Radio, Tooltip, Icon, Affix } from 'antd';
import axios from 'util/Api';
import CollectionVersionForm from './VersionForm';
import AddButton from '../../components/ESAddButton';
import UtilService from '../../services/util';
import IntlMessages from '../../util/IntlMessages';
class Version extends Component {
    state = {
        data: [],
        android: [],
        iphone: [],
        loading: false,
        createModalVisible: false,
        defaultTab: VERSION_PLATFORM.ANDROID,
        isEdit: false
    };
    dateSplit = arr => {
        console.log(arr);
        return (
            <div>
                <div>{arr[0]}</div>
                <div>{arr[1]}</div>
            </div>
        );
    };

    constructor(props) {
        super(props);
        this.columns = [
            {
                title: <IntlMessages id="app.srNo" defaultMessage="Sr. No" />,
                key: 'index',
                render: (text, record, index) => index + 1
            },
            {
                title: <IntlMessages id="app.name" defaultMessage="Name" />,
                dataIndex: 'name'
            },
            {
                title: <IntlMessages id="app.sidebar.version" defaultMessage="Version" />,
                dataIndex: 'number'
            },
            {
                title: <IntlMessages id="app.notification.date" defaultMessage="Date" />,
                dataIndex: 'createdAt',
                render: text => (
                    <span>
                        {this.dateSplit(UtilService.displayDate(text).split(','))}
                        {/* {UtilService.displayDate(text)} */}
                    </span>
                )
            },
            {
                title: <IntlMessages id="app.active" defaultMessage="Active" />,
                dataIndex: 'isActive',
                render: (text, record) => (
                    <Tooltip placement='topLeft' title={<IntlMessages id="app.version.clickToSetCurrentVersion" defaultMessage="Click  to set current version" />}>
                        <span>
                            <a href="/#" onClick={(e) => {
                                e.preventDefault();
                                this.handleActiveDeactiveVersion(record);
                            }}
                                // type={record.isActive ? 'primary' : 'danger'}
                                style={{ cursor: 'default' }}
                                size='small'
                                className={record.isActive ? 'active-btn' : 'deactive-btn'}
                            >
                                {record.isActive ? <IntlMessages id="app.active" defaultMessage="Active" /> : <IntlMessages id="app.deactive" defaultMessage="Deactive" />}
                            </a>
                        </span>
                    </Tooltip>
                )
            },
            {
                title: <IntlMessages id="app.update" defaultMessage="Update" />,
                dataIndex: 'isHardUpdate',
                render: (text, record) => (
                    <Tooltip
                        placement='topLeft'
                        title={
                            record.isHardUpdate
                                ? <IntlMessages id="app.version.versionHardUpdateMessage" defaultMessage="Currently this version is in hard update. Click to set soft update for this version" />
                                : <IntlMessages id="app.version.versionSoftUpdateMessage" defaultMessage="Currently this version is in soft update. Click to set hard update for this version" />
                        }>
                        <span>
                            <a href="/#" onClick={(e) => {
                                e.preventDefault();
                                this.handleHardUpdateVersion(record);
                            }}
                                style={{ cursor: 'default' }}
                                size='small'
                                className={record.isHardUpdate ? 'active-btn' : 'deactive-btn'}
                            >
                                {record.isHardUpdate ? <IntlMessages id="app.hardUpdate" defaultMessage="Hard Update" /> : <IntlMessages id="app.softUpdate" defaultMessage="soft update"/>}
                            </a>
                        </span>
                    </Tooltip>
                )
            },

            {
                title: 'Actions',
                render: (text, record) => (
                    <span>
                        <Tooltip title={<IntlMessages id="app.edit" defaultMessage="Edit"/>} placement='bottomLeft'>
                            <a href="/#" onClick={(e) => {
                                e.preventDefault();
                                this.handleEdit(record.id)
                            }}
                            >
                                <Icon type='edit' />
                            </a>
                        </Tooltip>
                    </span>
                )
            }
        ];
    }

    componentDidMount() {
        this.fetch();
    }

    createVersion = () => {
        this.setState({
            createModalVisible: true,
            isEdit: false
        });
        const { form } = this.formRef.props;
        form.resetFields();
        form.setFieldsValue({ platform: VERSION_PLATFORM.ANDROID, isHardUpdate: false });
    };

    saveFormRef = formRef => {
        this.formRef = formRef;
    };

    handleEdit = id => {
        let self = this;
        const { form } = self.formRef.props;
        axios
            .get('/admin/version/view/' + id)
            .then(data => {
                if (data.code === 'OK') {
                    self.setState({
                        createModalVisible: true,
                        isEdit: true
                    });
                    let resData = data.data;
                    let value = {
                        name: resData.name,
                        number: resData.number,
                        platform: resData.platform,
                        isHardUpdate: resData.isHardUpdate
                    };
                    self.editId = id;

                    form.setFieldsValue(value);
                    //this.props.dispatch({type: 'CURRENT_PAGE_DATA', payload: resData.apk_path});
                } else {
                    message.error(`${data.message}`);
                }
            })
            .catch(function (error) {
                console.log('Error****:', error.message);

                message.error(`${error.message}`);
            });
    };

    handleActiveDeactiveVersion = record => {
        this.setState({ loading: true });
        if (record && record.id) {
            let obj = {
                id: record.id,
                platform: record.platform
            };
            axios
                .put('/admin/version/setactive', obj)
                .then(data => {
                    if (data.code === 'OK') {
                        this.fetch();
                        this.setState({ loading: false });

                        message.success(`${data.message}`);
                    } else {
                        message.error(`${data.message}`);
                    }
                })
                .catch(function (error) {
                    console.log('Error****:', error.message);
                });
        }
    };

    handleHardUpdateVersion = record => {
        this.setState({ loading: true });
        if (record && record.id) {
            var obj = { id: record.id, isHardUpdate: !record.isHardUpdate };
            axios
                .put('/admin/version/set-hard-update', obj)
                .then(data => {
                    if (data.code === 'OK') {
                        this.fetch();
                        this.setState({ loading: false });

                        message.success(`${data.message}`);
                    } else {
                        message.error(`${data.message}`);
                    }
                })
                .catch(function (error) {
                    console.log('Error****:', error.message);
                });
        }
    };

    handleCancel = () => {
        this.setState({
            createModalVisible: false,
            isEdit: false
        });
    };

    handleCreate = () => {
        const { form } = this.formRef.props;
        let self = this;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            let obj = values;
            //obj.apk_path = self.props.commonData.pageData;

            if (self.editId && self.state.isEdit) {
                obj.id = self.editId;
                axios
                    .post('/admin/version/update', obj)
                    .then(data => {
                        if (data.code === 'OK') {
                            this.handleCancel();
                            form.resetFields();
                            this.setState({
                                isEdit: false
                            });

                            message.success(`${data.message}`);
                            this.fetch();
                        } else {
                            message.error(`${data.message}`);
                        }
                    })
                    .catch(function (error) {
                        console.log('Error****:', error.message);

                        message.error(`${error.message}`);
                    });
            } else {
                axios
                    .post('/admin/version/create', obj)
                    .then(data => {
                        if (data.code === 'OK') {
                            this.handleCancel();
                            form.resetFields();
                            this.setState({
                                isEdit: false
                            });

                            message.success(`${data.message}`);
                            this.fetch();
                        } else {
                            message.error(`${data.message}`);
                        }
                    })
                    .catch(function (error) {
                        console.log('Error****:', error.message);

                        message.error(`${error.message}`);
                    });
            }
        });
    };

    onTabChange = e => {
        this.setState({
            data: [],
            loading: true,
            defaultTab: e.target.value
        });
        if (e.target.value === VERSION_PLATFORM.IPHONE) {
            this.setState({
                data: this.state.iphone,
                loading: false
            });
        } else {
            this.setState({
                data: this.state.android,
                loading: false
            });
        }
    };

    fetch() {
        this.setState({ loading: true });
        axios
            .post('/admin/version/paginate', {})
            .then(data => {
                console.log('data', data.code);
                if (data.code === 'OK') {
                    console.log('data===', data.iphone);
                    if (this.state.defaultTab === VERSION_PLATFORM.IPHONE) {
                        this.setState({
                            data: data.data.iphone
                        });
                    } else {
                        this.setState({
                            data: data.data.android
                        });
                    }
                    this.setState({
                        android: data.data.android,
                        iphone: data.data.iphone,
                        loading: false
                    });
                }
            })
            .catch(function (error) {
                console.log('Error****:', error.message);
            });
    }

    render() {
        return (
            <React.Fragment>
                <div className='gx-module-box gx-mw-100 account-main-wrapper'>
                    <Affix offsetTop={1}>
                        <div className='gx-module-box-header'>
                            <Row type='flex' align='middle' justify='space-between'>
                                <h1 className='pageHeading'><IntlMessages id="app.sidebar.version" defaultMessage="Version" /></h1>
                                {/* <Badge count={this.state.data.length} style={{ backgroundColor: '#000' }} /> */}

                                <Row type='flex' justify='space-between'>
                                    <div className='CustomRadio'>
                                        <Radio.Group
                                            defaultValue={this.state.defaultTab}
                                            buttonStyle='solid'
                                            onChange={this.onTabChange}
                                            style={{ marginBottom: 16 }}>
                                            <Radio.Button value={VERSION_PLATFORM.ANDROID}>
                                                <span><IntlMessages id="app.android" defaultMessage="Android"/></span>
                                            </Radio.Button>
                                            <Radio.Button value={VERSION_PLATFORM.IPHONE}><IntlMessages id="app.iPhone" defaultMessage="IPhone" /></Radio.Button>
                                        </Radio.Group>
                                    </div>
                                    <AddButton onClick={this.createVersion} text={<IntlMessages id="app.version.addVersion" defaultMessage="Add Version"/>} pageId={PAGE_PERMISSION.VERSION} />
                                    <div />
                                </Row>
                            </Row>
                        </div>
                    </Affix>
                    <div className='RidersList RiderTableList'>
                        <Table
                            className='gx-table-responsive'
                            columns={this.columns}
                            loading={this.state.loading}
                            dataSource={this.state.data}
                            pagination={false}
                            rowKey={e => e.id}
                        />

                        <CollectionVersionForm
                            wrappedComponentRef={this.saveFormRef}
                            visible={this.state.createModalVisible}
                            onCancel={this.handleCancel}
                            onCreate={this.handleCreate}
                            isEdit={this.state.isEdit}
                        />
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = function (props) {
    return props;
};
export default connect(mapStateToProps)(Version);
