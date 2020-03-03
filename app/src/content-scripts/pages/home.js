import lockr from 'lockr'
import xhrFacade from '../_global/facades/xhr-facade'
import swal from '../_global/facades/swal-facade'
import urls from '../_global/consts/urls'
import lockrKeys from '../_global/consts/lockr-keys'
import consts from '../_global/consts/consts'
import apis from '../_global/consts/apis'
import domManipulator from '../_global/common-modules/dom-manipulator'

import reviewRequestsTable from '../../content-scripts/_generated-components/review-requests-table'
import reviewRequestsModal from '../../content-scripts/_generated-components/review-requests-modal'

lockr.prefix = lockrKeys.__prefix__

let HomeModule = (() => {
  let _xhrFacade = xhrFacade(lockr.get(lockrKeys.token))
  let _user = lockr.get(lockrKeys.user)
  let _currentPage = 1
  let _reviewRequestsPending
  let _reviewingRequestRow

  let _addDynamicClickEventListener = (targetSelector, callback) => {
    domManipulator.addDynamicEventListener(document.body, 'click',
      targetSelector, callback)
  }

  let _registerDomEventHandler = () => {
    _addDynamicClickEventListener('.table-review-requests--start-review-button', _openModal)
    _addDynamicClickEventListener('.review-requests-modal--wrapper .modal-background, .review-requests-modal--wrapper .delete', _closeModal)
    _addDynamicClickEventListener('.review-requests-modal--wrapper .review-requests-modal--submit-button', _confirmReview)
    _addDynamicClickEventListener('#tabs--review-requests ul li a', _switchTab)
  }

  let _openModal = e => {
    _reviewingRequestRow = e.target.closest('tr')

    const reviewRequestId = _reviewingRequestRow.querySelector('.table-review-requests--review-request-id').innerText

    const reviewRequest = _reviewRequestsPending.find(r => r._id === reviewRequestId)

    document.querySelector('#review-requests-modal').innerHTML = reviewRequestsModal(reviewRequest)

    document.querySelector('.review-requests-modal--wrapper').classList.toggle('is-active')
  }

  let _closeModal = e => {
    document.querySelector('.review-requests-modal--wrapper').classList.toggle('is-active')
  }

  let _confirmReview = async e => {
    try {
      const reviewRequestId = e.target.dataset.id

      // TODO: Support transaction.
      await _xhrFacade.put(
        `${consts.apiBaseUrl}${apis.reviewResults}`,
        new FormData(document.querySelector('.review-requests-modal--wrapper form'))
      )

      await _xhrFacade.patch(
        `${consts.apiBaseUrl}${apis.reviewRequests}/${reviewRequestId}`, { status: 1 }, false
      )

      _moveRequestToHistory(_reviewingRequestRow)

      swal.toastSuccess(`Your review is saved!`)

      _closeModal()
    } catch (error) {
      swal.toastError('An unexpected error occured! Please try again later.')
    }
  }

  let _switchTab = e => {
    e.target.closest('.tabs').querySelectorAll('ul li').forEach(li => li.classList.remove('is-active'))
    e.target.parentElement.classList.add('is-active')
    document.querySelectorAll('.tabs--review-requests--content').forEach(c => c.classList.add('is-hidden'))
    document.querySelector(e.target.parentElement.dataset.targetselector).classList.remove('is-hidden')
  }

  let _moveRequestToHistory = item => {
    document.querySelector('#tabs-submited-history table tbody').appendChild(item.cloneNode(true))
    item.remove()
  }

  let _renderDynamicContent = () => {
    _renderReviewRequestsTable()
  }

  let _renderReviewRequestsTable = async () => {
    try {
      const reviewRequests = await _xhrFacade.get(`${consts.apiBaseUrl}${apis.reviewRequests}?skip=${(_currentPage - 1) * consts.defaultLimit}&limit=${consts.defaultLimit}`)

      _reviewRequestsPending = reviewRequests.reviewRequests.filter(r => r.status == 0)
      let reviewRequestsHistory = reviewRequests.reviewRequests.filter(r => r.status == 1)

      document.querySelector('#tabs-review-requests')
        .innerHTML = reviewRequestsTable({ reviewRequests: _reviewRequestsPending, defaultLimit: consts.defaultLimit, currentPage: _currentPage })

      document.querySelector('#tabs-submited-history')
        .innerHTML = reviewRequestsTable({ reviewRequests: reviewRequestsHistory, defaultLimit: consts.defaultLimit, currentPage: _currentPage })
    } catch (error) {
      swal.toastError('An unexpected error occured! Please try again later.')
    }
  }

  return {
    init: () => {
      _renderDynamicContent()
      _registerDomEventHandler()
    }
  }
})()

window.location.pathname === urls.home && HomeModule.init()
