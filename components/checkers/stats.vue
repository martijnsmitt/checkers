<script setup>
  const { board, playerA, playerB, turns } = useDatabase()
  const getPiecesLeft = player => Object.entries(board.value).filter(item => item[1].player === player.id).length || 'unknown'
  const piecesLeftPlayerA = computed(() => getPiecesLeft(playerA))
  const piecesLeftPlayerB = computed(() => getPiecesLeft(playerB))
  const whosTurn = computed(() => turns.value % 2 ? `${playerB.name} (white)` : `${playerA.name} (black)`)
</script>
<template>
  <pre>
    It is <b>{{ whosTurn }}</b> turn to play
    {{ playerA.name }} (black) has {{ piecesLeftPlayerA }}/20 pieces left
    {{ playerB.name }} (white) has {{ piecesLeftPlayerB }}/20 pieces left
  </pre>
</template>