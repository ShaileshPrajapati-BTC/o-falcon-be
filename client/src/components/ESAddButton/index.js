import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button } from 'antd';
import { ReactComponent as AddButton } from '../../assets/svg/addButton.svg';
const _ = require('lodash');

class CommonButton extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    handelclick = () => {
        this.props.onClick();
    }
    render() {
        const { link, text, auth, pageId, filter } = this.props;
        let menuPermission = auth.authUser.accessPermission;
        let indexes = _.findIndex(menuPermission, { module: Number(pageId) });
        let hasPermission = menuPermission[indexes] && menuPermission[indexes].permissions &&
            menuPermission[indexes].permissions.insert;
        return hasPermission ? (link ?
            <div className="topbarCommonBtn">
                <Link to={{ pathname: link, filter: filter }}>
                    <Button type="primary" >
                        <span>
                            <AddButton />
                        </span>
                        <span>{text}</span>
                    </Button>
                </Link>
            </div>
            : <div className="topbarCommonBtn">
                <Button type="primary" onClick={this.handelclick}>
                    <span>
                        <AddButton />
                    </span>
                    <span>{text}</span>
                </Button>
            </div>) : ''
    }
}
const mapStateToProps = ({ auth }) => {
    return { auth };
};

export default connect(mapStateToProps)(CommonButton);
