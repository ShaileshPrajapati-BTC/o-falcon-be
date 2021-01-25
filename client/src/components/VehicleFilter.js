import React               from 'react';
import axios               from 'util/Api';
import { message, Button } from 'antd';

class VehicleFilter extends React.Component {
    state = {
        isLoading: false
    };

    constructor(props) {
        super(props);
        this.state = {
            isoading: false,
            isALctive : props.isActive 
        };
    }

    onClick = () => {
        this.setState({
            isLoading: true
        });
        const self = this;

        axios.post('admin/common/boolean-status-update', {
                id       : this.props.documentId,
                model    : this.props.model,
                fieldName: 'isActive',
                status   : !this.state.isActive
            }
        ).then((data) => {
            console.log('data', data);
            let newValue = this.state.isActive;
            if (data.code === 'OK') {
                message.success(data.message);
                newValue = !this.state.isActive;
            }
            else {
                message.error(data.message);
            }

            self.setState({
                isLoading: false,
                isActive : newValue
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
        console.log('this.state.isActive', this.state.isActive);
        return (
            <Button type={this.state.isActive ? 'primary' : 'danger'}
                    size="small"
                    className="m-b-0"
                    onClick={this.onClick}
                    loading={this.state.isLoading}>
                {this.state.isActive ? 'Active' : 'Deactive'}
            </Button>
        );
    }
}

export default VehicleFilter;
