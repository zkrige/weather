import axios from 'axios';

export function makeRequest(url, type = 'get', data = {}, params = {}, header = {}) {
    let reqHeader = Object.assign(header, { "Accept": "application/json" });
    if (type === 'get') {
        return axios.get(url, {headers: reqHeader })
            .then((response) => {
                return Promise.resolve(response.data)
            })
            .catch((err) => {
                return Promise.reject(err);
            });
    } else if (type === 'post') {
        return axios.post(url, data, { params: params, headers: reqHeader })
            .then(function (response) {
                return Promise.resolve(response)
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    } else if (type === 'delete') {
        return axios.delete(url, { headers: reqHeader })
            .then((response) => {
                return Promise.resolve(response);
            })
            .catch((err) => {
                return Promise.reject(err);
            });
    } else if (type === 'patch') {
        return axios.patch(url, data, { headers: reqHeader })
            .then((response) => {
                return Promise.resolve(response)
            })
            .catch((err) => {
                return Promise.reject(err);
            });
    }
    else if (type === 'put') {
        return axios.put(url, data, { params: params, headers: reqHeader })
            .then(function (response) {
                return Promise.resolve(response)
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    }
}