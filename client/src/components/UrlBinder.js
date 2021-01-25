/**
 * Created by BHARGAV on 19/1/19 12:59 PM.
 */

import React                        from 'react';
import PropTypes                    from 'prop-types';
import { Col, Form, Input, Select } from 'antd';
import { REGEX }                    from '../constants/Common';

const _ = require('lodash');

const propTypes = {
    baseForm    : PropTypes.any.isRequired,
    label       : PropTypes.string,
    showLabel   : PropTypes.bool,
    fieldName   : PropTypes.string.isRequired,
    inputWidth  : PropTypes.string,
    initUrl     : PropTypes.string,
    isRequired  : PropTypes.bool,
    reqErrMsg   : PropTypes.string,
    errMsg      : PropTypes.string,
    placeholder : PropTypes.string,
    handleChange: PropTypes.func.isRequired,
    lg          : PropTypes.number,
    md          : PropTypes.number,
    sm          : PropTypes.number,
    xs          : PropTypes.number
};

const defaultProps = {
    label      : 'URL',
    showLabel  : true,
    fieldName  : 'url',
    inputWidth : '100%',
    isRequired : false,
    reqErrMsg  : 'Please enter URL!',
    errMsg     : 'Invalid URL!',
    placeholder: 'Enter URL',
    lg         : 6,
    md         : 6,
    sm         : 8,
    xs         : 24
};

const URL_REGEX = new RegExp(REGEX.URL, 'gi');

class UrlBinder extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            finalUrl: props.initUrl
        };

        this.form = props.baseForm;
    }

    componentDidMount() {
        const {finalUrl} = this.state;
        this.blur({target: {value: finalUrl}});
    }

    setFinalUrl = (value, pfxValue) => {
        const {fieldName} = this.props;
        const prefix      = (pfxValue || this.form.getFieldValue('prefix')) + '://',
              url         = value || this.form.getFieldValue(fieldName);

        this.setState({finalUrl: (prefix + url)},
            () => {
                this.props.handleChange(this.state.finalUrl);
            }
        );
    };

    blur = ({target: {value}}) => {
        if (!value || !value.match(URL_REGEX)) return;

        const urlPartsArr = _.compact(value.split('://')),
              {fieldName} = this.props;
        this.form.setFieldsValue({
            [fieldName]: urlPartsArr[0]
        });

        this.setFinalUrl(urlPartsArr[0]);
        if (urlPartsArr.length === 1) return;

        this.form.setFieldsValue({
            prefix     : urlPartsArr[0],
            [fieldName]: urlPartsArr[1]
        });

        this.setFinalUrl(urlPartsArr[1], urlPartsArr[0]);
    };

    change = ({target: {value}}) => {
        if (!value || !value.match(URL_REGEX)) return;
        this.setFinalUrl(value);
    };

    render() {
        const {
                  baseForm, inputWidth,
                  label, fieldName, reqErrMsg, errMsg, placeholder,
                  showLabel, isRequired, lg, md, sm, xs
              }                   = this.props;
        const {getFieldDecorator} = baseForm;

        const prefixSelector = getFieldDecorator('prefix', {
            initialValue: 'http'
        })(
            <Select style={{width: 80}}
                    onChange={value => { this.setFinalUrl('', value);}}>
                <Select.Option value="http">http</Select.Option>
                <Select.Option value="https">https</Select.Option>
            </Select>
        );

        return (
            <Col lg={lg} md={md} sm={sm} xs={xs}>
                <Form.Item label={showLabel && label}>
                    {getFieldDecorator(fieldName, {
                        rules: [
                            {required: isRequired, message: reqErrMsg},
                            {pattern: URL_REGEX, message: errMsg}
                        ]
                    })(
                        <Input addonBefore={prefixSelector} style={{width: inputWidth}}
                               onChange={this.change}
                               onBlur={this.blur}
                               placeholder={placeholder}
                        />
                    )}
                </Form.Item>
            </Col>
        );
    }
}

UrlBinder.propTypes    = propTypes;
UrlBinder.defaultProps = defaultProps;

export default UrlBinder;