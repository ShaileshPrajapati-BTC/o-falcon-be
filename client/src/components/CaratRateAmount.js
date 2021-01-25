/**
 * Created by BHARGAV on 19/1/19 12:59 PM.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Col, Form, InputNumber } from 'antd';

const propTypes = {
    baseForm: PropTypes.any.isRequired,
    operator: PropTypes.string,
    caratLabel: PropTypes.string,
    caratField: PropTypes.string,
    caratDecimal: PropTypes.number,
    caratPlaceholder: PropTypes.string,
    rateLabel: PropTypes.string,
    rateField: PropTypes.string,
    rateDecimal: PropTypes.number,
    ratePlaceholder: PropTypes.string,
    amountLabel: PropTypes.string,
    amountField: PropTypes.string,
    amountDecimal: PropTypes.number,
    amountPlaceholder: PropTypes.string,
    showLabel: PropTypes.bool,
    isRequired: PropTypes.bool,
    inputWidth: PropTypes.string,
    lg: PropTypes.number,
    md: PropTypes.number,
    sm: PropTypes.number,
    xs: PropTypes.number
};

const defaultProps = {
    operator: '*',
    caratLabel: 'Carat',
    caratField: 'carat',
    caratPlaceholder: 'Enter Carat',
    caratDecimal: 2,
    caratErrMsg: 'Carat is required!',
    rateLabel: 'Rate',
    rateField: 'rate',
    ratePlaceholder: 'Enter Rate',
    rateDecimal: 2,
    rateErrMsg: 'Rate is required!',
    amountLabel: 'Amount',
    amountField: 'amount',
    amountPlaceholder: 'Enter Amount',
    amountDecimal: 2,
    amountErrMsg: 'Amount is required!',
    showLabel: true,
    isRequired: false,
    inputWidth: '100%',
    lg: 6,
    md: 6,
    sm: 8,
    xs: 24
};

class CaratRateAmount extends React.Component {
    constructor(props) {
        super(props);

        let inverseOp = null;
        switch (props.operator) {
            case '+':
                inverseOp = '-';
                break;
            case '-':
                inverseOp = '+';
                break;
            case '*':
                inverseOp = '/';
                break;
            case '/':
                inverseOp = '*';
                break;
            default:
                inverseOp = null;
        }

        this.state = { inverseOp: inverseOp };

        this.form = props.baseForm;
    }

    calcValue = (value, field, inverse = false) => {
        const fieldVal = parseFloat(this.form.getFieldValue(field));
        value = parseFloat(value);

        const fieldName = this.props[!inverse ? 'amountField' : 'rateField'];
        this.form.setFieldsValue({ [fieldName]: null });
        if (isNaN(fieldVal) || isNaN(value)) return;

        const op = !inverse ? this.props.operator : this.state.inverseOp;
        if (op === '/' && value === 0) return;

        let resValue;
        // if (inverse) resValue = eval(value + op + fieldVal) || 0;
        // else resValue = eval(fieldVal + op + value) || 0;
        if (inverse) resValue = (value + op + fieldVal) || 0;
        else resValue = (fieldVal + op + value) || 0;

        this.form.setFieldsValue({ [fieldName]: resValue });
    };

    render() {
        const {
            baseForm, inputWidth,
            caratLabel, caratField, caratDecimal, caratErrMsg, caratPlaceholder,
            rateLabel, rateField, rateDecimal, rateErrMsg, ratePlaceholder,
            amountLabel, amountField, amountDecimal, amountErrMsg, amountPlaceholder,
            showLabel, isRequired, lg, md, sm, xs
        } = this.props;
        const { getFieldDecorator } = baseForm;

        return (
            <React.Fragment>
                <Col lg={lg} md={md} sm={sm} xs={xs}>
                    <Form.Item label={showLabel && caratLabel}>
                        {getFieldDecorator(caratField, {
                            rules: [{ required: isRequired, message: caratErrMsg }]
                        })(
                            <InputNumber style={{ width: inputWidth }}
                                precision={caratDecimal}
                                onChange={value => this.calcValue(value, rateField)}
                                placeholder={caratPlaceholder}
                            />
                        )}
                    </Form.Item>
                </Col>

                <Col lg={lg} md={md} sm={sm} xs={xs}>
                    <Form.Item label={showLabel && rateLabel}>
                        {getFieldDecorator(rateField, {
                            rules: [{ required: isRequired, message: rateErrMsg }]
                        })(
                            <InputNumber style={{ width: inputWidth }}
                                precision={rateDecimal}
                                onChange={value => this.calcValue(value, caratField)}
                                placeholder={ratePlaceholder}
                            />
                        )}
                    </Form.Item>
                </Col>

                <Col lg={lg} md={md} sm={sm} xs={xs}>
                    <Form.Item label={showLabel && amountLabel}>
                        {getFieldDecorator(amountField, {
                            rules: [{ required: isRequired, message: amountErrMsg }]
                        })(
                            <InputNumber style={{ width: inputWidth }}
                                precision={amountDecimal}
                                onChange={value => this.calcValue(value, caratField, true)}
                                placeholder={amountPlaceholder}
                            />
                        )}
                    </Form.Item>
                </Col>
            </React.Fragment>
        );
    }
}

CaratRateAmount.propTypes = propTypes;
CaratRateAmount.defaultProps = defaultProps;

export default CaratRateAmount;