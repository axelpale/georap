// Prototype for a georap Component.
//
// A component is an object, that is created like:
//   var comp = new Component(initData, options)
//
// For example, the entry component:
//   var entryView = new EntryView(entryObj)
//
// All components have the following methods:
//   bind($mount)
//     Constructs the component in the given jQuery element $mount and
//     sets up all event handlers and other bindings of the component.
//   unbind()
//     Destroys all bindings and event listeners associated with the Component.
//     Usually this is accompanied with removal of the mount element from DOM.
//
// Additionally, a Component may have some of the following methods:
//   update(initData)
//     Updates the contents of the component according to the initData.
//     Usually this means rendering the full component. If that is too heavy,
//     a more detailed partial rendering of DOM is usually written.
//   reset()
//     Bring the component back to the initial state, without unbinding.
//     Usually updates the DOM.
//   on(eventName, handlerFn)
//   off(eventName, handlerFn)
//   off(eventName)
//   off()
//     Component might emit events if it is an Emitter. Most components are.
//     Event emitting is a method for the parent component to react
//     if something happens inside the Component.
//
// Additionally components can have special methods for the needs of
// the parent component. For example:
//   getAttachmentKeys()
//     Collects keys of uploaded attachments from DOM, so that Entry form
//     can post a change.
//
// Internally, a component has following private variables:
//   $mount
//     the root element (jQuery element)
//   children
//     an object for child components. The children are easier to unbind when
//     collected to this one object.
//   $elems
//     an object for elements often referred in the code or being listened.
//     They are collected here for easy reference and easy un-listening
//     at unbind. For example:
//       $elems.cancel = $mount.find('.cancel-button')
//       $elems.cancel.click(function () { ... })
//   self
//     = this, but works within event handlers and other inner functions.
//
// Template. Almost every component has a template.ejs that is called
// at bind() and sometimes if the component needs to refresh DOM.
//   template.ejs
//
var emitter = require('component-emitter');
var ui = require('georap-ui');
var template = require('./template.ejs');

module.exports = function () {

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({}));

    $elems.btn = $mount.find('.boilerplate-btn');
    $elems.btn.click(function () {
      console.log('Button clicked');
    });
  };

  self.unbind = function () {
    if ($mount) {
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      $mount.empty();
      $mount = null;
    }
  };
};
