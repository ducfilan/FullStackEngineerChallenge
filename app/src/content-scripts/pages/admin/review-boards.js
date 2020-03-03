import lockr from 'lockr'
import xhrFacade from '../../_global/facades/xhr-facade'
import urls from '../../_global/consts/urls'
import lockrKeys from '../../_global/consts/lockr-keys'
import consts from '../../_global/consts/consts'
import apis from '../../_global/consts/apis'
import domManipulator from '../../_global/common-modules/dom-manipulator'

import reviewBoardsTable from '../../_generated-components/review-boards-table'

lockr.prefix = lockrKeys.__prefix__

let AdminReviewBoardsModule = (() => {
  let _xhrFacade = xhrFacade(lockr.get(lockrKeys.token))
  let _user = lockr.get(lockrKeys.user)
  let _currentPage = 1

  let _addDynamicClickEventListener = (targetSelector, callback) => {
    domManipulator.addDynamicEventListener(document.body, 'click',
      targetSelector, callback)
  }

  let _registerDomEventHandler = () => {
  }

  let _renderDynamicContent = () => {
    _renderReviewBoardsTable()
  }

  let _renderReviewBoardsTable = async () => {
    const reviewBoards = await _xhrFacade.get(`${consts.apiBaseUrl}${apis.reviewBoards}?skip=${(_currentPage - 1) * consts.defaultLimit}&limit=${consts.defaultLimit}`)

    document.querySelector('#table-review-boards')
      .innerHTML = reviewBoardsTable({ ...reviewBoards, defaultLimit: consts.defaultLimit, currentPage: _currentPage })
  }

  return {
    init: () => {
      _renderDynamicContent()
      _registerDomEventHandler()
    }
  }
})()

urls.admin.reviewBoards === window.location.pathname && AdminReviewBoardsModule.init()
