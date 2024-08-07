const express = require("express")
const dotenv = require("dotenv")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
dotenv.config()

const port = process.env.PORT || 5000

const app = express()
app.use(cors())
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id)
  socket.on("room:join", (data) => {
    let { room } = data
    io.to(room).emit("user:joined", { id: socket.id })
    socket.join(room)
    io.to(socket.id).emit("room:join", data)
  })

  socket.on("user:call", ({ to, offer }) => {
    console.log("to", to)
    io.to(to).emit("incomming:call", { from: socket.id, offer })
  })

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans })
  })

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer)
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer })
  })

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans)
    io.to(to).emit("peer:nego:final", { from: socket.id, ans })
  })
  socket.on("disconnect-user", () => {
    io.close()
  })
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id)
  })
})
// io.on("connection", (socket) => {
//   console.log("user connected")

//   roomHandler(socket, io)
//   socket.on("disconnect", () => {
//     console.log("user disconnected")
//   })
// })

server.listen(port, () => {
  console.log(`serving listening on port ${port}`)
})
