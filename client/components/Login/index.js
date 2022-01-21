var config = georap.config;
var template = require('./template.ejs');
var ui = require('georap-ui');
var emitter = require('component-emitter');
var components = require('georap-components');
var LoginFormComponent = require('./LoginForm');
var ResetFormComponent = require('./ResetForm');

var getColumnClass = function (pageSize) {
  switch (pageSize) {
    case 'full':
      return 'col-md-4 col-sm-6';
    case 'medium':
      return 'col-md-12 col-sm-12';
    case 'half':
      return 'col-md-12 col-sm-12';
    default:
      return 'col-md-12 col-sm-12';
  }
};

module.exports = function (afterLoginUrl) {
  // Parameters:
  //   afterLoginUrl
  //     string, URL to go after successful login
  //

  // Init
  var self = this;
  var $mount = null;
  var $elems = {};
  var children = {};
  emitter(self);

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      title: config.title,
      sizeClass: getColumnClass(config.loginPageSize),
    }));

    $elems.loginFormContainer = $mount.find('.login-form-container');
    children.loginForm = new LoginFormComponent(afterLoginUrl);
    children.loginForm.bind($elems.loginFormContainer);

    var resetForm = new ResetFormComponent();
    children.resetFormOpener = new components.Opener(resetForm);
    children.resetFormOpener.bind({
      $container: $mount.find('.password-reset-container'),
      $button: $mount.find('.password-reset-button'),
    });
  };

  this.unbind = function () {
    if ($mount) {
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      $mount = null;
    }
  };

};
