import lockr from 'lockr'
import domManipulator from '../_global/common-modules/dom-manipulator'
import apis from '../_global/consts/apis'
import consts from '../_global/consts/consts'
import xhrFacade from '../_global/facades/xhr-facade'

import lockrKeys from '../_global/consts/lockr-keys'

let _xhrFacade = xhrFacade(lockr.get(lockrKeys.token))

domManipulator.addDynamicEventListener(document.body, 'click', '#button-logout', async () => {
  lockr.rm(lockrKeys.user)
  lockr.rm(lockrKeys.token)

  await _xhrFacade.get(
    `${consts.apiBaseUrl}${apis.logout}`, false
  )

  document.cookie = 'AuthToken= ; expires = Thu, 01 Jan 1970 00:00:00 GMT'

  window.location.replace('/login')
})
