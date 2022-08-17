<script setup>
const { board, boardLayout, playerA, playerB, sync, turns } = useDatabase()

// const currentPlayer = playerA

const move = (oldLocation, newLocation) => {
  board.value[newLocation].player = board.value[oldLocation].player
  board.value[oldLocation].player = 0
  selectedStone.value = null
  // check if new location should give a double stone
  sync()
}


const selectedStone = ref(null)

const select = (key) => {

  // is it your turn?
  if (player)

  // Validate if key is a number
  if (typeof key !== 'number') {
    console.error('selected stone is not a key', key)
    return
  }
  // Check if key exists on board
  if (!(key in board.value)) {
    console.error('key doesnt exist on board', key)
    return
  }

  // Select a stone
  if (typeof selectedStone.value !== 'number' && board.value[key].player) {
    selectedStone.value = key
    console.log('selected: ', key)
    return
  }

  // reset selection
  if (key === selectedStone.value) {
    selectedStone.value = null
    return
  }

  // is new location taken?
  if (board.value[key].player) {
    console.warn('cannot move stone on another stone')
    return
  }

  // check if simple move
  // check if strike move
  move(selectedStone.value, key)
  console.log('TO-DO: ',key)
}

</script>
<template>
  <div class="checkers-board">
    <template v-for="(item, key) in boardLayout" :key="key">
      <div v-if="item" class="checkers-board-item checkers-board-item--dark">
        <span
          :class="[
            'stone',
            `stone-${item.player}`,
            item.location === selectedStone && 'selected'
          ]"
          @click="select(item.location)"
        >{{ item.label }}</span>
      </div>
      <div v-else class="checkers-board-item"></div>
    </template>
  </div>
</template>
<style lang="scss">
.checkers-board {
  height: 1000px;
  width: 1000px;
  background: orange;
  padding: 10px;

  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(10, 1fr);
  &-item {
      background: white;
      border: 1px solid black;
      display: flex;
      align-items: center;
      justify-content: center;
    &--dark {
      background: rgb(74, 38, 19);
      color: rgb(127, 127, 127);
    }
    .stone {
      align-items: center;
      border-radius: 50%;
      display: flex;
      height: 70%;
      justify-content: center;
      width: 70%;
      &-1 {
        background: rgb(30, 35, 20);
        border: 3px solid black;
        color: rgba(255,255,255,0.8);
      }
      &-2 {
        background: rgb(220, 220, 220);
        border: 3px solid white;
        color: rgba(0,0,0,0.6);
      }
      &.selected {
        // -webkit-box-shadow: 5px 5px 5px green;
        // -moz-box-shadow: 5px 5px 5px green;
        box-shadow: 0 0 15px orange;
      }
    }
  }
}
</style>
