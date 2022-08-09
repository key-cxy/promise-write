function Promise(executor) {
  // 添加属性
  this.promiseStatus = "pending";
  this.promiseResult = null;
  // 说明属性
  this.callbacks = []; // => [{onResolved:()=>{},onRejected:()=>{}},...]

  // 保存实例对象的this
  const self = this;

  // resolve 函数
  function resolve(value) {
    //判断状态
    if (self.promiseStatus !== "pending") return;
    // 1.修改对象状态 promiseStatus --> 'fulfilled'
    self.promiseStatus = "fulfilled";
    // 2.设置对象结果 promiseResult
    self.promiseResult = value;
    // 调用成功的回调函数
    if (self.callbacks.length) {
      self.callbacks.forEach((callbackObj) => {
        callbackObj.onResolved(value);
      });
    }
  }

  // reject 函数
  function reject(reason) {
    //判断状态
    if (self.promiseStatus !== "pending") return;
    // 1.修改对象状态 promiseStatus --> 'rejected'
    self.promiseStatus = "rejected";
    // 2.设置对象结果 promiseResult
    self.promiseResult = reason;
    // 调用失败的回调函数
    if (self.callbacks.length) {
      self.callbacks.forEach((callbackObj) => {
        callbackObj.onRejected(reason);
      });
    }
  }

  try {
    //同步调用『执行器函数』
    executor(resolve, reject);
  } catch (e) {
    //修改 promise 对象状态为『失败』
    reject(e);
  }
}

/*
  为 Promise 指定成功/失败的回调函数
  函数的返回值是一个新的 Promise 对象
*/
Promise.prototype.then = function (onResolved, onRejected) {
  // 向后传递成功的value
  onResolved = typeof onResolved === "function" ? onResolved : (value) => value;
  // 指定默认的失败的回调(实现错误/异常传透的关键点)
  onRejected =
    typeof onRejected === "function"
      ? onRejected
      : (reason) => {
          throw reason;
        };

  const self = this;

  return new Promise((resolve, reject) => {
    // 函数封装
    function handle(callback) {
      /*
        1.如果抛出异常，return的promise就会失败，reason就是error
        2.如果回调函数返回的不是promise,return的promise就会成功，value就是失败的值
        3.如果回调函数返回是promise，return的promise结果就是这个promise的结果
      */
      try {
        //获取回调函数的执行结果
        const result = callback(self.promiseResult);
        // 判断
        if (result instanceof Promise) {
          //如果是 Promise 类型的对象
          result.then(
            (value) => resolve(value),
            (reason) => reject(reason)
          );
        } else {
          //结果的对象状态为『成功』
          resolve(result);
        }
      } catch (error) {
        reject(error);
      }
    }
    // fulfilled 状态
    if (self.promiseStatus === "fulfilled") {
      handle(onResolved);
    }

    // rejected 状态
    if (self.promiseStatus === "rejected") {
      handle(onRejected);
    }

    // pending 状态
    if (self.promiseStatus === "pending") {
      // 保存回调函数
      self.callbacks.push({
        onResolved: function () {
          handle(onResolved);
        },
        onRejected: function () {
          handle(onRejected);
        },
      });
    }
  });
};

Promise.prototype.catch = function (onRejected) {
  return this.then(undefined, onRejected);
};
