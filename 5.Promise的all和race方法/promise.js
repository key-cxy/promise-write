/**
 * Promise 构造函数
 * @param {*} executor：内部同步执行的函数 (resolve,reject) => {}
 */
function Promise(executor) {
  // 保存this
  const self = this;

  this.promiseStatus = "pending"; // 状态值，初始状态为 pending，成功变为 resolved，失败变为 rejected
  this.PromiseResult = null; // 用来保存成功的 value 或失败 reason 的属性
  this.callbacks = []; // 每个元素结构： {onResolved() {},onRejected() {}}

  function resolve(value) {
    // 当前状态不是 pending，直接结束
    if (self.promiseStatus !== "pending") return;
    // 更新状态
    self.promiseStatus = "resolved";
    // 保存数据
    self.PromiseResult = value;
    // 如果有待执行的 callback 函数，立即执行回调函数 onResolved
    if (self.callbacks.length > 0) {
      self.callbacks.forEach((callbackObj) => {
        // 放入队列中执行所有成功的回调
        setTimeout(() => {
          callbackObj.onResolved(value);
        });
      });
    }
  }

  function reject(reason) {
    // 当前状态不是 pending，直接结束
    if (self.promiseStatus !== "pending") return;
    // 更新状态
    self.promiseStatus = "rejected";
    // 保存数据
    self.PromiseResult = reason;
    // 如果有待执行的 callback 函数，立即执行回调函数 onRejected
    if (self.callbacks.length > 0) {
      self.callbacks.forEach((callbackObj) => {
        // 放入队列中执行所有失败的回调
        setTimeout(() => {
          callbackObj.onRejected(reason);
        });
      });
    }
  }

  try {
    // 立即调用 executor 处理
    executor(resolve, reject);
  } catch (error) {
    // 如果异常，直接失败
    reject(error);
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
    /* 
      调用指定回调函数处理, 根据执行结果, 改变return的promise的状态
    */
    function handle(callback) {
      /*
        1.如果抛出异常，return的promise就会失败，reason就是error
        2.如果回调函数返回的不是promise,return的promise就会成功，value就是失败的值
        3.如果回调函数返回是promise，return的promise结果就是这个promise的结果
      */
      try {
        const result = callback(self.PromiseResult);
        if (result instanceof Promise) {
          result.then(
            // 当result成功时，让return的promise也成功
            (res) => resolve(res),
            // 当result失败时，让return的promise也失败
            (err) => reject(err)
          );
          // result.then(resolve,reject)
        } else {
          resolve(result);
        }
      } catch (error) {
        // 1. 如果抛出异常, return的promise就会失败, reason就是error
        reject(error);
      }
    }

    // 如果当前是resolved状态, 异步执行onResolved并改变return的promise状态
    if (self.promiseStatus === "resolved") {
      setTimeout(() => {
        handle(onResolved);
      });
    }

    // 如果当前是rejected状态, 异步执行onRejected并改变return的promise状态
    if (self.promiseStatus === "rejected") {
      setTimeout(() => {
        handle(onRejected);
      });
    }

    // 当前状态还是pending状态, 将回调函数保存起来
    if (self.promiseStatus === "pending") {
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

/*
  为 promise 指定失败的回调函数
  是 then(null,onRejected)的语法糖
*/
Promise.prototype.catch = function (onRejected) {
  return this.then(undefined, onRejected);
};

/*
  Promise函数对象的resolve方法
  返回一个指定结果的成功的promise
*/
Promise.resolve = function (value) {
  // 返回一个成功/失败的promise
  return new Promise((resolve, reject) => {
    // value是promise
    if (value instanceof Promise) {
      // 使用value的结果作为promise的结果
      value.then(
        (value) => resolve(value),
        (reason) => reject(reason)
      );
    } else {
      // value不是promise  => promise变为成功, 数据是value
      resolve(value);
    }
  });
};

/*
  Promise函数对象的reject方法
  返回一个指定reason的失败的promise
*/
Promise.reject = function (reason) {
  // 返回一个失败的promise
  return new Promise((resolve, reject) => {
    reject(reason);
  });
};

/*
  Promise函数对象的all方法
  返回一个promise, 只有当所有promise都成功时才成功, 否则只要有一个失败的就失败
*/
Promise.all = function (promises) {
  // 用来保存所有成功value的数组
  const result = [];
  // 返回一个新的promise
  return new Promise((resolve, reject) => {
    // 遍历promises获取每个promise的结果
    promises.forEach((p, index) => {
      Promise.resolve(p).then(
        (value) => {
          // p成功, 将成功的value保存result
          result[index] = value;
          // 如果全部成功了, 将return的promise改变成功
          if (promises.length === result.length) {
            resolve(result);
          }
        },
        // 只要一个失败了, return的promise就失败
        (reason) => {
          reject(reason);
        }
      );
    });
  });
};

/*
  返回一个 promise，一旦某个 promise 解决或拒绝，返回的 promise 就会解决或拒绝
*/
Promise.race = function (promise) {
  // 返回一个promise
  return new Promise((resolve, reject) => {
    // 遍历promises获取每个promise的结果
    promises.forEach((p, index) => {
      Promise.resolve(p).then(
        (value) => {
          // 一旦有成功了, 将return变为成功
          resolve(value);
        },
        // 一旦有失败了, 将return变为失败
        (reason) => {
          reject(reason);
        }
      );
    });
  });
};
