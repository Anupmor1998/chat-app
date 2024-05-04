const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

exports.sendMessage = catchAsync(async (req, res, next) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return next(new AppError("Invalid data passed into request!", 400));
  }

  const newMessage = {
    sender: req.user._id,
    content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate([
      { path: "sender", select: "name pic email" },
      "chat",
    ]);
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    res.status(200).json({
      status: "success",
      data: message,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.allMessages = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({
      chat: chatId,
    })
      .populate("sender", "name pic email")
      .populate("chat");

    res.status(200).json({
      status: "success",
      data: messages,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});
