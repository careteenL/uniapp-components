<template>
	<view class="content">
		<view>
			<virtual-list text="hello" />
			<virtual-list text="uniapp" />
			<care-virtual-list text="remote" />
		</view>
	</view>
</template>

<script>
	import VirtualList from '../../components/uniapp-virtual-list'

	export default {
		data() {
			return {
				title: 'Hello'
			}
		},
		components: {
			VirtualList
		},
		onLoad() {

		},
		methods: {

		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin: 200rpx auto 50rpx auto;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
