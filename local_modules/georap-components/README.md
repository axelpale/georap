# georap-components

Dynamic UI components for client-side use.

    var components = require('georap-components')

Requirements:
- ES5
- webpack with ejs-loader
- jQuery

## components.Error

Usage:

    children.error = new components.Error()
    children.error.bind($mount.find('.error-container'))
    // Then, on error
    children.error.update(err.message, 'warning')
    // Error resolved
    children.error.close()

Where `.error-container` is an empty div.

## components.Remover

Usage:

    children.remover = new components.Remover({
      cancelBtnText: __('cancel'),
      deleteBtnText: __('yes-delete'),
      infoText: __('delete-info'),
      youSureText: __('are-you-sure')
    })

    children.remover.bind({
      $container: $mount.find('.remover-container'),
      $button: $mount.find('.remover-opener')
    })

    children.remover.on('submit', function () {
      apiCall(params, function (err, result) {
        if (err) {
          children.remover.error(err.message, 'danger')
        }

        children.remover.close()
      })
    })

Where `.remove-container` is an empty div and `.remove-opener` is a button.
