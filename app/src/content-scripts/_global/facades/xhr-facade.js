import HttpMethods from '../../_global/enums/http-methods'

var XhrFacade = (function () {
  let _jwtToken

  let _toFormData = object => Object.keys(object).reduce((formData, key) => {
    formData.append(key, typeof object[key] === 'object' ? JSON.stringify(object[key]) : object[key])
    return formData
  }, new FormData())

  let _makeXhrRequest = function (method, url, data, isParseJSON = true) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest()
      xhr.open(method, url, true)
      xhr.setRequestHeader('Authorization', `Bearer ${_jwtToken}`)

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          return resolve(isParseJSON ? JSON.parse(xhr.response) : xhr.response)
        } else {
          reject(Error(isParseJSON ? JSON.parse(xhr.response).error : xhr.response))
        }
      }

      xhr.onerror = function () {
        reject(Error(isParseJSON ? JSON.parse(xhr.response).error : xhr.response))
      }

      if (!data) xhr.send()
      else xhr.send(data instanceof FormData ? data : _toFormData(data))
    })
  }

  return jwtToken => {
    _jwtToken = jwtToken

    return {
      get: (url, isParseJSON = true) => _makeXhrRequest(HttpMethods.GET, url, null, isParseJSON),
      post: (url, data, isParseJSON = true) => _makeXhrRequest(HttpMethods.POST, url, data, isParseJSON),
      put: (url, data) => _makeXhrRequest(HttpMethods.PUT, url, data),
      patch: (url, data, isParseJSON = true) => _makeXhrRequest(HttpMethods.PATCH, url, data, isParseJSON),
      delete: (url, data) => _makeXhrRequest(HttpMethods.DELETE, url, data),
      renewToken: newJwtToken => _jwtToken = newJwtToken
    }
  }
})()

export default XhrFacade
