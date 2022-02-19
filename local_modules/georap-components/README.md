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


## components.Opener

Usage:

    var myComp = new MyComponent(myArg)
    children.opener = new components.Opener(myComp, {
      isOpen: true, // optional, default false
      labelOpen: 'Show less', // optional
      labelClosed: 'Show more' // optional
    })

    children.opener.bind({
      $container: $mount.find('.mycomp-container'),
      $button: $mount.find('.mycomp-opener')
    })

Where `.mycomp-container` is an empty div and `.mycomp-opener` a button.

Listens `cancel` events from the component and closes at the event.
Listens `finish` events from the component and closes at the event.

Bubbles `submit` and `success` events from the component. Does not close.


## components.Remover

Usage:

    children.remover = new components.Remover({
      cancelBtnText: __('cancel'),
      deleteBtnText: __('delete-ok'),
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
