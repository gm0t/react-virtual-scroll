if (typeof(Object.assign) === 'function'){
  module.exports = Object.assign;
} else {
  module.exports = function assign(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
}
