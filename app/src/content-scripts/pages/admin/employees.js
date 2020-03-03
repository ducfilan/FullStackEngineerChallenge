import lockr from 'lockr'
import xhrFacade from '../../_global/facades/xhr-facade'
import swal from '../../_global/facades/swal-facade'
import urls from '../../_global/consts/urls'
import lockrKeys from '../../_global/consts/lockr-keys'
import consts from '../../_global/consts/consts'
import apis from '../../_global/consts/apis'
import domManipulator from '../../_global/common-modules/dom-manipulator'

import employeesTable from '../../../content-scripts/_generated-components/employees-table'
import selectOptions from '../../../content-scripts/_generated-components/select-options'

lockr.prefix = lockrKeys.__prefix__

let AdminEmployeesModule = (() => {
  let _xhrFacade = xhrFacade(lockr.get(lockrKeys.token))
  let _user = lockr.get(lockrKeys.user)
  let _currentPage = 1

  let _addDynamicClickEventListener = (targetSelector, callback) => {
    domManipulator.addDynamicEventListener(document.body, 'click',
      targetSelector, callback)
  }

  let _registerDomEventHandler = () => {
    _addDynamicClickEventListener('.table-employees--button-delete', _deleteEmployee)
    _addDynamicClickEventListener('.table-employees--require-review-button', _openModal)
    _addDynamicClickEventListener('.requiring-review-modal--wrapper .modal-background, .requiring-review-modal--wrapper .delete', _closeModal)
    _addDynamicClickEventListener('.requiring-review-modal--wrapper .requiring-review-modal--submit-button', _requireReview)
    _addDynamicClickEventListener('.pagination-link', _goToNextPage)
  }

  let _deleteEmployee = e => {
    swal.confirmDelete(async () => {
      e.target.closest('tr').remove()
      await _xhrFacade.delete(`${consts.apiBaseUrl}${apis.employees}/${e.target.dataset.id}`)
    })
  }

  let _openModal = e => {
    document.querySelector('.requiring-review-modal--wrapper .modal-card-title b').innerHTML =
      e.target.closest('tr').querySelector('.table-employees--employee-name').innerHTML

    document.querySelector('.requiring-review-modal--wrapper [name=fromEmail]').value =
      e.target.closest('tr').querySelector('.table-employees--employee-email').innerHTML

    document.querySelector('.requiring-review-modal--wrapper').classList.toggle('is-active')
  }

  let _closeModal = e => {
    document.querySelector('.requiring-review-modal--wrapper').classList.toggle('is-active')
  }

  let _requireReview = async e => {
    try {
      const { insertedCount } = await _xhrFacade.put(
        `${consts.apiBaseUrl}${apis.reviewRequests}`,
        new FormData(document.querySelector('.requiring-review-modal--wrapper form'))
      )

      _resetModalContent()

      swal.toastSuccess(`Successfully inserted ${insertedCount} review requests!`)
    } catch (error) {
      swal.toastError('An unexpected error occured! Please try again later.')
    }
  }

  let _resetModalContent = () => {
    document.querySelector('.requiring-review-modal--wrapper [name=fromEmail]').value = ''
    document.querySelector('.requiring-review-modal--wrapper [name=targetEmails]').value = ''
  }

  let _goToNextPage = e => {
    _currentPage = parseInt(e.target.innerText)
    _renderEmployeesTable()
  }

  let _renderDynamicContent = () => {
    _renderEmployeesTable()
    _renderReviewBoardsOptions()
  }

  let _renderEmployeesTable = async () => {
    try {
      const employees = await _xhrFacade.get(`${consts.apiBaseUrl}${apis.employees}?skip=${(_currentPage - 1) * consts.defaultLimit}&limit=${consts.defaultLimit}`)

      document.querySelector('#table-employees')
        .innerHTML = employeesTable({ ...employees, defaultLimit: consts.defaultLimit, currentPage: _currentPage })
    } catch (error) {
      swal.toastError('An unexpected error occured! Please try again later.')
    }
  }

  let _renderReviewBoardsOptions = async () => {
    try {
      const { reviewBoards } = await _xhrFacade.get(`${consts.apiBaseUrl}${apis.reviewBoards}?skip=${(_currentPage - 1) * consts.defaultLimit}&limit=${consts.defaultLimit}`)

      document.querySelector('.requiring-review-modal--review-boards')
        .innerHTML += selectOptions({ options: reviewBoards.map(b => ({ value: b._id, text: b.title })) })
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

if ([urls.admin.default, urls.admin.employees].includes(window.location.pathname)) {
  AdminEmployeesModule.init()
}
