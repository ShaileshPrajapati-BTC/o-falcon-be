/**
 * Created by BHARGAV on 19/1/19 12:59 PM.
 */

import React from 'react';
import { Badge, Typography } from 'antd';
import { MENU, OVERFLOW_COUNT } from '../constants/Common';
import PropTypes from 'prop-types';

const { Title } = Typography;

const propTypes = { total: PropTypes.number };

const defaultProps = { total: 0 };

class HeaderTitle extends React.Component {
    constructor(props) {
        super(props);

        this.state = { menu: { name: '404' } };
    }

    fetch = () => {
        let currPath = window.location.pathname;

        let menuItems = [];
        MENU.map(menu => (menu) ? menuItems = menuItems.concat(menu) : null);

        let found = menuItems.find(v => v.path === currPath);
        this.setState({
            menu: (found || this.state.menu)
        });
    };

    componentDidMount() { this.fetch(); }

    render() {
        const { menu } = this.state;
        const { total, title } = this.props;

        return (
            <React.Fragment>
                <Title level={4}
                    className="gx-text-capitalize gx-mb-0 gx-d-inline-block">
                    {title ? title : menu.name}
                </Title>
                {
                    total > 0 ? (
                        <Badge
                            count={total}
                            className="gx-ml-1"
                            style={{ backgroundColor: '#000' }}
                            overflowCount={OVERFLOW_COUNT} />
                    ) : null
                }
            </React.Fragment>
        );
    }
}

HeaderTitle.propTypes = propTypes;
HeaderTitle.defaultProps = defaultProps;

export default HeaderTitle;