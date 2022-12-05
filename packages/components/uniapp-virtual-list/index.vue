<template>
    <view>{{ text }}</view>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: 'Hello',
    }
  },
};
</script>