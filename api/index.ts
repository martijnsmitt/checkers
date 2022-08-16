import fs from 'fs'
import express from 'express'
import cors from 'cors'

const logger = process.env.SERVER_LOG ? console.log : (...params) => params // eslint-disable-line no-console
const jsonPath = './database.json'
const app = express()
const welcomeMessage = { log: 'Welcome! Api is running and connected' }
const defaultDatabase = {
  playerA: {
    name: '',
    actions: []
  },
  playerB: {
    name: '',
    actions: []
  },
  board: {
    1: {
      label: 'A1',
      stone: 'white',
      double: false,
    },
    2: {
      label: 'C1',
      stone: 'white',
      double: false,
    },
    3: {
      label: 'E1',
      stone: 'white',
      double: false,
    },
    4: {
      label: 'G1',
      stone: 'white',
      double: false,
    },
    5: {
      label: 'I1',
      stone: 'white',
      double: false,
    },
    6: {
      label: 'B2',
      stone: 'white',
      double: false,
    },
    7: {
      label: 'D2',
      stone: 'white',
      double: false,
    },
    8: {
      label: 'F2',
      stone: 'white',
      double: false,
    },
    9: {
      label: 'H2',
      stone: 'white',
      double: false,
    },
    10: {
      label: 'J2',
      stone: 'white',
      double: false,
    },
    11: {
      label: 'A3',
      stone: 'white',
      double: false,
    },
    12: {
      label: 'C3',
      stone: 'white',
      double: false,
    },
    13: {
      label: 'E3',
      stone: 'white',
      double: false,
    },
    14: {
      label: 'G3',
      stone: 'white',
      double: false,
    },
    15: {
      label: 'I3',
      stone: 'white',
      double: false,
    },
    16: {
      label: 'B4',
      stone: 'white',
      double: false,
    },
    17: {
      label: 'D4',
      stone: 'white',
      double: false,
    },
    18: {
      label: 'F4',
      stone: 'white',
      double: false,
    },
    19: {
      label: 'H4',
      stone: 'white',
      double: false,
    },
    20: {
      label: 'J4',
      stone: 'white',
      double: false,
    },
    21: {
      label: 'A5',
      stone: '',
      double: false,
    },
    22: {
      label: 'C5',
      stone: '',
      double: false,
    },
    23: {
      label: 'E5',
      stone: '',
      double: false,
    },
    24: {
      label: 'G5',
      stone: '',
      double: false,
    },
    25: {
      label: 'I5',
      stone: '',
      double: false,
    },
    26: {
      label: 'B6',
      stone: '',
      double: false,
    },
    27: {
      label: 'D6',
      stone: '',
      double: false,
    },
    28: {
      label: 'F6',
      stone: '',
      double: false,
    },
    29: {
      label: 'H6',
      stone: '',
      double: false,
    },
    30: {
      label: 'J6',
      stone: '',
      double: false,
    },
    31: {
      label: 'A7',
      stone: 'black',
      double: false,
    },
    32: {
      label: 'C7',
      stone: 'black',
      double: false,
    },
    33: {
      label: 'E7',
      stone: 'black',
      double: false,
    },
    34: {
      label: 'G7',
      stone: 'black',
      double: false,
    },
    35: {
      label: 'I7',
      stone: 'black',
      double: false,
    },
    36: {
      label: 'B8',
      stone: 'black',
      double: false,
    },
    37: {
      label: 'D8',
      stone: 'black',
      double: false,
    },
    38: {
      label: 'F8',
      stone: 'black',
      double: false,
    },
    39: {
      label: 'H8',
      stone: 'black',
      double: false,
    },
    40: {
      label: 'J8',
      stone: 'black',
      double: false,
    },
    41: {
      label: 'A9',
      stone: 'black',
      double: false,
    },
    42: {
      label: 'C9',
      stone: 'black',
      double: false,
    },
    43: {
      label: 'E9',
      stone: 'black',
      double: false,
    },
    44: {
      label: 'G9',
      stone: 'black',
      double: false,
    },
    45: {
      label: 'I9',
      stone: 'black',
      double: false,
    },
    46: {
      label: 'B10',
      stone: 'black',
      double: false,
    },
    47: {
      label: 'D10',
      stone: 'black',
      double: false,
    },
    48: {
      label: 'F10',
      stone: 'black',
      double: false,
    },
    49: {
      label: 'H10',
      stone: 'black',
      double: false,
    },
    50: {
      label: 'J10',
      stone: 'black',
      double: false,
    },
  }
}

const readDatabase = ({
  onSuccess = logger,
  onError = logger
}) => {
  fs.access(jsonPath, fs.constants.F_OK, (err) => {
    if (err) {
      onError(err)
      return
    }

    fs.readFile(jsonPath, 'utf8', (err, data) => {
      if (err) {
        logger(err)
        onError(err)
        return
      }
      onSuccess(JSON.parse(data))
    })
  })
}

const writeDatabase = data => fs.writeFile(jsonPath, JSON.stringify(data, null, 2), { flag: 'w+' }, logger)

// Write default database when there is no database present.
let isDatabaseReady = false
if (!isDatabaseReady) {
  readDatabase({
    onError: () => {
      writeDatabase(defaultDatabase)
      isDatabaseReady = true
    },
    onSuccess: () => { isDatabaseReady = true }
  })
}

let clients = []

app.use(cors())
app.use(express.json()) // eslint-disable-line import/no-named-as-default-member
app.use(express.urlencoded({ extended: false })) // eslint-disable-line import/no-named-as-default-member


app.get('/sync', (req, res) => {
  const clientId = Date.now()
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache'
  }

  res.writeHead(200, headers)
  res.write(`data: ${JSON.stringify(welcomeMessage)}\n\n`)

  readDatabase({
    onSuccess: data => res.write(`data: ${JSON.stringify(data)}\n\n`)
  })

  clients.push({
    id: clientId,
    response: res
  })

  req.on('close', () => {
    clients = clients.filter(client => client.id !== clientId)
  })
})

app.post('/sync', (req, res, next) => {
  const newInfo = req.body

  res.json(newInfo)

  clients.forEach(client => client.response.write(`data: ${JSON.stringify(newInfo)}\n\n`))

  writeDatabase(newInfo)

  return next()
})

export default app
