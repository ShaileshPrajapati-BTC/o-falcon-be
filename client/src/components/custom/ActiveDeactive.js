import React from 'react';
import axios from 'util/Api';
import { message, Tooltip } from 'antd';
import IntlMessages from "../../util/IntlMessages";

class ActiveDeactive extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isActive: props.isActive
        };
    }

    onClick = () => {
        this.setState({
            isLoading: true
        });
        const self = this;

        axios.post('admin/common/boolean-status-update', {
            id: this.props.documentId,
            model: this.props.model,
            fieldName: 'isActive',
            status: !this.state.isActive
        }
        ).then((data) => {
            let newValue = this.state.isActive;
            if (data.code === 'OK') {
                message.success(data.message);
                newValue = !this.state.isActive;
                this.props.onSuccess();
            } else {
                message.error(data.message);
                this.props.onSuccess();
            }

            self.setState({
                isLoading: false,
                isActive: newValue
            });
        }).catch(function (error) {
            console.log('Error****:', error.message);
            message.error(error.message);
            self.setState({
                isLoading: false
            });
        });
    };

    render() {
        if (this.props.isDefault && this.state.isActive) {
            return (
                <Tooltip title={<IntlMessages id="app.cantDeactiveTooltip" />}>
                    <a style={{ cursor: 'default' }} className={this.state.isActive ? 'active-btn' : 'deactive-btn'}
                        href="/#" onClick={(e) => {
                            e.preventDefault();
                        }}
                        loading={this.state.isLoading}>
                        <IntlMessages id="app.active" />
                    </a>
                </Tooltip>
            );
        }

        return (
            <Tooltip title={this.state.isActive ?
                <IntlMessages id="app.deactiveTooltip" /> :
                <IntlMessages id="app.activeTooltip" />}>
                <a
                    href="/#" onClick={(e) => {
                        e.preventDefault();
                        this.onClick();
                    }}
                    className={this.state.isActive ? 'active-btn' : 'deactive-btn'}
                    loading={this.state.isLoading}
                    disabled={this.props.isDefault ? this.props.isDefault : false}>
                    {this.state.isActive ? <IntlMessages id="app.active" /> : <IntlMessages id="app.deactive" />}
                </a>
            </Tooltip>
        );
    }
}

export default ActiveDeactive;
