import { Icon, message } from 'antd';
import React from 'react';
import axios from 'util/Api';
class IsDefault extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isDefault: props.isDefault
        };
    }

    onClick = () => {
        this.setState({
            isLoading: true
        });
        const self = this;
        if (this.props.isActive) {
            axios.post('/admin/common/isdefault', {
                id: this.props.documentId,
                model: this.props.model,
                fieldName: 'isDefault',
                status: !this.props.isDefault,
                filter: this.props.filterBy
            }).then((data) => {
                let newValue = this.state.isDefault;
                if (data.code === 'OK') {
                    message.success(data.message);
                    newValue = !this.state.isDefault;
                    this.props.onSuccess();
                } else {
                    message.error(data.message);
                    this.props.onSuccess();
                }
                self.setState({
                    isLoading: false,
                    isDefault: newValue
                });
            })
                .catch((error) => {
                    console.log('Error****:', error.message);
                    message.error(error.message);
                    self.setState({
                        isLoading: false
                    });
                });
        }
    }
    render() {
        return (

            <a href="/#"
                onClick={(e) => {
                    e.preventDefault();
                    this.onClick();
                }}
                type={this.state.isDefault ? 'primary' : 'danger'}
                loading={this.state.isLoading}
                disabled={!this.props.isActive || this.state.isDefault}
            >
                {this.state.isDefault ? <Icon
                    style={{ color: '#088004', fontSize: '20px' }}
                    type="check-circle"
                /> :
                    <Icon
                        style={{ color: '#f05050', fontSize: '20px' }}
                        type="close-circle"
                    />
                }
            </a>
        );
    }
}

export default IsDefault;
