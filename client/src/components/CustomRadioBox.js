/**
 * Created by BHARGAV on 19/1/19 12:59 PM.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Col, Form, Radio, Row } from 'antd';

const RadioGroup = Radio.Group;
const _ = require('lodash');

const propTypes = {
    baseForm: PropTypes.any.isRequired,
    list: PropTypes.array.isRequired,
    label: PropTypes.string,
    showLabel: PropTypes.bool,
    fieldName: PropTypes.string,
    optionKey: PropTypes.string.isRequired,
    optionValue: PropTypes.string.isRequired,
    optionLabel: PropTypes.string.isRequired,
    disableKey: PropTypes.string,
    btnStyle: PropTypes.bool,
    width: PropTypes.string,
    showActions: PropTypes.bool,
    isRequired: PropTypes.bool,
    errMsg: PropTypes.string,
    handleChange: PropTypes.func,
    rowType: PropTypes.string,
    colSpan: PropTypes.number,
    lg: PropTypes.number,
    md: PropTypes.number,
    sm: PropTypes.number,
    xs: PropTypes.number
};

const defaultProps = {
    list: [],
    label: 'Default',
    showLabel: true,
    btnStyle: false,
    fieldName: 'select',
    width: '100%',
    selected: [],
    isRequired: false,
    showActions: true,
    errMsg: 'Please select value!',
    rowType: 'flex',
    colSpan: 4,
    lg: 6,
    md: 6,
    sm: 8,
    xs: 24
};

const CustomLabel = ({ label, actions, parent }) => {
    return (
        <React.Fragment>
            <span>{label}</span>
            {
                actions ? (
                    <a className="gx-ml-2"
                        href="/#" onClick={(e) => {
                            e.preventDefault();
                            parent.handleClick();
                        }}>Clear</a>
                ) : null
            }
        </React.Fragment>
    );
};

class CustomRadioBox extends React.Component {
    constructor(props) {
        super(props);

        const {
            baseForm, list, optionLabel
        } = this.props;
        let sortedList = _.sortBy(list, optionLabel);

        this.state = {
            sortedList: sortedList
        };

        this.form = baseForm;
    }

    componentDidMount() {
        const {
            fieldName, selected
        } = this.props;

        this.form.setFieldsValue({ [fieldName]: selected });
    }

    handleClick = () => {
        let { fieldName } = this.props;
        this.form.setFieldsValue({ [fieldName]: null });
        this.props.handleChange();
    };

    render() {
        const {
            baseForm, lg, md, sm, xs, showLabel, label, fieldName, optionKey, optionValue, optionLabel,
            isRequired, width, errMsg, showActions, rowType, colSpan, handleChange, btnStyle, disableKey
        } = this.props;
        const { getFieldDecorator } = baseForm;
        const { sortedList } = this.state;

        return (
            <Col lg={lg} md={md} sm={sm} xs={xs}>
                <Form.Item label={
                    showLabel &&
                    ((showActions && <CustomLabel label={label} actions={showActions} parent={this} />) ||
                        label)
                }>
                    {getFieldDecorator(fieldName, {
                        rules: [{ required: isRequired, message: errMsg }]
                    })(
                        <RadioGroup
                            style={{ width: width }}
                            onChange={({ target: { value } }) => { handleChange(value); }}>
                            {
                                btnStyle ?
                                    sortedList.map(v => {
                                        return (
                                            <Radio.Button
                                                key={v[optionKey]}
                                                value={v[optionValue]}
                                                disabled={v[disableKey]}>
                                                {v[optionLabel]}
                                            </Radio.Button>
                                        );
                                    }) : (
                                        <Row type={rowType}>
                                            {
                                                sortedList.map(v => {
                                                    return (
                                                        <Col span={colSpan}
                                                            key={v[optionKey]}>
                                                            <Radio
                                                                value={v[optionValue]}
                                                                disabled={v[disableKey]}>
                                                                {v[optionLabel]}
                                                            </Radio>
                                                        </Col>
                                                    );
                                                })
                                            }
                                        </Row>
                                    )
                            }
                        </RadioGroup>
                    )}
                </Form.Item>
            </Col>
        );
    }
}

CustomRadioBox.propTypes = propTypes;
CustomRadioBox.defaultProps = defaultProps;

export default CustomRadioBox;