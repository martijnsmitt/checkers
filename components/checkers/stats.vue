<script setup>
  const { board, playerA, playerB, turns } = useDatabase()
  const getPiecesLeft = player => Object.entries(board.value).filter(item => item[1].player === player.id).length || 'unknown'
  const piecesLeftPlayerA = computed(() => getPiecesLeft(playerA))
  const piecesLeftPlayerB = computed(() => getPiecesLeft(playerB))
  const whosTurn = computed(() => turns.value % 2 ? playerB.name : playerA.name)
</script>
<template>
  <div>
    <p>Turns counter: {{ turns }}</p>
    <p> It is {{ whosTurn }} turn to play</p>
    <p>{{ playerA.name }} ({{ playerA.id }}) has {{ piecesLeftPlayerA }} pieces left</p>
    <p>{{ playerB.name }} ({{ playerB.id }}) has {{ piecesLeftPlayerB }} pieces left</p>
  </div>
</template>