const dotEnv = require("dotenv");
const connectDB = require("./config/db");
const { Server } = require("socket.io");

dotEnv.config();

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION shuting down 💥");
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require("./app");

connectDB();

const port = process.env.PORT || 8000;

const server = app.listen(port, () =>
  console.log(`Server is running at ${port}`)
);

const io = new Server(server, {
  pingTimeout: 60000, // it will close the connect after timeout to save the bandwidth
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    let chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.off("setup", (userData) => {
    console.log("User Discounted");
    socket.leave(userData?._id);
  });
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION shuting down 💥");
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
