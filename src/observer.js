/**
 * 用于给data中所有的数据都加上getter和setter方法 
 * */
class Observer {
  constructor(data) {
    this.walk(data)
  }
  walk(data) {
    // 要对这个data数据将原有的属性改为 get 和 set 的形式
    if (!data || typeof (data) !== 'object') {
      return
    }
    // 要将数据一一劫持 先获取到data的key和value
    Object.keys(data).forEach(key => {
      // 劫持
      this.defineReactive(data, key, data[key])
      this.walk(data[key]); // 深度递归劫持
    });
  }
  // 定义响应式,data中的每一个数据都应该维护一个dep对象，dep保存了所有的订阅者
  defineReactive(obj, key, value) {
    let that = this;
    let dep = new Dep();
    Object.defineProperty(obj, key, {
      enumerable: true, // 可枚举
      configurable: true,
      get() {
        // 当取值时调用的方法
        // console.log('你获取了值');
        Dep.target && dep.addSub(Dep.target);
        return value;
      },
      set(newVal) {
        // 当给data属性中设置值的时候 更改获取属性的值
        if (newVal != value) {
          that.walk(newVal); // 如果是对象继续劫持
          value = newVal;
          dep.notify(); // 通知所有人数据更新了
          // window.Wathcer.update()
        }
      }
    });
  }
}