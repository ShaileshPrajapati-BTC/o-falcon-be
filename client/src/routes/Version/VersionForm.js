import React from 'react';
import { connect } from 'react-redux';
import { Modal, Form, Input, Radio, Checkbox, InputNumber } from 'antd';
import { VERSION_PLATFORM } from '../../constants/Common';

class CollectionVersionFormModal extends React.Component {
    state = {
        fileList: []
    };

    render() {
        const { visible, onCancel, onCreate, isEdit, form } = this.props;
        const { getFieldDecorator } = form;
        // let apkPath = form.getFieldValue('apk_path');
        let name = this.props.form.getFieldValue('name');
        let number = this.props.form.getFieldValue('number');
        let platform = this.props.form.getFieldValue('platform');
        return (
            <Modal
                visible={visible}
                title={isEdit ? 'Edit Version' : 'Add Version'}
                okText={isEdit ? 'Update' : 'Add'}
                onCancel={onCancel}
                onOk={onCreate}>
                <Form layout='vertical'>
                    <Form.Item className={name && 'required-green'} label='Version Name'>
                        {getFieldDecorator('name', {
                            rules: [{ required: true, message: 'Please add version name!' }]
                        })(<Input placeholder='Version Name' />)}
                    </Form.Item>
                    <Form.Item className={number && 'required-green'} label='Version Number'>
                        {getFieldDecorator('number', {
                            rules: [{ type: 'number', required: true, message: 'Please add version number' }]
                        })(<InputNumber min={1} max={10} placeholder='Version Number' style={{ width: '100%' }} />)}
                    </Form.Item>
                    <Form.Item>
                        <Form.Item label='Platform' className={(platform && 'required-green inlineRow') || 'inlineRow'}>
                            {getFieldDecorator('platform', {
                                rules: [{ required: true, message: 'Please select platform' }]
                            })(
                                <Radio.Group onChange={this.onChange}>
                                    <Radio value={VERSION_PLATFORM.ANDROID}>Android</Radio>
                                    <Radio value={VERSION_PLATFORM.IPHONE}>IPhone</Radio>
                                </Radio.Group>
                            )}
                        </Form.Item>
                        <Form.Item className='inlineRow' style={{ marginTop: '25px' }}>
                            {getFieldDecorator('isHardUpdate', {
                                valuePropName: 'checked',
                                rules: [{ required: false }]
                            })(<Checkbox>Hard Update</Checkbox>)}
                        </Form.Item>
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

const WrappedVersionFormModal = Form.create({ name: 'versionForm' })(CollectionVersionFormModal);
const mapStateToProps = function(props) {
    return props;
};
export default connect(mapStateToProps)(WrappedVersionFormModal);
