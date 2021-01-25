import { Avatar, Button, Card, message, Spin, Tabs, Upload, Form, Tag } from 'antd';
import React, { Component } from 'react';
import BasicInfo from './basicInfo';
// import Cards from './cards';
import { DOCUMENT_VERIFICATION_REQUIRED, FILE_TYPES, BASE_URL, RIDER_ROUTE, PAGE_PERMISSION, WALLET_CONFIG_VISIBLE, TASK_PRIORITY, TASK_MODULE_VISIBLE, RIDER_LABEL, FILTER_BY_TASK_LEVEL, FEEDER_ROUTE } from '../../constants/Common';
import Documents from '../Users/documents';
import WalletDetails from "../Users/walletDetails";
import { Link } from 'react-router-dom';
import UtilService from '../../services/util';
import axios from 'util/Api';
import { connect } from 'react-redux'
import { USER_TYPES } from '../../constants/Common';
import TaskList from '../TasksList';
import FeederEarning from "./FeederEarning";
const _ = require('lodash')
const TabPane = Tabs.TabPane;

class FeederView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            loading: false,
            id: props.match.params.id,
            image: '',
            imageUploadprops: {
                name: 'file',
                listType: 'picture',
                className: 'upload-list-inline',
                showUploadList: false,
                action: '/upload-file',
                fileList: [],
                headers: {
                    destination: 'master'
                },
                beforeUpload: (file) => {
                    return this.validateFile(file, { type: 'image' })
                        ;
                },
                onChange: (info) => {
                    return this.onFileChange(info, {
                        fieldName: 'image',
                        stateKeyName: 'imageUploadprops'
                    })
                        ;
                }
            }
        };
    }

    validateFile = function (file, as) {
        file.isValid = FILE_TYPES[as.type].indexOf(file.type) > -1;
        if (!file.isValid) {
            message.error('Invalid file type');
        }

        return file.isValid;
    };

    onFileChange(info, option) {
        if (info.file.status === 'removed') {
            let obj = {};
            obj[option.fieldName] = '';
            this.props.form.setFieldsValue(obj);
        }

        if (info.file && info.file.response && info.file.response.code === 'OK') {
            let { data } = info.file.response;
            this.setState({ image: data.files[0].absolutePath });
        }

        const validFiles = _.filter(info.fileList, { isValid: true }) || [];
        this.setState((state) => {
            state[option.stateKeyName].fileList = validFiles;

            return state;
        }, async () => { await this.updateImage() })
    }

    updateImage = async () => {
        const { data, image } = this.state
        await this.setState({ data: { ...data, image } })
        if (this.state.data.id) {
            try {
                const data = await axios.put(`admin/user/${this.state.data.id}`, this.state.data)
                if (data.code === 'OK') {
                    await this.setState({ image: data.data[0].image })
                    // message.success(`${data.message}`);
                }
            } catch (error) {
                console.log('Error****:', error.message);
                message.error(`${error.message}`);
            }
        }
    }
    componentDidMount() {
        this.fetch();
    }

    fetch = async () => {
        try {
            let random = Math.random() * 10;
            this.setState({ loading: true, isTransactionTab: false });
            let response = await axios.get(`admin/feeder/${this.state.id}?a=${random}`);

            // if (data.data.type === USER_TYPES.RIDER) {
            //     this.onTabChange(TABS.VEHICLE);
            // }

            this.setState({ data: response.data, loading: false, isTransactionTab: true });
            // this.setState({ loading: false });

        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    }

    render() {
        const { imageUploadprops, loading, data, image } = this.state;
        const { getFieldDecorator } = this.props.form;
        const level = data.level ? _.find(FILTER_BY_TASK_LEVEL, { type: data.level }) : null;

        return (
            <div className="gx-module-box gx-mw-100">
                <div className="gx-module-box-content">
                    <Spin spinning={loading} delay={100}>
                        {data && data.id ?
                            <div className={'gx-p-5'}>
                                <div className="gx-profile-banner">
                                    <div className="gx-profile-container">
                                        <div className="gx-profile-banner-top">
                                            <div className="gx-profile-banner-top-left">
                                                <div className="gx-profile-banner-avatar">
                                                    <Form layout="vertical" className="m-v-15">
                                                        <Form.Item
                                                            style={{ width: '25%', paddingLeft: '10px', display: 'inline-block' }}>
                                                            {getFieldDecorator('file')(
                                                                <Upload {...imageUploadprops}>
                                                                    <Avatar className="gx-size-90"
                                                                        alt="..."
                                                                        src={image ? image : `${BASE_URL}/${data.image}`}
                                                                        icon="user" >
                                                                    </Avatar>
                                                                </Upload>
                                                            )}
                                                        </Form.Item>
                                                    </Form>

                                                </div>
                                                <div className="gx-profile-banner-avatar-info">
                                                    <h2 className="gx-mb-2 gx-mb-sm-3 gx-fs-xxl gx-font-weight-light gx-text-capitalize">
                                                        {data.name ? data.name : '-'}
                                                        {data.customerId && data.customerId.id &&
                                                            <span style={{ marginLeft: 15 }}>
                                                                <Link to={`/e-scooter/${RIDER_ROUTE}/view/${data.customerId.id}`}>
                                                                    <Tag color="green" className="gx-pointer">{RIDER_LABEL}</Tag>
                                                                </Link>
                                                            </span>
                                                        }
                                                    </h2>
                                                    {
                                                        data.emails && data.emails.length > 0 &&
                                                        <React.Fragment>
                                                            <b>Email: </b>
                                                            {UtilService.getPrimaryValue(data.emails, 'email')
                                                            }
                                                            <br />
                                                        </React.Fragment>
                                                    }
                                                    {
                                                        data.mobiles && data.mobiles.length > 0 &&
                                                        <React.Fragment>
                                                            <b>Mobile: </b>{UtilService.getPrimaryValue(data.mobiles, 'mobile')}<br />
                                                        </React.Fragment>
                                                    }
                                                    {
                                                        data.dob.length > 0 &&
                                                        <React.Fragment>
                                                            <b>DOB: </b>{UtilService.displayDOB(data.dob)} <br />
                                                        </React.Fragment>
                                                    }
                                                    {data.level &&
                                                        <React.Fragment>
                                                            <b>Level: </b>{level ? level.label : ''} <br />
                                                        </React.Fragment>
                                                    }
                                                </div>
                                            </div>
                                            <div className="gx-profile-banner-top-right" style={{ display: 'flex' }}>
                                                {/* <div>
                                                    <Link
                                                        to={{
                                                            pathname: `/e-scooter/${RIDER_ROUTE}`,
                                                            filter: this.props.location.filter
                                                        }}>
                                                        <Button className="gx-mb-0">List</Button>
                                                    </Link>
                                                </div> */}
                                                <div style={{ marginLeft: '10px' }}>
                                                    <Link
                                                        to={{
                                                            pathname: this.props.location && this.props.location.redirectPath ? this.props.location.redirectPath : `/e-scooter/${FEEDER_ROUTE}`,
                                                            filter: this.props.location.filter
                                                        }}>
                                                        <Button className="gx-mb-0">Back</Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="gx-profile-content">
                                    <div className="RiderInfo">
                                        <Card title=""
                                            className="gx-card-tabs gx-card-tabs-left gx-card-profile" >
                                            <Tabs defaultActiveKey="1">
                                                <TabPane tab="Info" key="1">
                                                    <BasicInfo info={data} />
                                                </TabPane>
                                                {DOCUMENT_VERIFICATION_REQUIRED ?
                                                    <TabPane tab="Documents" key="2">
                                                        <Documents data={data.documents} id={data.id} />
                                                    </TabPane> :
                                                    null}
                                                {TASK_MODULE_VISIBLE &&
                                                    <TabPane tab="Performance" key="3">
                                                        <TaskList assignedTo={data.id} />
                                                    </TabPane>
                                                }
                                                {/* <TabPane tab="Transactions" key="4">
                                                    <WalletDetails id={this.state.id} />
                                                </TabPane> */}
                                                {/* <TabPane tab="Earning" key="5">
                                                    <FeederEarning id={this.state.id} />
                                                </TabPane> */}
                                            </Tabs>
                                        </Card>
                                    </div>
                                </div>
                            </div> :
                            null}
                    </Spin>
                </div>
            </div >
        );
    }
}
const mapStateToProps = (props) => {
    return props
};

const WrappedImageUpsert = Form.create()(FeederView);
export default connect(mapStateToProps)(WrappedImageUpsert);
