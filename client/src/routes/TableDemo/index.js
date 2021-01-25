import React, { Component } from "react";
import { Row, Input, Button, Dropdown, Icon, Affix } from "antd";
import { Menu } from 'antd';
import { Table, Divider, Tag } from 'antd';
import { ReactComponent as Filter } from '../../assets/svg/filter.svg';
const ButtonGroup = Button.Group;
const { Search } = Input;
const menu = (
  <Menu>
    <Menu.Item key="0" className={'active-selectDropdown'}>
      <a href="/#" onClick={(e)=> e.preventDefault()}>First Name</a>
      <Icon type="check" />
    </Menu.Item>
    <Menu.Item key="1">
      <a href="/#" onClick={(e)=> e.preventDefault()}>Last Name</a>
    </Menu.Item>
    <Menu.Item key="2">
      <a href="/#" onClick={(e)=> e.preventDefault()}>Signup Date</a>
    </Menu.Item>
    <Menu.Item key="3">
      <a href="/#" onClick={(e)=> e.preventDefault()}>Highest Completed Rides</a>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="5" className={'active-selectDropdown'}>
      <a href="/#" onClick={(e)=> e.preventDefault()}>Ascending</a>
      <Icon type="check" />
    </Menu.Item>
    <Menu.Item key="6">
      <a href="/#" onClick={(e)=> e.preventDefault()}>Descending</a>
    </Menu.Item>
  </Menu>
);
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: text => <a href="/#" onClick={(e)=> e.preventDefault()}>{text}</a>,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'Tags',
    key: 'tags',
    dataIndex: 'tags',
    render: tags => (
      <span>
        {tags.map(tag => {
          let color = tag.length > 5 ? 'geekblue' : 'green';
          if (tag === 'loser') {
            color = 'volcano';
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </span>
    ),
  },
  {
    title: 'Action',
    key: 'action',
    render: (text, record) => (
      <span>
        <a href="/#" onClick={(e)=> e.preventDefault()}>Invite {record.name}</a>
        <Divider type="vertical" />
        <a href="/#" onClick={(e)=> e.preventDefault()}>Delete</a>
      </span>
    ),
  },
];
const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
  onSelect: (record, selected, selectedRows) => {
    console.log(record, selected, selectedRows);
  },
  onSelectAll: (selected, selectedRows, changeRows) => {
    console.log(selected, selectedRows, changeRows);
  },
};
const data = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
];
let renderPagination = false;

class TableDemo extends Component {

  render() {

    return (
      <div className="gx-module-box gx-mw-100">
        <Affix offsetTop={1}>
          <div className="gx-module-box-header">
            <Row type="flex" align="middle" justify="space-between">
              <h1 className="pageHeading">Title Table</h1>
              <div className="SearchBarwithBtn">
                <Search placeholder="input search text" style={{ width: 300 }} />
                <div className="topbarCommonBtn">
                  <Button type="primary">
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="13.893" height="13.893"
                        viewBox="0 0 13.893 13.893">
                        <path id="Path_70" data-name="Path 70"
                          d="M46.668,39.144h-5.1V34.025a.925.925,0,0,0-1.849,0v5.1h-5.1a.925.925,0,1,0,0,1.849h5.1v5.1a.925.925,0,1,0,1.849,0v-5.1h5.1a.915.915,0,0,0,.925-.925A.9.9,0,0,0,46.668,39.144Z"
                          transform="translate(-33.7 -33.1)" fill="#047480" />
                      </svg>
                    </span>
                    <span>New Post</span>
                  </Button>
                </div>
              </div>
            </Row>
            <Row type="flex" align="middle" justify="space-between" style={{ marginTop: 20 }}>
              <div className="DropdownWidth">
                <div className="dropdownUis">
                  Browse
                  <Dropdown overlay={menu} trigger={['click']}>
                    <a className="ant-dropdown-link" href="/#" onClick={(e)=> e.preventDefault()}>
                      All Riders <Icon type="down" />
                    </a>
                  </Dropdown>
                </div>
                <div className="dropdownUis">
                  Sort by
                  <Dropdown overlay={menu} trigger={['click']}>
                    <a className="ant-dropdown-link" href="/#" onClick={(e)=> e.preventDefault()}>
                      First Name <Icon type="down" />
                    </a>
                  </Dropdown>
                </div>
              </div>
              <div className="pagination-with-filter">
                <div className="paginationPages">1 to 6 of 6</div>
                <ButtonGroup>
                  <Button><Icon type="left" /></Button>
                  <Button><Icon type="right" /></Button>
                </ButtonGroup>
                <div className="filterIC">
                  <a href="/#" onClick={(e)=> e.preventDefault()}><Filter /></a>
                </div>
              </div>
            </Row>
          </div>
        </Affix>
        <div className="RidersList RiderTableList">
          <Table rowSelection={rowSelection} pagination={renderPagination} columns={columns} dataSource={data} />
        </div>
      </div>
    );
  }
}


export default (TableDemo);