<template>
  <scroll-view
    class="care-virtual-list"
    :scroll-y="true"
    :lower-threshold="itemHeight"
    :scroll-top="scrollTop"
    :scroll-into-view="scrollIntoView"
    @scroll="onScroll"
    @scrolltoupper="onScrolltoupper"
    @scrolltolower="onScrolltolower"
    :style="{ height: getScrollHeight }"
  >
    <!-- header -->
    <slot name="header" />
    <view class="care-list-height" :style="{ height: getListHeight }">
      <!-- 列表内容 -->
      <slot />
    </view>
    <!-- footer -->
    <slot name="footer" />
  </scroll-view>
</template>

<script>
import { throttle, binarySearch } from './utils'

// 页面的上下文(this)，由于小程序端无法在data中存储this引用（会抛出异常）
const pageContextMap = new Map()

export default {
  props: {
    /**
     * list数据
     */
    list: {
      type: Array,
      default: () => []
    },

    /**
     * v-model值
     * 当前可视区域内能渲染的 list
     */
    value: {
      type: Array,
      default: () => []
    },

    /**
     * 数据预加载比例
     */
    bufferScale: {
      type: Number,
      default: 1,
      validator: (val) => val >= 0
    },

    /**
     * item预估height值
     */
    itemHeight: {
      type: [Number, String],
      default: 100,
      validator: (val) => val > 0
    },

    /**
     * item中的height是否是动态的
     */
    dynamic: {
      type: Boolean,
      default: false
    },

    /**
     * 每一项之间的间距
     */
    gap: {
      type: Number,
      default: 12
    },

    /**
     * scroll-view 容器 height 值
     */
    height: {
      type: [Number, String],
      default: 300
    }
  },

  data() {
    return {
      /**
       * 缓存 list渲染后的节点信息
       */
      listPosition: [],

      /**
       * 容器名称
       */
      containerSelector: null,

      /**
       * item 选择器名称
       */
      itemSelector: null,

      // 获取容器高度的轮训次数
      pollingCount: 0,

      // 获取容器高度的最大轮训次数
      pollingMaxCount: 20,

      /**
       * 开始下标
       */
      start: 0,

      /**
       * 结束下标
       */
      end: 0,

      /**
       * 容器 height 值
       */
      containerHeight: 0,

      scrollTop: 1,

      scrollIntoView: undefined
    }
  },

  computed: {
    /**
     * 获取 渲染后可显示的数量
     * 像上取整
     */
    getVisibleListCount() {
      return Math.ceil(this.containerHeight / this.itemHeight)
    },

    /**
     * 获取 向上的缓冲数据数量
     */
    getAboveCount() {
      return Math.min(this.start, this.bufferScale * this.getVisibleListCount)
    },

    /**
     * 获取 向下的缓存数据数量
     */
    getBelowCount() {
      return Math.min(
        this.list.length - this.end,
        this.bufferScale * this.getVisibleListCount
      )
    },

    /**
     * 获取 渲染后真实可显示的数据
     */
    getVisibleListData() {
      const start = this.start - this.getAboveCount
      const end = this.end + this.getBelowCount

      return this.list.slice(start, end).map((item, index) => {
        const n = this.start - this.getAboveCount + index

        // 附加每个 item 所在 list 中的索引和style样式字符串
        return {
          ...item,
          _virtualId: n,
          _virtualStyle: this._getItemStyles(n)
        }
      })
    },

    /**
     * 获取 list 全部渲染后所占的总高度
     */
    getListHeight() {
      // dynamic状态，且 list 数据更新后，与节点缓存数据长度不相等
      if (this.dynamic && this.listPosition.length !== 0) {
        return (
          this.listPosition.reduce((sum, cur) => {
            return (typeof sum === 'object' ? sum.height : sum) + cur.height
          }) + 'px'
        )
      }
      return this.list.length * this.itemHeight + 'px'
    },

    /**
     * 获取 scroll-view 容器高度
     */
    getScrollHeight() {
      if (typeof this.height === 'number') {
        return this.height + 'px'
      }
      return this.height
    }
  },

  watch: {
    getVisibleListData(val) {
      // 更新 v-model 数据
      this.$emit('input', val)
    },

    list(newVal) {
      if (newVal.length === 0) {
        this.resetCache()
      }
    }
  },

  updated() {
    // dynamic状态，list数据更新后，与缓存数据长度不相等
    if (this.dynamic && this.list.length !== this.listPosition.length) {
      this._initItemPosition()
    }

    // dynamic状态，更新每个节点的属性值
    this.dynamic &&
      this.$nextTick(() => {
        this._updateItemSize()
      })
  },

  methods: {
    /**
     * @vuese
     * 提供给父组件调用并初始化数据
     * @param {Object} o
     * @param {object} o.pageContext 容器上下文
     * @param {string} o.containerSelector 容器选择器
     * @param {string} o.itemSelector list数据遍历后每个相同的选择器
     */
    initialization({ pageContext, containerSelector, itemSelector }) {
      // this.pageContext = pageContext;
      pageContextMap.set(this, pageContext)
      this.itemSelector = itemSelector
      this.containerSelector = containerSelector
      this._initContainer(containerSelector)
    },

    /**
     * @vuese
     * 提供给父组件调用并改变可视区域列表个数
     */
    changeVisibleList(targetIndex, isStart = false) {
      if (isStart) {
        this.start = 0
        this.end = this.start + this.getVisibleListCount
        this.scrollTop = 0
      } else {
        this.start = targetIndex
        this.end = this.start + this.getVisibleListCount
        this.scrollTop = this.listPosition?.[targetIndex]?.top
      }
      setTimeout(() => {
        // 如果 targetIndex 多次都为同一个，需要每次滚动后都做修改，保证 scrollTop 能正常触发
        this.scrollTop += 0.5
      }, 200)
    },    

    /**
     * 初始化 container 数据
     * @param {string} selector 选择器
     */
    _initContainer(selector) {
      let query = uni.createSelectorQuery()

      query = query.in(pageContextMap.get(this))

      query
        .select(selector)
        .boundingClientRect()
        .exec((data) => {
          // HACK 需要轮训直到取到高度后才赋值
          const height = data[0].height
          if (!height && this.pollingCount <= this.pollingMaxCount) {
            this.pollingCount += 1
            setTimeout(() => {
              this._initContainer(this.containerSelector)
            }, 50)
          } else {
            const defaultHeight = 400 // 没取到值时的默认高度
            this.pollingCount = 0
            this.containerHeight = data[0].height || defaultHeight
            this.end = this.start + this.getVisibleListCount
          }
        })
    },

    /**
     * 初始化获取 item 属性
     * dynamic状态
     */
    _initItemPosition() {
      this.list.forEach((item, i) => {
        // eslint-disable-next-line
        const index = Number(String(item._virtualId).match(/\d+/)[0])
        // eslint-disable-next-line
        const hasIndex = this.listPosition.find((item) => item.index === index)
        const prevItem = this.listPosition[i - 1]
        const curData = this.listPosition[index]

        // 默认数据
        let height = Number(this.itemHeight)
        let top = this.itemHeight * index
        let bottom = this.itemHeight * (index + 1)

        // 缓存 `this.list` 数据变化后一些之前的节点数据
        if (typeof curData !== 'undefined') {
          height = curData.height
          top = curData.top
          bottom = curData.bottom

          // 跳过 索引为0的数据
        } else if (typeof prevItem !== 'undefined') {
          top = prevItem.top + prevItem.height
          bottom = height + top
        }

        const data = { index, height, top, bottom }

        if (typeof hasIndex === 'undefined') {
          this.listPosition.push(data)
        } else {
          this.listPosition[hasIndex] = data
        }
      })
    },

    /**
     * 获取 item 的style
     */
    _getItemStyles(index) {
      const styles = {
        position: 'absolute',
        top: index * this.itemHeight + 'px',
        'min-height': this.itemHeight + 'px'
      }

      if (this.dynamic && typeof this.listPosition[index] !== 'undefined') {
        const prevItem = this.listPosition[index - 1]
        const minHeight = this.listPosition[index].height + 'px'
        const top = (index === 0 ? 0 : prevItem.top + prevItem.height) + 'px'

        styles['min-height'] = minHeight
        styles.top = top
      }

      // 由于 uniapp 不支持在非h5环境使用动态class和style，所有直接转换成style字符串
      return Object.entries(styles)
        .map(([key, value]) => {
          return key + ':' + value
        })
        .join(';')
    },

    /**
     * 初始化 item 高度
     * dynamic状态
     */
    _updateItemSize: throttle(function () {
      return new Promise((resolve) => {
        try {
          let query = uni.createSelectorQuery()

          query = query.in(pageContextMap.get(this))

          query
            .selectAll(this.itemSelector)
            .boundingClientRect()
            // eslint-disable-next-line
            .exec((data) => {
              // eslint-disable-next-line
              if (data[0] === null) return

              // eslint-disable-next-line
              data[0].forEach((node) => {
                const index = Number(node.id.match(/\d+/)[0])
                const { height } = node
                const itemQuote = this.listPosition[index]

                // 避免数据渲染时触发updated钩子，因节点未完全生成导致
                if (typeof itemQuote === 'undefined') return true

                const oldHeight = itemQuote.height
                const dVal = oldHeight - height

                // 当前遍历的item容器尺寸发生变化
                if (dVal) {
                  itemQuote.bottom -= dVal
                  itemQuote.height = height
                  // 此处若节点很多，性能会很差
                  for (let i = index + 1; i < this.listPosition.length; i++) {
                    this.listPosition[i].top = this.listPosition[i - 1].bottom
                    this.listPosition[i].bottom -= dVal
                  }
                }
              })
              resolve()
            })
        } catch (error) {
          // 常报错，但不影响使用 https://developers.weixin.qq.com/community/develop/doc/000e2c57e88f28fb8926fb9fc5b000
          console.log('error: ', error)
        }
      })
    }, 100),

    onScrollReal: throttle(function (e) {
      // 当前滚动高度
      const { scrollTop } = e.detail

      // this.scrollTop = scrollTop
      // console.log('scrollTop: ', scrollTop)

      if (this.dynamic && this.listPosition.length) {
        if (
          scrollTop > this.listPosition[this.start].bottom ||
          scrollTop < this.listPosition[this.start].top
        ) {
          // 可视渲染的开始索引
          this.start = binarySearch(this.listPosition, scrollTop)

          // 可视渲染的结束索引
          this.end = this.start + this.getVisibleListCount
        }
      } else {
        // list的开始下标
        this.start = Math.floor(scrollTop / this.itemHeight)

        // list的结束下标
        this.end = this.start + this.getVisibleListCount
      }
    }, 100),

    /**
     * 监听滚动条
     * @param {Object} e
     */
    onScroll(e) {
      this.onScrollReal(e)
    },

    /**
     * scroll-view滚动到顶部, 派发事件
     * @param {Object} e $event
     */
    onScrolltoupper(e) {
      // scroll-view滚动到顶部, 派发事件
      this.$emit('scrolltoupper', e)
    },

    /**
     * scroll-view滚动到底部, 派发事件
     * @param {Object} e $event
     */
    onScrolltolower(e) {
      // scroll-view滚动到底部, 派发事件
      this.$emit('scrolltolower', e)
    },

    /**
     * 重置缓存数据，需要在其他组件在订阅 scrolltoupper 事件执行完成之后在重置
     */
    resetCache() {
      this.listPosition = []
    }
  }
}
</script>

<style>
.care-virtual-list {
  overflow: scroll;
}
.care-virtual-list .care-list-height {
  position: relative;
  margin-top: 20rpx;
}
</style>
