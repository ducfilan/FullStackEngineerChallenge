import lockr from 'lockr'
import domManipulator from '../_global/common-modules/dom-manipulator'
import xhrFacade from '../_global/facades/xhr-facade'
import swalFacade from '../_global/facades/swal-facade'
import urls from '../_global/consts/urls'
import lockrKeys from '../_global/consts/lockr-keys'

lockr.prefix = lockrKeys.__prefix__

let LoginModule = (() => {
  let _xhrFacade = xhrFacade(lockr.get(lockrKeys.token))
  let _user = lockr.get(lockrKeys.user)

  let _addDynamicClickEventListener = (targetSelector, callback) => {
    domManipulator.addDynamicEventListener(document.body, 'click',
      targetSelector, callback)
  }

  let _registerDomEventHandler = () => {
    _addDynamicClickEventListener('.login-form--login-button', _login)
  }

  let _login = async e => {
    try {
      e.preventDefault()

      const email = e.target.closest('form').querySelector('.login-form--email').value
      const password = e.target.closest('form').querySelector('.login-form--password').value

      const user = await _xhrFacade.post(urls.login, { email, password })
      lockr.set(lockrKeys.user, user)
      lockr.set(lockrKeys.token, user.jwtToken)

      window.location.replace('/')
    } catch (error) {
      lockr.rm(lockrKeys.user)
      lockr.rm(lockrKeys.token)

      swalFacade.toastError(error.message)
    }
  }

  return {
    init: () => {
      _registerDomEventHandler()
    }
  }
})()

window.location.pathname === urls.login && LoginModule.init()
