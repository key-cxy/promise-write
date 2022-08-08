/**
 * Promise 构造函数
 * @param {*} executor：内部同步执行的函数 (resolve,reject) => {}
 */
function Promise(executor) {}

/*
  为 Promise 指定成功/失败的回调函数
  函数的返回值是一个新的 Promise 对象
*/
Promise.prototype.then = function (onResolved, onReject) {};

/*
  为 promise 指定失败的回调函数
  是 then(null,onRejected)的语法糖
*/
Promise.prototype.catch = function (onRejected) {};

/*
  返回一个指定了成功 value 的 promise 对象
*/
Promise.resolve = function (value) {};

/*
  返回一个指定失败 reason 的 promise 对象
*/
Promise.reject = function (reason) {};

/*
  返回一个 promise，只有 promise 中所有 promise 都成功时，才最终成功，只要一个失败就直接失败
*/
Promise.all = function (promises) {};

/*
  返回一个 promise，一旦某个 promise 解决或拒绝，返回的 promise 就会解决或拒绝
*/
Promise.race = function (promise) {};
