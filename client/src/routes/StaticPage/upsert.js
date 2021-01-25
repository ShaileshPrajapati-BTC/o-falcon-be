/* eslint-disable newline-per-chained-call */
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import {
    Col, Form, Input, Modal, Row, message, Select
} from 'antd';
import { ContentState, convertToRaw, EditorState } from 'draft-js';
import {
    DEFAULT_API_ERROR, DEFAULT_LANGUAGE, USER_TYPES, RIDER_LABEL, FRANCHISEE_LABEL, DEALER_LABEL, USER_TYPES_FILTER
} from '../../constants/Common';

import { Editor } from 'react-draft-wysiwyg';
import LanguagesList from '../../components/LanguagesList';
import React from 'react';
import UtilService from '../../services/util';
import axios from 'util/Api';
import { codeConvert } from '../../appRedux/actions/Master';

import { connect } from 'react-redux';

import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import IntlMessages from '../../util/IntlMessages';

const _ = require('lodash');
let UserTypes = USER_TYPES_FILTER;
UserTypes = _.filter(UserTypes, (uType) => { return ![USER_TYPES.SUPER_ADMIN, USER_TYPES.ADMIN, USER_TYPES.SUB_ADMIN, USER_TYPES.STAFF].includes(uType.type) });
// if (UserTypes['FRANCHISEE'] && FRANCHISEE_LABEL.toUpperCase() !== 'FRANCHISEE') {
//     delete Object.assign(UserTypes, { [FRANCHISEE_LABEL.toUpperCase()]: UserTypes['FRANCHISEE'] })['FRANCHISEE'];
// }
// if (UserTypes['RIDER'] && RIDER_LABEL.toUpperCase() !== 'RIDER') {
//     delete Object.assign(UserTypes, { [RIDER_LABEL.toUpperCase()]: UserTypes['RIDER'] })['RIDER'];
// }
// if (UserTypes['DEALER'] && DEALER_LABEL.toUpperCase() !== 'DEALER') {
//     delete Object.assign(UserTypes, { [DEALER_LABEL.toUpperCase()]: UserTypes['DEALER'] })['DEALER'];
// }

class UpsertModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            language: DEFAULT_LANGUAGE,
            fields: ['description'],
            recordData: {},
            editorState: EditorState.createEmpty()
        };
    }

    componentDidMount() {
        if (this.props.id) {
            this.fetch(this.props.id);
        }
    }

    fetch = async (id) => {
        try {
            let response = await axios.get(`admin/static-page/${id}`);
            let recordData = response.data;
            console.log("UpsertModal -> fetch -> recordData", recordData);
            const values = UtilService.getLanguageValues(
                this.state.fields,
                this.state.language,
                recordData.multiLanguageData
            );

            if (values.description) {
                const contentBlock = htmlToDraft(values.description);
                if (contentBlock) {
                    const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                    const editorState = EditorState.createWithContent(contentState);
                    this.setState({ editorState });
                }
            }
            this.setState((state) => {
                state.recordData = recordData;

                return state;
            });
        } catch (error) {
            console.log('Error****:', error.message);
        }
    }

    handleSubmit = async () => {
        let { editorState, recordData } = this.state;
        if (!editorState.getCurrentContent().hasText() ||
            editorState.getCurrentContent().getPlainText().trim() === '') {
            this.setState({ editorState: EditorState.createEmpty() });

            message.error('Please add description!')

            return;
        }
        recordData.description = draftToHtml(convertToRaw(editorState.getCurrentContent()));

        let url = `admin/static-page/add`;
        let method = `post`;
        let { id } = this.state.recordData;
        let obj = UtilService.setFormDataForLanguage(
            this.state.fields,
            this.state.language,
            recordData
        );

        const isValid = UtilService.defaultLanguageDataValidation(this.state.fields, obj);
        if (isValid !== true) {
            message.error(isValid);

            return;
        }

        if (id) {
            url = `admin/static-page/${id}`;
            method = `put`;
        }
        try {
            let response = await axios[method](url, obj);
            if (response.code === 'OK') {
                message.success(`${response.message}`);
                this.props.handleSubmit();
            } else {
                message.error(`${response.message}`);
            }
        } catch (error) {
            let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
            message.error(errorMsg);
        }
    }

    handleLanguageChange = (language) => {
        // multi language field
        const { recordData, editorState } = this.state;
        recordData.description = '';
        if (editorState.getCurrentContent().hasText() ||
            editorState.getCurrentContent().getPlainText().trim() !== '') {
            recordData.description = draftToHtml(convertToRaw(editorState.getCurrentContent()));
        }
        let newRecordData = UtilService.setFormDataForLanguage(
            this.state.fields,
            this.state.language,
            recordData
        );
        recordData.multiLanguageData = newRecordData.multiLanguageData;
        this.setState({ language, recordData });
        const values = UtilService.getLanguageValues(
            this.state.fields,
            language,
            recordData.multiLanguageData
        );

        if (values.description) {
            const contentBlock = htmlToDraft(values.description);
            if (contentBlock) {
                const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                const editorState = EditorState.createWithContent(contentState);
                this.setState({ editorState });
            }
        } else {
            this.setState({ editorState: EditorState.createEmpty() });
        }
    }

    handleCodeChange = (e) => {
        const code = codeConvert(e.target.value);
        this.setState((state) => {
            state.recordData.code = code;
            return state;
        });
    }

    onEditorStateChange = (editorState) => {
        this.setState({
            editorState
        });
    };
    handelTypeSelect = (type) => {
        this.setState((state) => {
            state.recordData.userType = type;
            return state;
        });
    }
    render() {
        const { onCancel, id, form } = this.props;
        const { recordData, editorState } = this.state;
        if (this.props.auth.authUser.type !== USER_TYPES.FRANCHISEE) {
            UserTypes = _.filter(UserTypes, (uType) => { return ![USER_TYPES.DEALER].includes(uType.type) });
        }
        else {
            UserTypes = _.filter(UserTypes, (uType) => { return [USER_TYPES.DEALER].includes(uType.type) });
        }

        return (
            <Modal
                visible={true}
                title={id ? <IntlMessages id="app.staticpage.editPage" /> : <IntlMessages id="app.staticpage.addPage" />}
                okText={id ? <IntlMessages id="app.update" /> : <IntlMessages id="app.add" />}
                onCancel={onCancel}
                onOk={this.handleSubmit.bind(this)}
                width={750}
            >
                <Form layout="vertical">
                    <Row type="flex" justify="start">
                        <Col lg={8} md={8} sm={12} xs={24}>
                            <Form.Item label={<IntlMessages id="app.staticpage.language" />}>
                                <LanguagesList
                                    onSelect={this.handleLanguageChange.bind(this)}
                                    selected={this.state.language}
                                />
                            </Form.Item>
                        </Col>
                        <Col lg={8} md={8} sm={12} xs={24}>
                            <Form.Item label={<IntlMessages id="app.user.codeLabel" />} style={{ paddingLeft: '5px' }}>
                                <Input required
                                    onChange={this.handleCodeChange.bind(this)}
                                    value={this.state.recordData.code}
                                    placeholder="Code"
                                    disabled={id ? true : false} />
                            </Form.Item>
                        </Col>
                        <Col lg={8} md={8} sm={12} xs={24}>
                            <Form.Item label={<IntlMessages id="app.type" />} hasFeedback>
                                <Select placeholder="Select Type" value={this.state.recordData.userType}
                                    onChange={this.handelTypeSelect.bind(this)} disabled={this.props.id}>
                                    {UserTypes.map(val => {
                                        return (
                                            <Select.Option
                                                key={val.value}
                                                value={val.type}
                                            >
                                                {val.label}
                                            </Select.Option>
                                        );
                                    }
                                    )}
                                </Select>

                            </Form.Item>
                        </Col>
                    </Row>
                    <Row type="flex" align="middle" className="gx-mt-4" justify="space-around">
                        <Col span={24}>
                            <Form.Item label={<IntlMessages id="app.description" />} hasFeedback>
                                <Editor
                                    editorStyle={{
                                        width: '100%',
                                        minHeight: 150,
                                        maxHeight: 250,
                                        borderWidth: 1,
                                        borderStyle: 'solid',
                                        borderColor: 'lightgray'
                                    }}
                                    initialContentState={recordData.description}
                                    editorState={editorState}
                                    wrapperClassName="demo-wrapper"
                                    onEditorStateChange={this.onEditorStateChange.bind(this)}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        );
    }
}

const WrappedUpsertModal = Form.create({ name: 'UpsertForm' })(UpsertModal);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedUpsertModal);
