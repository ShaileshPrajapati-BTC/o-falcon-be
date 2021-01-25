import { Button, Icon } from 'antd';
import React, { Component } from 'react';

const ButtonGroup = Button.Group;

class ESPagination extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: props.page || 1,
            totalPage: '',
            current: 1,
            last: '',
            next: false,
            prev: false
        };

    }
    componentDidMount() {
        const { limit, total } = this.props;
        let {  page } = this.state;
        let totalPages = Math.ceil(total / limit);
        if (total === 0) {
            this.setState({ current: 0 });
        }
        if (page !== 1) {
            let current = ((page - 1) * limit) + 1;
            let last = page * limit;
            this.setState({ current: current, last: last });
        }
        if (total < limit) {
            this.setState({
                last: total,
                totalPage: totalPages,
                next: true,
                prev: true
            });
        } else {
            if (page === 1) {
                this.setState({ last: limit });
            }
            this.setState({
                totalPage: totalPages
            });
        }
    }

    onPage = (value) => {
        const { limit, total } = this.props;
        if (value === 'L') {
            if (this.state.current === 1 || this.state.current === 0) {
                return this.setState({ prev: true });
            }
            let number;
            if (this.state.page !== 1) {
                number = this.state.page - 1;
            }
            if (this.state.last === total) {
                let dif = (total + 1) - this.state.current;
                let last = total - dif;
                let page = this.state.current - limit;
                this.setState({
                    current: page,
                    last: last,
                    next: false,
                    page: number
                });

                return this.props.fetch(number);
            }
            let page = this.state.current - limit;
            let last = this.state.last - limit;
            this.setState({
                current: page,
                last: last,
                next: false,
                page: number
            });

            return this.props.fetch(number);
        }
        if (value === 'R') {
            if (this.state.last >= total) {
                return this.setState({ next: true });
            }
            let page = this.state.current + limit;
            let last = this.state.last + limit;
            if (last > total) {
                last = total;
            }
            let number = this.state.page + 1;
            this.setState({
                current: page,
                last: last,
                prev: false,
                page: number
            });

            return this.props.fetch(number);
        }
    }

    render() {
        const { current, last } = this.state;
        const { total } = this.props;

        return (
            <div className="pagination-with-filter">
                <div className="paginationPages">{current} to {last} of {total}</div>
                <ButtonGroup>
                    <Button onClick={() => this.onPage('L')} disabled={this.state.prev}><Icon type="left" /></Button>
                    <Button onClick={() => this.onPage('R')} disabled={this.state.next}><Icon type="right" /></Button>
                </ButtonGroup>

            </div>
        );
    }
}

export default ESPagination;