<script setup>
const { board, boardLayout, playerA, playerB, sync, turns } = useDatabase()

const feedback = ref(null)

const whosTurn = computed(() => turns.value % 2 ? playerB.id : playerA.id)

const finishTurn = () => {
  // @TO-DO: check if new location should give a double stone
  turns.value++
  feedback.value = null
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
  let possibilities = []

  switch(getArea(key, row, column)) {
    case 'A':
      possibilities = [ attackBottomRight(key, type) ]
      break;
    case 'B':
      possibilities = [ attackBottomRight(key, type), attackBottomLeft(key, type) ]
      break;
    case 'C':
      possibilities = [ attackBottomLeft(key, type) ]
      break;
    case 'D':
      possibilities = [ attackTopRight(key, type), attackBottomRight(key, type) ]
      break;
    case 'E':
      possibilities = [ attackTopLeft(key, type), attackTopRight(key, type), attackBottomRight(key, type), attackBottomLeft(key, type) ]
      break;
    case 'F':
      possibilities = [ attackTopLeft(key, type), attackBottomLeft(key, type) ]
      break;
    case 'G':
      possibilities = [ attackTopRight(key, type) ]
      break;
    case 'H':
      possibilities = [ attackTopLeft(key, type), attackTopRight(key, type) ]
      break;
    case 'I':
      possibilities = [ attackTopLeft(key, type) ]
      break;
  }

  return possibilities.filter(e => e && (whosTurn.value === 1 ? e.dest < e.key : e.dest > e.key))
}

const selectedStone = ref(null)

const select = (key) => {
  // Validate if key is a number
  if (typeof key !== 'number') return console.error('selected stone is not a key', key)

  // Check if key exists on board
  if (!(key in board.value)) return console.error('key doesnt exist on board', key)

  // Select a stone
  if (typeof selectedStone.value !== 'number'){
    if (!board.value[key].player) return feedback.value = 'first select a stone'
    if (whosTurn.value !== board.value[key].player) return feedback.value = 'wait for the opponent to take a move'

    return selectedStone.value = key
  }

  // reset selection
  if (key === selectedStone.value) return selectedStone.value = null

  // change selection
  if (board.value[key].player === whosTurn.value) return selectedStone.value = key

  // one direction permitted
  if (whosTurn.value === 1 ? key > selectedStone.value : key < selectedStone.value) return feedback.value = `you're going into the wrong direction`

  // should the player attack
  const attack = possibleAttacks(selectedStone.value)

  if (attack.length) {
    const isAttacking = attack.filter(a => a.dest === key)[0]
    
    if (!isAttacking) return feedback.value = 'You must attack!'

    move(selectedStone.value, key)
    remove(isAttacking.attacking)
    // return without finishing turn, because more options are available
    if (possibleAttacks(selectedStone.value).length) return
    // else finish turn
    return finishTurn()
  }

  // is new location taken?
  if (board.value[key].player) return feedback.value = 'cannot move a stone on top of another stone'

  // check if simple move
  if (isSimpleMove(key)) {
    move(selectedStone.value, key)
    return finishTurn()
  }

  console.log('@TO-DO: catch this step?: ',key)
}

</script>
<template>
  <div>
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
          ></span>
        </div>
        <div v-else class="checkers-board-item"></div>
      </template>
    </div>
    <pre v-if="feedback" class="feedback-box">Feedback; {{ feedback }}</pre>
  </div>
</template>
<style lang="scss">

.feedback-box {
  color: darkred;
  font-size: 2em;
  padding: 1em;
}

.checkers-board {
  height: 90vh;
  width: 90vh;
  max-height: 90vw;
  max-width: 90vw;
  background: rgb(58, 29, 13);
  padding: 5vh;
  border-radius: 11px;

  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(10, 1fr);
  &-item {
      background: white;
      border: 1px solid rgb(58, 29, 13);
      display: flex;
      align-items: center;
      justify-content: center;
    &--dark {
      background: #984f28;
      color: rgba(127, 127, 127, 0.207);
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
        background-image: linear-gradient(to top right, rgb(30, 35, 20), rgb(62, 65, 55));
        border: 3px solid black;
        color: rgba(255,255,255,0.15);
      }
      &-2 {
        background: rgb(220, 220, 220);

        background-image: linear-gradient(to top right, rgb(210, 201, 201), rgb(220, 220, 220));
        border: 3px solid white;
        color: rgba(0,0,0,0.1);
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
