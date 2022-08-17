export const useDatabase = () => {
  // type boardPlace = {
  //   label: string,
  //   stone: 'black'|'white',
  //   double: boolean
  // }
  type player = {
    name: string
    // actions: string[]
  }

  const turns = ref(0)

  const playerA = reactive(<player>{
    id: 1,
    name: ''
    // actions: []
  })
  const playerB = reactive(<player>{
    id: 2,
    name: ''
    // actions: []
  })

  const board = ref([])
  const boardAdapter = [
    null, 46, null, 47, null, 48, null, 49, null, 50,
    41, null, 42, null, 43, null, 44, null, 45, null,
    null, 36, null, 37, null, 38, null, 39, null, 40,
    31, null, 32, null, 33, null, 34, null, 35, null,
    null, 26, null, 27, null, 28, null, 29, null, 30,
    21, null, 22, null, 23, null, 24, null, 25, null,
    null, 16, null, 17, null, 18, null, 19, null, 20,
    11, null, 12, null, 13, null, 14, null, 15, null,
    null, 6, null, 7, null, 8, null, 9, null, 10,
    1, null, 2, null, 3, null, 4, null, 5, null,
  ]
  const boardLayout = computed(() => boardAdapter.map((x) => {
    if (typeof x !== 'number') return
    return {
      location: x,
      ...board.value[x]
    }
  }))

  const listening = ref(false)
  if (!listening.value && typeof EventSource !== 'undefined') {
    const events = new EventSource('/api/sync')

    // watch for event streams
    events.onmessage = ({ data }): void => {
      const messageBag = JSON.parse(data)

      // update board
      if (messageBag.board) {
        board.value = messageBag.board

      }

      // update player A name
      if (messageBag.playerA) {
        playerA.name = messageBag.playerA.name
      }

      // update player B name
      if (messageBag.playerB) {
        playerB.name = messageBag.playerB.name
      }
      
      // update turns
      if (messageBag.turns) {
        turns.value = messageBag.turns
      }
      
    }

    listening.value = true
  }

  const sync = () => {
    $fetch('/api/sync', {
      method: 'POST',
      body: {
        board: board.value,
        playerA,
        playerB,
        turns: turns.value,
      }
    })
  }

  return {
    board,
    boardLayout,
    playerA,
    playerB,
    sync,
    turns,
  }
}
