function Promise(executor) {
  // resolve 函数
  function resolve() {}
  // reject 函数
  function reject() {}

  // 同步调用[执行器函数]
  executor(resolve, reject);
}

// 添加 then 方法
Promise.prototype.then = function (onResolved, onRejected) {};
