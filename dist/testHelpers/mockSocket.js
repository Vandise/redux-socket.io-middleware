'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(serverEvents, stateEvents) {
    _classCallCheck(this, _class);

    this.emit = _sinon2.default.spy();
    this.lastDispatch = null;
    this.serverEvents = serverEvents;
    this.stateEvents = stateEvents;
  }

  _createClass(_class, [{
    key: 'on',
    value: function on(e, data, dispatch) {
      this.serverEvents.some(function (event) {
        if (event.action === e) {
          event.dispatch(e, data, dispatch);
          return true;
        }
        return false;
      });
      this.lastDispatch = dispatch;
      return dispatch;
    }
  }, {
    key: 'stateEvent',
    value: function stateEvent(e, data, next, action, store) {
      var _this = this;

      this.stateEvents.some(function (event) {
        if (event.action === e) {
          var stateAction = event.dispatch(store, next, action, _this);
          stateAction();
          return true;
        }
        return false;
      });
      this.lastDispatch = store.dispatch;
      return store.dispatch;
    }
  }]);

  return _class;
}();

exports.default = _class;
;