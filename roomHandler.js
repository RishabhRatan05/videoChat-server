const { v4: uuid } = require("uuid")

const rooms = {}
module.exports = roomHandler = (socket, io) => {
  const createRoom = () => {
    const roomId = uuid()
    rooms[roomId] = []
    socket.emit("room-created", { roomId, from: socket.id })
  }
  const joinRoom = ({ roomId, peerId }) => {
    if (typeof peerId == "undefined") {
      peerId = socket.id
    }
    if (!rooms[roomId]) rooms[roomId] = []
    if (rooms[roomId]) {
      if (typeof peerId != "undefined") {
        rooms[roomId].push(peerId)
        socket.join(roomId)
        socket.to(roomId).emit("user-joined", { peerId })
        socket.emit("get-users", {
          roomId,
          participants: rooms[roomId],
        })
      }
    }
    socket.on("disconnect", () => {
      console.log("user left room")
      leaveRoom({ roomId, peerId })
      socket.to(roomId).emit("user-disconnected", peerId)
    })
  }
  const callUser = ({ to, offer }) => {
    socket.to(to).emit("incoming-call", { from: socket.id, offer })
  }

  const callAccept = ({ to, ans }) => {
    socket.to(to).emit("call-accepted", { from: socket.id, ans })
  }
  const disconnectUser = () => {
    io.close()
  }

  const leaveRoom = ({ roomId, peerId }) => {
    if (rooms[roomId])
      rooms[roomId] = rooms[roomId].filter((id) => id != peerId)
  }
  socket.on("disconnect-user", disconnectUser)
  socket.on("create-room", createRoom)
  socket.on("join-room", joinRoom)
  socket.on("user-call", callUser)
  socket.on("call-accepted", callAccept)
}
