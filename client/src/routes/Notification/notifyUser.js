import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Badge, Button, Checkbox, Col, Icon, Input, List, Row, Tabs, message } from 'antd';
import { DEFAULT_LANGUAGE, NOTIFICATION_TYPE, USER_TYPES, RIDER_LABEL, FEEDER_LABEL, GUEST_USER, FEEDER_VISIBLE } from '../../constants/Common';
import { EditorState, convertToRaw } from 'draft-js';
import React, { Component } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import LanguagesList from '../../components/LanguagesList';
import RadioGroup from '../../components/RadioGroup';
import UtilService from '../../services/util';
import { ReactComponent as Mobile } from '../../assets/svg/mobile.svg';
import { ReactComponent as Email } from '../../assets/svg/email.svg';
import axios from 'util/Api';
import { connect } from 'react-redux';
import draftToHtml from 'draftjs-to-html';
import queryString from 'query-string';
import update from 'immutability-helper';
import IntlMessages from '../../util/IntlMessages';

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Search } = Input;
const _ = require('lodash');

class NotifyUser extends Component {
    constructor(props) {
        super(props);

        const query = queryString.parse(this.props.location.search);
        const type = parseInt(query.type, 10);
        this.state = {
            language: DEFAULT_LANGUAGE,
            defaultTab: type ? type : USER_TYPES.ADMIN,
            filter: {
                filter: {
                    type: USER_TYPES.ADMIN,
                    isDeleted: false
                }
            },
            loading: false,
            data: [],
            total: 0,
            selected: false,
            subData: [],
            content: '',
            subject: '',
            tabNumber: 1,
            disable: true,
            all: false,
            editorState: EditorState.createEmpty(),
            id: '',
            user: USER_TYPES.ADMIN
        };
        const { authUser } = props.auth;
        let userTypes = [
            { name: <IntlMessages id="app.admin" />, type: USER_TYPES.ADMIN },
            { name: <IntlMessages id="app.subadmin" />, type: USER_TYPES.SUB_ADMIN },
            { name: <IntlMessages id="app.staff" />, type: USER_TYPES.STAFF },
            { name: RIDER_LABEL, type: USER_TYPES.RIDER },
        ];
        if (FEEDER_VISIBLE) {
            userTypes.push({ name: FEEDER_LABEL, type: USER_TYPES.FEEDER })
        }
        if (authUser.type === USER_TYPES.ADMIN) {
            userTypes = userTypes.slice(1, 4);
        }
        if (authUser.type === USER_TYPES.SUB_ADMIN) {
            userTypes = userTypes.slice(2, 4);
        }
        this.userTypes = userTypes;

    }
    componentDidMount() {
        const query = queryString.parse(this.props.location.search);
        const type = parseInt(query.type, 10);
        if (query.id && type) {
            this.setState((state) => {
                state.id = query.id;
                state.filter.filter.type = type;
                state.defaultTab = type;
                state.user = type;
            });
        }
        this.fetch();
    }
    fetch = async () => {
        this.setState({ loading: true });
        try {
            let response = await axios.post('admin/user/paginate', this.state.filter);
            if (response.code === 'OK') {
                this.setState({
                    total: response.data.count,
                    loading: false,
                    data: response.data.list
                });
                if (this.state.id) {
                    let tempData = _.cloneDeep(this.state.data);
                    let index = _.findIndex(tempData, { id: this.state.id });
                    if (index > -1) {
                        tempData[index].checked = true;
                        this.setState({ data: tempData });
                        this.state.subData.push(this.state.data[index]);
                    }
                }
            }
            this.setState({ loading: false });

        } catch (error) {
            this.setState({ loading: false });
            console.log('ERROR   ', error);
        }
    }
    setSubData = () => {
        let id = _.last(_.split(window.location.pathname, '/'));
        if (id !== 'notifyUser') {
            this.setState({ id: id });
            let tempData = _.cloneDeep(this.state.data);
            let index = _.findIndex(tempData, { id: id });
            tempData[index].checked = true;
            this.setState({ data: tempData });
            this.state.subData.push(this.state.data[index]);
        }
    }
    onTabChange = (e) => {
        this.setState((state) => {
            state.user = e.target.value;
            state.filter.filter.type = e.target.value;
            state.subData = [];
        }, () => {
            this.fetch();
        });
    }
    handleSearch = (search) => {
        let data = this.state.filter;
        data.search = undefined;

        if (search.trim()) {
            data.search = {
                keyword: search,
                keys: ['name', 'emails.email']
            };
        }
        const newState = update(this.state.filter, {
            $merge: { ...data, page: 1 }
        });

        this.setState({
            filter: newState
        }, () => {
            this.fetch();
        });
    }
    selectAll = (e) => {
        this.setState({ all: e.target.checked });
        let tempData = [...this.state.data];
        _.each(tempData, (data) => {
            data.checked = e.target.checked;
        });
        if (e.target.checked) {
            this.setState({ subData: tempData });
        }
        if (!e.target.checked) {
            this.setState({ subData: [] });
        }
    }
    selectOne = (id, e) => {
        if (id === this.state.id) {
            this.setState({ id: '' });
        }
        let temData = [...this.state.data];
        let index = _.findIndex(temData, { id: id });
        temData[index].checked = e.target.checked;
        this.setState({ data: temData });
        if (e.target.checked) {
            this.state.subData.push(this.state.data[index]);
        }
        if (!e.target.checked) {
            _.remove(this.state.subData, { id: id });
        }
    }
    tabChange = (value) => {
        this.setState({
            tabNumber: value,
            content: '',
            subject: '',
            disable: true,
            editorState: EditorState.createEmpty()
        });
    }
    onDelete = (id) => {
        if (this.state.all) {
            this.setState({ all: false })
        }
        let tempData = [...this.state.data];
        let index = _.findIndex(tempData, { id: id });
        tempData[index].checked = false;
        this.setState({ data: tempData });
        _.remove(this.state.subData, { id: id });
    }
    onDeleteAll = async () => {
        this.setState({ subData: [], all: false }, () => this.fetch())
    }
    handleLanguageChange = (language) => {
        this.setState({ language: language });
    }
    reset = () => {
        this.setState({
            subData: [],
            content: '',
            subject: '',
            disable: true,
            editorState: EditorState.createEmpty()
        }, () => {
            this.fetch();
        });
    }
    handleSubmit = async () => {
        let obj = {};
        if (this.state.subData.length > 0) {
            obj.users = this.state.subData;
            obj.type = parseInt(this.state.tabNumber);
            obj.content = this.state.content;
            if (this.state.tabNumber === 1) {
                obj.subject = this.state.subject;
            }
            if (this.state.tabNumber === 3) {
                obj.language = this.state.language;
            }
            try {
                let response = await axios.post('admin/notification/send', obj);
                if (response.code === 'OK') {
                    this.reset();
                    message.success(response.message);

                }
            } catch (error) {
                message.error(error.message);
            }
        } else {
            message.error(<IntlMessages id="app.notification.pleaseSelectUserFirst"/>);
        }
    }
    subjectInput = (e) => {
        this.setState({ subject: e.target.value });
    }
    contentInput = (e) => {
        if (e.target.value.length > 0) {
            this.setState({ content: e.target.value, disable: false });
        } else {
            this.setState({ disable: true });
        }
    }
    onEditorStateChange = (editorState) => {
        this.setState({ editorState });
        let content = draftToHtml(convertToRaw(editorState.getCurrentContent()));
        this.setState({ content: content, disable: false });
    }
    render() {
        const { data, subData } = this.state;

        return (
            <Row className="height-100">
                <Col span={7} className="border-right-block">
                    <div style={{ marginTop: 10, marginLeft: 8 }}>
                        <div className="CustomRadio" style={{ padding: '10px 0px 0px 10px' }}>
                            <RadioGroup
                                defaultVal={this.state.defaultTab}
                                list={this.userTypes}
                                value={this.state.user}
                                val="type"
                                label="name"
                                onChange={this.onTabChange.bind(this)}
                            />
                        </div>
                        <br />
                        <Checkbox checked={this.state.all}
                            onChange={this.selectAll.bind(this)}
                            style={{ marginTop: 7, zoom: '2.5', marginLeft: '6px' }} />
                        <Search placeholder="input search text" onSearch={this.handleSearch}
                            style={{ width: 300, marginTop: 7, marginLeft: '20px' }} />
                    </div>
                    <List
                        itemLayout="horizontal"
                        dataSource={data}
                        loading={this.state.loading}
                        style={{ paddingLeft: '10px' }}
                        renderItem={(item) => {
                            return <List.Item className={item.checked ? 'list-item-selected' : ''}>
                                <div className="ant-list-item-meta">
                                    <div style={{ padding: '0px 20px' }}>
                                        {/* <span className="ant-avatar ant-avatar-circle ant-avatar-image gx-pointer"> */}
                                        {/* {item.checked ?
                                                <SelectCheck /> : */}
                                        <Checkbox
                                            checked={item.checked}
                                            className='notifycheckbox'
                                            onChange={this.selectOne.bind(this, item.id)}
                                        />
                                        {/* }
                                        </span> */}
                                    </div>
                                    <div className="ant-list-item-meta-content" style={{ width: '220px', flex: 'initial' }}>
                                        <h3 style={{ textTransform: 'capitalize' }}>
                                            <b>{item.name.length === 0 ? GUEST_USER : item.name}</b>
                                        </h3>
                                        <div className="gx-flex-row" style={{ marginTop: '-5px' }}>
                                            <div className="ant-list-item-meta-description" style={{ marginRight: '50px' }}>
                                                <Mobile style={{ marginRight: '5px' }} />
                                                {item.mobiles && _.size(item.mobiles) > 0 && UtilService.getPrimaryValue(item.mobiles, 'mobile')}
                                            </div><br />
                                            <div className="ant-list-item-meta-description">
                                                <Email style={{ marginRight: '5px' }} />
                                                {item.emails && _.size(item.emails) > 0 && UtilService.getPrimaryValue(item.emails, 'email')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </List.Item>;
                        }
                        } />
                </Col>
                {subData && subData.length > 0 ?
                    <Col span={5} className="border-right-block">
                        <div style={{ marginTop: 10 }}>
                            <h5><b>
                                <IntlMessages id="app.notification.selectedUsers"/>  <Badge count={subData.length} className="notification-badge" />
                                {subData.length > 1 ?
                                    <Icon type="delete" onClick={this.onDeleteAll.bind(this)} style={{ color: '#000' }} /> :
                                    null}
                            </b></h5>

                        </div>
                        <List
                            itemLayout="horizontal"
                            dataSource={subData}
                            renderItem={(item) => {
                                return <List.Item>
                                    <div className="ant-list-item-meta">
                                        <div className="ant-list-item-meta-content" style={{ width: '220px', flex: 'initial' }}>
                                            <h3 style={{ textTransform: 'capitalize' }}>
                                                <b>{item.name}</b>
                                                <Icon type="delete" onClick={() => this.onDelete(item.id)}
                                                    style={{ fontSize: 14, marginLeft: 10, color: '#000' }} />
                                            </h3>
                                            <div className="gx-flex-row" style={{ marginTop: '-5px' }}>
                                                <div className="ant-list-item-meta-description" style={{ marginRight: '50px' }}>
                                                    <Mobile style={{ marginRight: '5px' }} />
                                                    {item.mobiles && _.size(item.mobiles) > 0 && UtilService.getPrimaryValue(item.mobiles, 'mobile')}
                                                </div><br />
                                                <div className="ant-list-item-meta-description">
                                                    <Email style={{ marginRight: '5px' }} />
                                                    {item.emails && _.size(item.emails) > 0 && UtilService.getPrimaryValue(item.emails, 'email')}
                                                </div>
                                            </div>
                                        </div>
                                        {/* <div className="scooterActionItem" style={{ marginTop: '10px' }}>
                                            <ActionButtons
                                                deleteObj={{
                                                    noConfirmation: true,
                                                    documentId: item.id,
                                                    page: 'bankdetail',
                                                }}
                                                deleteFn={res => { this.onDelete(res.documentId) }}
                                            />
                                        </div> */}
                                    </div>
                                </List.Item>;
                            }
                            } />
                    </Col> :
                    ''}
                <Col span={11} >
                    <div style={{ marginTop: 7 }}>
                        <LanguagesList
                            onSelect={this.handleLanguageChange.bind(this)}
                            selected={this.state.language}
                        />
                    </div>
                    <div className="tabsContainer" style={{ marginTop: 10 }}>
                        <Tabs defaultActiveKey="1" onChange={this.tabChange.bind(this)}>
                            <TabPane tab={<IntlMessages id="app.notification.email"/>} key={NOTIFICATION_TYPE.EMAIL}>
                                <b><IntlMessages id="app.notification.subject"/> : </b>
                                <Input onChange={this.subjectInput.bind(this)}
                                    value={this.state.subject}
                                    style={{ marginTop: 7, marginBottom: 7 }} />
                                <b><IntlMessages id="app.notification.content"/> : </b>
                                <Editor
                                    editorStyle={{
                                        width: '100%',
                                        minHeight: 100,
                                        maxHeight: 250,
                                        borderWidth: 1,
                                        borderStyle: 'solid',
                                        borderColor: 'lightgray',
                                        borderRadius: 8,
                                        marginTop: 8
                                    }}
                                    editorState={this.state.editorState}
                                    onEditorStateChange={this.onEditorStateChange}
                                />

                            </TabPane>
                            <TabPane tab={<IntlMessages id="app.notification.sms"/>} key={NOTIFICATION_TYPE.SMS}>

                                <b><IntlMessages id="app.notification.content"/> : </b>
                                <TextArea rows={4}
                                    value={this.state.content}
                                    style={{ marginTop: 7 }}
                                    onChange={this.contentInput.bind(this)} />
                            </TabPane>
                            <TabPane tab={<IntlMessages id="app.notification.pushNotification"/>} key={NOTIFICATION_TYPE.PUSH_NOTIFICATION}>
                                <div style={{ marginTop: 7 }}>
                                    <b ><IntlMessages id="app.notification.content"/> : </b>
                                    <TextArea rows={4}
                                        value={this.state.content}
                                        style={{ marginTop: 7 }}
                                        onChange={this.contentInput.bind(this)} />
                                </div>
                            </TabPane>
                        </Tabs>
                    </div>
                    <div className="gx-text-right" style={{ marginTop: 7 }}>
                        <Button onClick={this.reset.bind(this)}><IntlMessages id="app.notification.cancel" /></Button>
                        <Button onClick={this.handleSubmit.bind(this)}
                            disabled={this.state.disable}>
                            <IntlMessages id="app.notification.send"/>
                        </Button>
                    </div>
                </Col>
            </Row >
        );
    }
}
const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(NotifyUser);

