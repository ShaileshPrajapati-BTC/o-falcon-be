import axios from 'axios';

import * as _      from 'lodash';
import { message } from 'antd';

export default axios.create({
    baseURL: '/',
    headers: {
        'Content-Type': 'application/json'
    }
});

export const CrudService = {
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
    removeFile    : function (file) {
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
            .post('delete-file', {paths: filePath})
            .then((data) => {
            }).catch(function (error) {
                message.error(`${error.message}`);
            });
    }
};