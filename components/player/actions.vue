<script setup>
const { reset } = useDatabase()
</script>
<template>
  <div>
    <button @click="reset()">RESET game</button>
  </div>
</template>