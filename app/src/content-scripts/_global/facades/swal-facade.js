import Swal from 'sweetalert2'

const Toast = Swal.mixin({
  toast: true,
  position: 'top',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  onOpen: toast => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})


export default {
  toastError: message => {
    Toast.fire({
      icon: 'error',
      title: message
    })
  },
  toastSuccess: message => {
    Toast.fire({
      icon: 'success',
      title: message
    })
  },
  confirmDelete: callback => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.value) {
        callback()
      }
    })
  }
}
