function Promise(executor) {
  // 添加属性
  this.promiseStatus = "pending";
  this.promiseResult = null;
  // 说明属性
  this.callback = {}; // => {onResolved:()=>{},onRejected:()=>{}}

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
    if (self.callback.onResolved) {
      self.callback.onResolved(value);
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
    if (self.callback.onRejected) {
      self.callback.onRejected(reason);
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
  if (this.promiseStatus === "fulfilled") {
    onResolved(this.promiseResult);
  }
  if (this.promiseStatus === "rejected") {
    onRejected(this.promiseResult);
  }
  if (this.promiseStatus === "pending") {
    this.callback = {
      onResolved: onResolved,
      onRejected: onRejected,
    };
  }
};
