# uniapp-virtual-list

虚拟滚动列表，支持以下功能

- 虚拟滚动
- 动态高度
- 每一项可操作


## Usage

1. 在`src/pages.json`中配置`easycom`
```json
"easycom": {
  "^care-(.*)": "@careteen/uniapp-virtual-list/components/uniapp-$1/index.vue"
}
```

2. 在页面中使用组件
```html
<care-virtual-list text="remote" />
```

更多 api 请前往

```shell
# Project setup
yarn install
# Compiles and hot-reloads for development
yarn start

# Compiles and minifies for production
yarn build

# Customize configuration
# See [Configuration Reference](https://cli.vuejs.org/config/).
```
