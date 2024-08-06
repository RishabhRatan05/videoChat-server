const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const roomHandler = require("./roomHandler")

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
  console.log("user connected")

  roomHandler(socket, io)
  socket.on("disconnect", () => {
    console.log("user disconnected")
  })
})

app.get("/", (req, res) => {})

server.listen(port, () => {
  console.log(`serving listening on port ${port}`)
})
