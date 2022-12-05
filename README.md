# uniapp-components
## Usage

0. 安装组件
```shell
yarn add @careteen/uniapp-components
```

1. 在`src/pages.json`中配置`easycom`
```json
"easycom": {
  "^care-(.*)": "@careteen/uniapp-components/components/uniapp-$1/index.vue"
}
```

2. 在页面中使用组件
```html
<care-virtual-list text="remote" />
```

### 组件列表

| 名称 | 组件 | 备注 |
| :--- | :-------- | ----:|
| 虚拟滚动列表 | [uniapp-virtual-list](./docs/components/index[src.components.uniapp-virtual-list].md)  | 支持 1.虚拟滚动 2.动态高度 3.每一项可操作

## 贡献指南

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
