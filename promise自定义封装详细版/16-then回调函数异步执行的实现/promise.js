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
        setTimeout(() => {
          callbackObj.onResolved(value);
        });
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
        setTimeout(() => {
          callbackObj.onRejected(reason);
        });
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
      setTimeout(() => {
        handle(onResolved);
      });
    }

    // rejected 状态
    if (self.promiseStatus === "rejected") {
      setTimeout(() => {
        handle(onRejected);
      });
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
