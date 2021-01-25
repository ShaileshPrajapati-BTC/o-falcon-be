import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Button, Card, Col, Row, Upload, message } from 'antd';
import React, { Component } from 'react';
import Auxiliary from 'util/Auxiliary';
import ChartCard from 'components/dashboard/Crypto/ChartCard';
import IsDefault from '../../components/custom/IsDefault';
import ActiveDeactive from '../../components/custom/ActiveDeactive';
import DrawingView from './DrawingView';
import ESPagination from '../../components/ESPagination';
import FilterDropdown from '../../components/FilterDropdown';
import MapPopupInfo from '../../components/MapPopupInfo';
import { RIDER_LABEL } from '../../constants/Setup';
console.log(process.env);


class SamplePage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            fileUploadProcess: false,
            fileData: ''

        };
        let self = this;
        this.fileUploadProp = {
            name: 'file',
            action: '/excel-file',
            showUploadList: false,
            loading: false,

            onChange(info) {
                console.log('info', info);
                self.setState({
                    fileUploadProcess: true
                });

                if (info.file.status === 'done') {
                    let record = info.file.response.data;
                    console.log('record', record);
                    message.success(`${info.file.name} file uploaded successfully`);

                    self.setState({
                        fileData: record,
                        fileUploadProcess: false
                    });

                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`);
                    self.setState({
                        fileUploadProcess: false
                    });
                }
            }

        };
    }
    fetch = (page) => {
        console.log('Paginate      :', page);
    }

    handleSelection = (value, ascending) => {
        console.log(' Sample page handle selection! ', value, ascending);
    }
    render() {

        return (
            <div className="m-r-15">
                <ActiveDeactive />
                <IsDefault />
                <Upload {...this.fileUploadProp}>
                    <Button loading={this.state.fileUploadProcess} icon="upload" size="small" type="default" shape="round">
                        Upload
                  </Button>
                </Upload>

                <Auxiliary>
                    <Row>.
                      <Col xl={6} lg={12} md={12} sm={12} xs={24}>
                            <ChartCard prize="$9,626" title="23" icon="bitcoin"
                                children={<ResponsiveContainer width="100%" height={75}>

                                    <AreaChart data={this.state.fileData}
                                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                        <Tooltip />
                                        <defs>
                                            <linearGradient id="color3" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="5%" stopColor="#163469" stopOpacity={0.9} />
                                                <stop offset="95%" stopColor="#FE9E15" stopOpacity={0.9} />
                                            </linearGradient>
                                        </defs>
                                        <Area dataKey="B" strokeWidth={0} stackId="2" stroke="#4D95F3" fill="url(#color3)"
                                            fillOpacity={1} />
                                    </AreaChart>
                                </ResponsiveContainer>}
                                styleName="up" desc="B" />
                        </Col>

                    </Row>
                </Auxiliary>
                <div>
                    <FilterDropdown
                        title1="Browse"
                        title2={`All ${RIDER_LABEL}`}
                        list={[{ label: 'FirstName', value: 1 }, { label: 'LastName', value: 2 }, { label: `${RIDER_LABEL} detail`, value: 3 }]}
                        sorter={false}
                        handleSelection={this.handleSelection}
                    />
                    <ESPagination limit={20} total={21} fetch={this.fetch} />
                </div>
                <div>
                    <MapPopupInfo />
                </div>

                <Card style={{ marginBottom: '100px' }}>
                    <DrawingView />
                </Card>


            </div>
        );
    }
}


export default SamplePage;
