# uniapp-virtual-list

[Github Demo Source](https://github.com/careteenL/uniapp-components/blob/master/src/pages/index/index.vue)

<br/>

<img src="https://t1.focus-img.cn/dist/image/dist/estate/9b7b49ac16fb00a11f21fb2383edf3a8.GIF" height="500px" />

## Props

<!-- @hjtvuese:index:props:start -->
|Name|Description|Type|Required|Default|
|---|---|---|---|---|
|list|list数据|`Array`|`false`|[]|
|value|v-model值 当前可视区域内能渲染的 list|`Array`|`false`|[]|
|bufferScale|数据预加载比例|`Number`|`false`|1|
|itemHeight|item预估height值|`Number` /  `String`|`false`|100|
|dynamic|item中的height是否是动态的|`Boolean`|`false`|false|
|gap|每一项之间的间距|`Number`|`false`|12|
|height|scroll-view 容器 height 值|`Number` /  `String`|`false`|300|

<!-- @hjtvuese:index:props:end -->


## Events

<!-- @hjtvuese:index:events:start -->
|Event Name|Description|Parameters|
|---|---|---|
|input|更新 v-model 数据|-|
|scrolltoupper|scroll-view滚动到顶部, 派发事件|-|
|scrolltolower|scroll-view滚动到底部, 派发事件|-|

<!-- @hjtvuese:index:events:end -->


## Slots

<!-- @hjtvuese:index:slots:start -->
|Name|Description|Default Slot Content|
|---|---|---|
|header|header|-|
|default|列表内容|-|
|footer|footer|-|

<!-- @hjtvuese:index:slots:end -->


## Methods

<!-- @hjtvuese:index:methods:start -->
|Method|Description|Parameters|
|---|---|---|
|initialization|提供给父组件调用并初始化数据|-|
|changeVisibleList|提供给父组件调用并改变可视区域列表个数|-|

<!-- @hjtvuese:index:methods:end -->


