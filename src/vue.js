class Vue {
  constructor(options) {
    //选择器
    this.$el = options.el
    //new 的vue实例
    this.$data = options.data
    this.$methods = options.methods
    //把data中所有的数据都代理到VM上
    this.proxyData(this.$data)
    //把method都代理到VM上
    this.proxyData(this.$methods)
    new Observer(this.$data)
    if (this.$el) {
      new Compile(this.$el, this)

    }
  }
  proxyData(data) {
    for (const key in data) {
      Object.defineProperty(this, key, {
        get() {
          return data[key]
        },
        set(newVal) {
          data[key] = newVal
        }
      })
    }
  }
}