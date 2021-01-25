/**
 * Created by BHARGAV on 19/1/19 12:59 PM.
 */

import React                      from 'react';
import PropTypes                  from 'prop-types';
import { Col, Form, InputNumber } from 'antd';

const propTypes = {
    baseForm       : PropTypes.any.isRequired,
    label          : PropTypes.string,
    showLabel      : PropTypes.bool,
    fromField      : PropTypes.string,
    toField        : PropTypes.string,
    fromPlaceholder: PropTypes.string,
    toPlaceholder  : PropTypes.string,
    fromErrMsg     : PropTypes.string,
    toErrMsg       : PropTypes.string,
    step           : PropTypes.number,
    precision      : PropTypes.number,
    min            : PropTypes.number,
    max            : PropTypes.number,
    formatter      : PropTypes.func,
    parser         : PropTypes.func,
    handleChange   : PropTypes.func,
    percentage     : PropTypes.bool,
    isRequired     : PropTypes.bool,
    lg             : PropTypes.number,
    md             : PropTypes.number,
    sm             : PropTypes.number,
    xs             : PropTypes.number
};

const defaultProps = {
    label          : 'From-To',
    showLabel      : true,
    fromField      : 'from',
    toField        : 'to',
    fromPlaceholder: 'From',
    toPlaceholder  : 'To',
    precision      : 0,
    step           : 1,
    fromErrMsg     : 'Required!',
    toErrMsg       : 'Required!',
    percentage     : false,
    isRequired     : true,
    lg             : 6,
    md             : 6,
    sm             : 8,
    xs             : 24
};

const CustomLabel = ({label, isRequired}) => {
    return (
        <label className={isRequired ? 'ant-form-item-required' : ''}>
            {label}
        </label>
    );
};


class NumberRange extends React.Component {
    constructor(props) {
        super(props);

        const {min, max, percentage} = props;

        this.state = {
            min: min || (percentage && 0) || -Infinity,
            max: max || (percentage && 100) || Infinity
        };

        this.form = props.baseForm;
    }

    getFormatter = (value) => {
        if (this.props.percentage) return `${value}%`;
        return value;
    };

    getParser = (value) => {
        if (this.props.percentage) return value.replace('%', '');
        return value;
    };

    componentDidMount() {
        const {initVal, fromField, toField} = this.props;
        this.form.setFieldsValue({
            [fromField]: initVal[fromField],
            [toField]  : initVal[toField]
        });
    }

    callBack = (from = null, to = null) => {
        const {fromField, toField, handleChange} = this.props;
        if (handleChange) handleChange({[fromField]: from, [toField]: to});
    };

    onBlur = (event, type = 'from') => {
        event.preventDefault();

        const {fromField, toField} = this.props;

        const from = parseFloat(this.form.getFieldValue(fromField)),
              to   = parseFloat(this.form.getFieldValue(toField));

        if (isNaN(from)) {
            this.callBack();
            this.form.resetFields([toField]);
            return;
        }

        if (type === 'to' && !isNaN(to) && to < from) {
            this.callBack(from || null);
            this.form.resetFields([toField]);
            event.target.focus();
            return;
        }

        if (type === 'to' && !isNaN(from) && isNaN(to)) {
            this.callBack();
            this.form.resetFields([fromField, toField]);
            return;
        }

        if (!isNaN(from) && !isNaN(to) && from > to) {
            this.callBack(from || null);
            this.form.resetFields([toField]);
            return;
        }

        this.callBack(from, to);
    };

    render() {
        const {
                  baseForm, showLabel, label, fromField, fromPlaceholder, toField, toPlaceholder,
                  fromErrMsg, toErrMsg, isRequired, formatter, parser, step, precision,
                  lg, md, sm, xs
              }                   = this.props;
        const {getFieldDecorator} = baseForm;

        const {min, max} = this.state;

        return (
            <Col lg={lg} md={md} sm={sm} xs={xs}>
                <Form.Item label={
                    showLabel && <CustomLabel label={label} isRequired={isRequired} />
                } style={{marginBottom: 0}}>
                    <Form.Item style={{display: 'inline-block'}}>
                        {getFieldDecorator(fromField, {
                            rules: [{required: isRequired, message: fromErrMsg}]
                        })(
                            <InputNumber onBlur={e => this.onBlur(e, 'from')}
                                         min={min} max={max}
                                         step={step}
                                         precision={precision}
                                         formatter={formatter ? formatter : this.getFormatter}
                                         parser={parser ? parser : this.getParser}
                                         placeholder={fromPlaceholder}
                            />
                        )}
                    </Form.Item>

                    <span style={{display: 'inline-block', marginTop: 8, width: 20, textAlign: 'center'}}>-</span>

                    <Form.Item style={{display: 'inline-block'}}>
                        {getFieldDecorator(toField, {
                            rules: [{required: isRequired, message: toErrMsg}]
                        })(
                            <InputNumber onBlur={e => this.onBlur(e, 'to')}
                                         min={min} max={max}
                                         step={step}
                                         precision={precision}
                                         formatter={formatter ? formatter : this.getFormatter}
                                         parser={parser ? parser : this.getParser}
                                         placeholder={toPlaceholder}
                            />
                        )}
                    </Form.Item>
                </Form.Item>
            </Col>
        );
    }
}

NumberRange.propTypes    = propTypes;
NumberRange.defaultProps = defaultProps;

export default NumberRange;