import * as _ from 'lodash';
import axios from 'util/Api';
import { message } from 'antd';

const CrudService = {
    removeDocument: function (options, cb) {
        axios.post('admin/remove-record', options
        ).then((data) => {
            if (data.code === 'OK') {
                message.success(`${data.message}`);
                cb('success');
            }
            else {
                message.error(`${data.message}`);
                cb('failed');
            }
        }).catch(function (error) {
            if (error.message) {
                message.error(`${error.message}`);
            }
            cb('failed');
        });
    },

    removeFile: function (file) {
        let filePath = [];
        if (_.isString(file)) {
            filePath = [file];
        }
        else if (_.isArray(file)) {
            //do nothing
        }
        else if (_.isObject(file) && file.response) {
            filePath = [file.response.data.files[0].absolutePath];
        }
        else if (_.isObject(file) && file.url) {
            filePath = [file.url];
        }
        return axios
            .post('delete-file', { paths: filePath })
            .then((data) => {
                if (data.code === 'OK') {
                    message.success(data.message);
                }
            }).catch(function (error) {
                message.error(`${error.message}`);
            });
    },

    resetPassword: function (options, cb) {
        axios.post('admin/user/reset-password', options
        ).then((data) => {
            if (data.code === 'OK') {
                message.success(`${data.message}`);
                cb(data);
            }
            else {
                message.error(`${data.message}`);
                cb(data);
            }
        }).catch(function (error) {
            if (error.message) {
                message.error(`${error.message}`);
            }
            cb(error);
        });
    }
};

export default CrudService;
