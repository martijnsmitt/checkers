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

const testAttack = (key, attacking, dest) => {
  // within reach of board
  if (dest > 50 || dest <= 0) return

  // is destination free
  if (board.value[dest].player) return

  // are you attacking anyone
  if (!board.value[attacking].player) return

  // are you attacking yourself
  if (board.value[attacking].player === board.value[key].player) return

  // if else you must attack!
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

  if (row >= 9) {
    if (column === 1) {
      possibilities = [ attackBottomRight(key, type) ]
    } else if (column <= 4) {
      possibilities = [ attackBottomRight(key, type), attackBottomLeft(key, type) ]
    } else {
      possibilities = [ attackBottomLeft(key, type) ]
    }
  } else if (row >= 3) {
    if (column === 1) {
      possibilities = [ attackTopRight(key, type), attackBottomRight(key, type) ]
    } else if (column <= 4) {
      possibilities = [ attackTopLeft(key, type), attackTopRight(key, type), attackBottomRight(key, type), attackBottomLeft(key, type) ]
    } else {
      possibilities = [ attackTopLeft(key, type), attackBottomLeft(key, type) ]
    }
  } else {
    if (column === 1) {
      possibilities = [ attackTopRight(key, type) ]
    } else if (column <= 4) {
      possibilities = [ attackTopLeft(key, type), attackTopRight(key, type) ]
    } else {
      possibilities = [ attackTopLeft(key, type) ]
    }
  }

  return possibilities.filter(e => e)
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

  // should the player attack
  const attack = possibleAttacks(selectedStone.value)

  if (attack.length) {
    const isAttacking = attack.filter(a => a.dest === key)[0]
    
    if (!isAttacking) return feedback.value = 'You must attack!'

    move(selectedStone.value, key)
    remove(isAttacking.attacking)
    // return without finishing turn, because more options are available
    if (possibleAttacks(key).length) return
    // else finish turn
    return finishTurn()
  }

  // is there a stone that is able to attack
  const allPossibleAttacks = ref([])
  Object.entries(board.value).filter(item => item[1].player === whosTurn.value).forEach(item => {
    
    allPossibleAttacks.value.push(...possibleAttacks(parseInt(item[0])))
  })


  if (allPossibleAttacks.value.length) return feedback.value = 'You must attack'

  // one direction permitted
  if (whosTurn.value === 1 ? key > selectedStone.value : key < selectedStone.value) return feedback.value = `you're going into the wrong direction`

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
