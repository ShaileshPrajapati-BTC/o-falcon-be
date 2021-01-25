
import React, { Component } from 'react';
import { Modal, Upload, Button, Icon, message, Row, Spin } from 'antd'
import axios from 'util/Api';
import { FILE_TYPES, DEFAULT_API_ERROR, BASE_URL } from '../../constants/Common';
import IntlMessages from '../../util/IntlMessages';
var _ = require('lodash')
class ImportExport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorList: [],
      temp: {},
      path: '',
      loading: false,
      fileUploadprops: {
        name: 'file',
        listType: 'picture',
        className: 'upload-list-inline',
        fileList: [],
        mutiple: false,
        headers: {
          destination: 'master'
        },
        method: 'post',
        beforeUpload: (file) => {
          return this.validateFile(file, { type: 'xlsx' });
        },
        onChange: (file) => {
          return this.onFileChange();
        },
        customRequest: as => {
          return this.customRequest(as);
        },
        onRemove: () => {
          return this.removeFile();
        }
      }
    }
  }

  customRequest = async (as) => {
    let self = this;
    self.setState({ temp: as.file })
  }
  validateFile = async (file, as) => {
    if (this.state.fileUploadprops.fileList && this.state.fileUploadprops.fileList.length > 0) {
      this.setState(state => {
        state.fileUploadprops.fileList = []
        state.errorList = []
        return state;
      })
    }
    file.isValid = FILE_TYPES[as.type].indexOf(file.type) > -1;
    if (!file.isValid) {
      message.error(<IntlMessages id="app.invalidFileType" />);
      return
    }
    if (file.size / 1024 / 1024 > 5) {
      message.error(<IntlMessages id="app.fileSizeMsg" />);
      return
    }
    await this.setState(state => {
      state.fileUploadprops.fileList = [...state.fileUploadprops.fileList, file]
      return state
    })
    return file.isValid;

  };

  removeFile = async () => {
    this.setState(state => {
      state.fileUploadprops.fileList = []
      state.errorList = []
      return state;
    })
  }

  async onFileChange() {
    let fileList = [...this.state.fileUploadprops.fileList]
    await this.setState(state => {
      state.fileUploadprops.fileList = fileList;
    })
  }
  handleSubmit = async () => {
    let data = new FormData();
    data.append("file", this.state.temp);
    try {
      let response = await axios.post('admin/vehicle/import-vehicle-excel', data);
      if (response.code === 'OK') {
        message.success(`${response.message}`);
        // this.props.form.resetFields();
        this.props.showModal()
      } else {
        await this.setState({ errorList: response.data })
        message.error(`${response.message}`);
      }
    } catch (error) {
      let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
      message.error(errorMsg);
    }
  }
  componentDidMount = () => {
    this.handleDownload();
  }
  handleDownload = async () => {
    this.setState({ loading: true })
    try {
      const response = await axios.get(`admin/vehicle/vehicle-demo-excel`)
      if (response && response.code === 'OK') {
        this.setState({ path: response.data.excelName })
        this.setState({ loading: false })
      } else {
        message.error(response.message)
        this.setState({ loading: false })
      }
    } catch (error) {
      message.error(error.message);
      this.setState({ loading: false })
    }
  }

  render() {
    const { fileList } = this.state.fileUploadprops
    const { errorList, loading } = this.state
    return (
      <Modal
        visible={true}
        title={<IntlMessages id="app.vehicle.importVehicle" />}
        okText={<IntlMessages id="app.submit" />}
        cancelText={<IntlMessages id="app.cancel" />}
        onCancel={this.props.showModal}
        onOk={this.handleSubmit}
        width={550}
        okButtonProps={{ disabled: (fileList.length === 0 || errorList.length > 0) ? true : false }}
      >
        <Spin spinning={loading} delay={100}>
          <Row>
            <div style={{ width: '100%', display: 'inline-block' }}>
              <div style={{ padding: '0px 0px 21px 30%' }}>
                {this.state.path &&
                  <a href={`${BASE_URL}/${this.state.path}`} download><IntlMessages id="app.vehicle.sampleFIle" /></a>
                }
              </div>
              <div style={{ paddingLeft: '30%' }}> <Upload accept=".xlsx" key="file" {...this.state.fileUploadprops}>
                <Button>
                  <Icon type="upload" /><IntlMessages id="app.uploadFile" />
                </Button>
              </Upload></div>
              {this.state.errorList.length > 0 && <h5 style={{ color: 'red', margin: '10px', textAlign: 'center' }}>

                {_.map(this.state.errorList, (err, i) => {
                  return (
                    <> <div>{i + 1}{')'}&nbsp;{err}</div> <br /></>
                  )
                })}
                <IntlMessages id="app.vehicle.uploadAgain" />
              </h5>}
            </div>
          </Row>
        </Spin>
      </Modal>
    );
  }
}

export default ImportExport





