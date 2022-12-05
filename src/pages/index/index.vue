<template>
  <view :class="pageClass">
		<view class="title">动态高度- {{ mockDataLen }}条数据</view>

    <care-virtual-list
      ref="virtualList"
      v-model="visibleList"
      height="calc(100vh - 100px - 80rpx)"
      item-height="70"
      :list="list"
      :dynamic="true"
      @scrolltoupper="onScrolltoupper"
      @scrolltolower="onScrolltolower"
    >
      <!-- header slot -->
      <template #header>
        <view v-if="loadingStatus.upper">上拉刷新中...</view>
      </template>

      <!-- default slot -->
      <template>
        <view
          v-for="item in visibleList"
          :key="item.id"
          :id="'item-virtual-' + item._virtualId"
          :class="itemClass"
          :style="item._virtualStyle"
          @click="onClickItem(list, String(item._virtualId))"
        >
          <view class="content" :style="{ backgroundColor: item.bg }">
            <view v-for="n in item.random" :key="n">{{ item.title }}</view>
          </view>
        </view>
      </template>

      <!-- footer slot -->
      <template #footer>
        <view v-if="loadingStatus.lower">下拉加载中...</view>
      </template>
    </care-virtual-list>

    <view class="skip" @click="handleSkip">点击跳转至60</view>
  </view>
</template>

<script>
// import VirtualList from '../../components/uniapp-virtual-list'
import { random } from '../../components/uniapp-virtual-list/utils'

export default {
  name: 'PageDynamic',

  components: {
    // VirtualList
  },

  data() {
    return {
      pageClass: 'page-dynamic',
      itemClass: 'item-virtual',
			mockDataLen: 3000,
      list: [],
      visibleList: [],
      resetCount: 0,
      loadingStatus: {
        upper: false,
        lower: false
      }
    }
  },

  created() {
		uni.showLoading({
			title: '加载中...',
			mask: true
		})
    setTimeout(() => {
      this._mockListData()
			uni.hideLoading()
    }, 1500)
  },

  mounted() {
    this.$refs.virtualList.initialization({
      pageContext: this,
      containerSelector: '.' + this.pageClass,
      itemSelector: '.' + this.itemClass
    })
  },

  methods: {
    /**
     * 点击 item 事件
     * @param {Object[]} list 数据列表
     * @param {number} index 当前的数据索引
     */
    onClickItem(list, index) {
      const item = list[index]
      const { title } = item
      const titleList = title.split('-')

      titleList[3] || (titleList[3] = 0)
      titleList[3]++

      item.title = titleList.join('-')
    },

    /**
     * 监听 滚动到顶部，重置并加载新数据
     */
    onScrolltoupper() {
      if (this.loadingStatus.upper) return

      console.log('--- onScrolltoupper start ---')
      this.loadingStatus.upper = true

      setTimeout(() => {
        this.list = []
        this.resetCount++
        this._mockListData()
        this.$refs.virtualList.resetCache()
        this.loadingStatus.upper = false

        console.log('--- onScrolltoupper end ---')
      }, 2000)
    },

    /**
     * 监听 滚动到底部，加载数据
     */
    onScrolltolower() {
      if (this.loadingStatus.lower) return

      console.log('--- onScrolltolower start ---')
      this.loadingStatus.lower = true

      setTimeout(() => {
        this._mockListData()
        this.loadingStatus.lower = false

        console.log('--- onScrolltolower end ---')
      }, 2000)
    },
    /**
     * 模拟 list 数据
     */
    _mockListData() {
      const tempList = []

      for (let i = 0; i < this.mockDataLen; i++) {
        const n = i + this.list.length

        tempList.push({
          _virtualId: n,
          title: '可点击递增：list-' + this.resetCount + '-' + Number(n + 1),
          random: Array(random(1, 3)),
          bg: this._getRandomBgColor()
        })
      }

      this.list = [].concat(this.list, tempList)
    },

    /**
     * 获取 随机糖果色
     * 通过闭包来处理私有变量
     */
    _getRandomBgColor: (() => {
      let index = 0

      return function () {
        const colorList = [
          'rgba(65, 176, 126, 1)',
          'rgba(65, 176, 126, 0.8)',
          'rgba(65, 176, 126, 0.6)',
          'rgba(65, 176, 126, 0.4)',
          'rgba(65, 176, 126, 0.2)'
        ]

        const val = colorList[index]
        ++index === colorList.length && (index = 0)

        return val
      }
    })(),

    handleSkip() {
      // 模拟跳转
      const targetIndex = 60
      this.$refs.virtualList.changeVisibleList(targetIndex)
    }
  }
}
</script>

<style>
.title {
	font-size: 38rpx;
	text-align: center;
	line-height: 50rpx;
}
.skip {
	font-size: 30rpx;
	text-align: center;
	line-height: 40rpx;	
}
.page-dynamic {

}
.page-dynamic .care-virtual-list {
	margin-top: 20rpx;
}
</style>
