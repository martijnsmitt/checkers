<script setup>
const { board, boardLayout, playerA, playerB, sync, turns } = useDatabase()

const currentPlayer = playerA

const finishTurn = () => {
  // @TO-DO: check if new location should give a double stone
  turns.value++
  sync()
}

const move = (oldLocation, newLocation) => {
  board.value[newLocation].player = board.value[oldLocation].player
  board.value[oldLocation].player = 0
  selectedStone.value = null
}

const remove = (location) => board.value[location].player = 0

const isSimpleMove = (key) => {

  // All types = +5 || -5
  // Type A not first = +4 || -6
  // Type B not last = -4 || +6

  // console.log({
  //   selected: key,
  //   column: (key % 5 || 5),
  //   row: Math.ceil((key) / 5),
  //   typeA: Math.ceil((key) / 5) % 2
  // })

  const old = selectedStone.value

  if (key === (old + 5) || key === (old - 5)) {
    return true
  }

  // begins with brown
  if (Math.ceil((old) / 5) % 2) {
    // not first
    if (old % 5 !== 1 && (key === (old + 4) || key === (old - 6))) {
      return true
    }
  } else {
    // not last
    if (old % 5 !== 0 && (key === (old + 6) || key === (old - 4))) {
      return true
    }
  }
  return false
}

// Area's on board with different rules
// -----------------
// | A |   B   | C |
// -----------------
// |   |       |   |
// | D |   E   | F |
// |   |       |   |
// -----------------
// | G |   H   | I |
// -----------------
const getArea = (key, row, column) => {
  if (row >= 9) {
    if (column === 1) {
      return 'A'
    } else if (column <= 4) {
      return 'B'
    } else {
      return 'C'
    }
  } else if (row >= 3) {
    if (column === 1) {
      return 'D'
    } else if (column <= 4) {
      return 'E'
    } else {
      return 'F'
    }
  } else {
    if (column === 1) {
      return 'G'
    } else if (column <= 4) {
      return 'H'
    } else {
      return 'I'
    }
  }
}

const testAttack = (key, attacking, dest) => {
  // within reach of board
  if (dest > 50 || dest <= 0) return

  // is destination free
  if (board.value[dest].player) return

  // are you attacking anyone
  if (!board.value[attacking].player) return

  // are you attacking yourself
  if (board.value[attacking].player === board.value[key].player) return

  // you must attack!
  return { key, attacking, dest }
}

const attackTopLeft = (key, type) => testAttack(key, key + (type ? 4 : 5), key + 9)
const attackTopRight = (key, type) => testAttack(key, key + (type ? 5 : 6), key + 11)
const attackBottomRight = (key, type) => testAttack(key, key - (type ? 5 : 4), key - 9)
const attackBottomLeft = (key, type) => testAttack(key, key - (type ? 6 : 5), key - 11)

const possibleAttacks = (key) => {
  const column = (key % 5 || 5)
  const row = Math.ceil((key) / 5)
  const type = row % 2

  switch(getArea(key, row, column)) {
    case 'A':
      return [ attackBottomRight(key, type) ]
    case 'B':
      return [ attackBottomRight(key, type), attackBottomLeft(key, type) ]
    case 'C':
      return [ attackBottomLeft(key, type) ]
    case 'D':
      return [ attackTopRight(key, type), attackBottomRight(key, type) ]
    case 'E':
      return [ attackTopLeft(key, type), attackTopRight(key, type), attackBottomRight(key, type), attackBottomLeft(key, type) ]
    case 'F':
      return [ attackTopLeft(key, type), attackBottomLeft(key, type) ]
    case 'G':
      return [ attackTopRight(key, type) ]
    case 'H':
      return [ attackTopLeft(key, type), attackTopRight(key, type) ]
    case 'I':
      return [ attackTopLeft(key, type) ]
  }
  console.error(`switch with area's should be triggered`)
  return 
}

const selectedStone = ref(null)

const select = (key) => {
  // is it your turn?
  // if (player)

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
  if (typeof selectedStone.value !== 'number'){
    if (board.value[key].player) {
      selectedStone.value = key
      console.log('selected: ', key)
    } else {
      console.warn('select a stone first')
    }
    return
  }

  // reset selection
  if (key === selectedStone.value) {
    selectedStone.value = null
    return
  }

  // should the player attack
  const attack = possibleAttacks(selectedStone.value).filter(e => e)
  if (attack.length) {
    console.log({ attack })
    const isAttacking = attack.filter(a => a.dest === key)[0]
    if (!isAttacking) {
      console.warn('Player must attack!')
      return
    }
    console.log({isAttacking})
    move(selectedStone.value, key)
    remove(isAttacking.attacking)
    return finishTurn()
  }

  // is new location taken?
  if (board.value[key].player) {
    console.warn('cannot move stone on another stone')
    return
  }

  // check if simple move
  if (isSimpleMove(key)) {
    move(selectedStone.value, key)
    return finishTurn()
  }

  console.log('@TO-DO: catch this step?: ',key)
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
        >{{ item.location }}</span>
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
