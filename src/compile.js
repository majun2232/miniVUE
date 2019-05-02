/* 
   专门负责解析模板
 */
class Compile {
  constructor(el, vm) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el
    this.vm = vm
    //编译模板
    if (this.el) {
      // 1. 把el中的所有子节点都放入内存中，fragment
      let fragment = this.node2fragment(this.el)
      // 2.在内存中编译fragment
      this.compile(fragment)
      // 3.把fragment 一次性的添加到页面
      this.el.appendChild(fragment)
    }
  }

  /* 核心方法 */
  node2fragment(node) {
    // 将el中的内容放内存中
    let fragment = document.createDocumentFragment()
    let childNodes = node.childNodes
    this.toArray(childNodes).forEach(item => {
      fragment.appendChild(item)
    });
    return fragment
  }
  /**
   * 编译文档碎片
   * @param {*} fragment 
   */
  compile(fragment) {
    // 需要递归
    let childNodes = fragment.childNodes;
    Array.from(childNodes).forEach(node => {
      if (this.isElementNode(node)) {
        // 是元素节点,需要深入递归检查
        // 编译元素
        this.compileElement(node)
        this.compile(node)
      } else {
        // 文本节点
        // 编译文本
        this.compileText(node)
      }
    })
  }
  /* 解析html */
  compileElement(node) {
    // console.log('需要解析html', node);
    let attributes = node.attributes
    this.toArray(attributes).forEach(attr => {
      // console.dir(attr);
      let attrName = attr.name
      if (this.idDirective(attrName)) {
        let type = attrName.slice(2)
        let expr = attr.value
        if (this.isEventDirectiv(type)) {
          CompileUtil['eventHandler'](node, this.vm, type, expr)
        } else {
          CompileUtil[type] && CompileUtil[type](node, this.vm, expr)
        }
      }
    })
  }
  /* 解析text */
  compileText(node) {
    CompileUtil.mustache(node, this.vm)

  }
  /* 工具方法 */
  toArray(likeArray) {
    return [].slice.call(likeArray)
  }
  isElementNode(node) {
    //nodeType:节点的类型  1.元素节点  3.文本节点
    return node.nodeType === 1
  }
  isTextNode(node) {
    //nodeType:节点的类型  1.元素节点  3.文本节点
    return node.nodeType === 3
  }
  // 是不是指令
  idDirective(attrName) {
    return attrName.includes('v-')
  }
  isEventDirectiv(attrName) {
    return attrName.split(":")[0] === 'on'
  }

}

CompileUtil = {
  getVal(vm, expr) {
    // 获取实例上对应的数据
    expr = expr.split('.');
    return expr.reduce((prev, next) => {
      return prev[next];
    }, vm.$data)
  },
  setVmValue(vm, expr, value) {
    let data = vm.$data
    expr = expr.split('.');
    // debugger
    expr.forEach((key, index) => {
      //如果index是最后一个
      if (index < expr.length - 1) {
        data = data[key]
      } else {
        data[key] = value
      }
    })
  },
  mustache(node, vm) {
    // 带 {{}}
    let txt = node.textContent; // 取文本中的内容
    let reg = /\{\{([^}]+)\}\}/g;
    if (reg.test(txt)) {
      let expr = RegExp.$1
      node.textContent = txt.replace(reg, this.getVal(vm, expr));
      new Wathcer(vm, expr, newValue => {
        node.textContent = txt.replace(reg, newValue);
      })
    }
  },

  text(node, vm, expr) {
    // 文本处理
    // console.log(expr);
    //通过watch对象，监听expr的数据变化，一旦变化了，就执行回调函数
    node.textContent = this.getVal(vm, expr)
    new Wathcer(vm, expr, newValue => {
      node.textContent = newValue
    })

  },
  html(node, vm, expr) {
    node.innerHTML = this.getVal(vm, expr)
    new Wathcer(vm, expr, newValue => {
      node.innerHTML = newValue
    })
  },
  model(node, vm, expr) {
    let that = this
    node.value = this.getVal(vm, expr)
    //实现双向绑定，给node注册input事件，当前元素的value值发生改变，修改绑定的值
    node.addEventListener('input', function () {
      that.setVmValue(vm, expr, this.value)
    })

    new Wathcer(vm, expr, newValue => {
      node.value = newValue
    })
  },
  eventHandler(node, vm, type, expr) {
    let eventType = type.split(':')[1]
    let fn = vm.$methods && vm.$methods[expr]
    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm))
    }
  }
}