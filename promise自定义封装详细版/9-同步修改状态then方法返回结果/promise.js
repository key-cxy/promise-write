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

// 添加 then 方法
Promise.prototype.then = function (onResolved, onRejected) {
  return new Promise((resolve, reject) => {
    // fulfilled 状态
    if (this.promiseStatus === "fulfilled") {
      try {
        // 获取回调函数的执行结果
        const result = onResolved(this.promiseResult);
        // 判断
        if (result instanceof Promise) {
          // 如果是promise类型对象
          result.then(
            (value) => resolve(value),
            (reason) => reject(reason)
          );
        } else {
          // 结果对象状态为 [成功]
          resolve(result);
        }
      } catch (error) {
        reject(error);
      }
    }

    // rejected 状态
    if (this.promiseStatus === "rejected") {
      onRejected(this.promiseResult);
    }

    // pending 状态
    if (this.promiseStatus === "pending") {
      // 保存回调函数
      this.callbacks.push({
        onResolved: onResolved,
        onRejected: onRejected,
      });
    }
  });
};
