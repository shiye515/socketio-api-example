var path = require('path')
var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var port = process.env.PORT || 3000

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/client.html'))
})
app.get('/1', function (req, res) {
  res.sendFile(path.join(__dirname, '/client.1.html'))
})

http.listen(port, function () {
  console.log('listening on *:' + port)
})

// default namespace
io.on('connection', function (socket) {
  // socket.emit('msg', 'server message')
  console.log(`default connection event:${socket.id}`)
  socket.on('msg', function (msg) {
    console.log('default server received:', msg)
  })
  io.emit('msg', 'default server message')
})

// other namespace
const group0 = ['n0', 'n1', 'n2']
group0.forEach(n => {
  let nsp = io.of('/' + n)
  nsp.on('connection', function (socket) {
    console.log(`${n} connection event:${socket.id}`)

    socket.on('msg', function (msg) {
      console.log(n, ' server received:', msg)
    })
    socket.emit('msg', n + ' server message')

    // broadcast
    socket.on('broadcast', function (msg) {
      // socket.broadcast.emit('msg', `broadcast: ${msg}`)// 向除了发送消息以外的所有本命名空间下的客户端发送通知
      nsp.emit('msg', `broadcast: ${msg}`)// 向所有本命名空间下的客户端发送通知
    })

    // room
    socket.join('room')
    socket.on('room', function (msg) {
      socket.broadcast.to('room').emit('msg', `room: ${msg}`)
      // nsp.to('room').emit('msg', `room: ${msg}`)
    })

    // namespace api
    console.log('namespace.name', nsp.name)
    nsp.clients((error, clients) => {
      if (error) throw error
      console.log('namespace.clients', clients)
    })
  })
})

const group1 = ['n3', 'n4', 'n5', 'n6']
group1.forEach(n => {
  let nsp = io.of('/' + n)
  nsp.on('connection', function (socket) {
    console.log(`${n} connection event:${socket.id}`)
    socket.on('msg', function (msg) {
      console.log(n, ' server received:', msg)
    })
    socket.emit('msg', n + ' server message')
  })
})
