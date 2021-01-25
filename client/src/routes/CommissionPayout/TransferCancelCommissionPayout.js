import React from 'react';
import axios from 'util/Api';
import { message, Tooltip } from 'antd';
class TransferCancelCommissionPayout extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isPending: props.isPending
        };
    }

    onClick = () => {
        this.setState({
            isLoading: true
        });
        const self = this;

        // axios.post('admin/common/boolean-status-update', {
        //     id: this.props.documentId,
        //     model: this.props.model,
        //     fieldName: 'isPending',
        //     status: !this.state.isPending
        // }
        // ).then((data) => {
        //     let newValue = this.state.isPending;
        //     if (data.code === 'OK') {
        //         message.success(data.message);
        //         newValue = !this.state.isPending;
        //         this.props.onSuccess();
        //     } else {
        //         message.error(data.message);
        //         this.props.onSuccess();
        //     }

        //     self.setState({
        //         isLoading: false,
        //         isPending: newValue
        //     });
        // }).catch(function (error) {
        //     console.log('Error****:', error.message);
        //     message.error(error.message);
        //     self.setState({
        //         isLoading: false
        //     });
        // });
    };

    render() {
        const { isPending } = this.state;

        return (
            <Tooltip title={isPending ? "Please click here to Cancel" : "Please click here to Transfer"}>
                <a className={isPending ? 'active-btn' : 'deactive-btn'}
                    onClick={this.onClick}
                    loading={this.state.isLoading}
                    disabled={this.props.isDefault ? this.props.isDefault : false}>
                    {isPending ? 'Transfer' : 'Cancel'}
                </a>
            </Tooltip>
        );
    }
}

export default TransferCancelCommissionPayout;
