const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

exports.accessChat = catchAsync(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new AppError("userId param is not sent", 400));
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      {
        users: { $elemMatch: { $eq: req.user._id } },
      },
      {
        users: { $elemMatch: { $eq: userId } },
      },
    ],
  })
    .populate("users")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.status(200).json({
      status: "success",
      data: isChat[0],
    });
  } else {
    const chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);

      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users"
      );

      res.status(200).json({
        status: "success",
        data: fullChat,
      });
    } catch (err) {
      return next(new AppError(err.message, 400));
    }
  }
});

exports.fetchChats = catchAsync(async (req, res, next) => {
  try {
    const chats = await Chat.find({
      users: {
        $elemMatch: {
          $eq: req.user._id,
        },
      },
    })
      .populate("users")
      .populate("groupAdmin")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const result = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.createGroupChat = catchAsync(async (req, res, next) => {
  const { users, name } = req.body;

  if (!users || !name) {
    return next(new AppError("please fill all the fields!", 400));
  }

  const userArr = JSON.parse(users);

  if (userArr.length < 2) {
    return next(
      new AppError(
        "More than 2 users are required to form the group chat!",
        400
      )
    );
  }

  userArr.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: name,
      isGroupChat: true,
      users: userArr,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users")
      .populate("groupAdmin");

    res.status(200).json({
      status: "success",
      data: fullGroupChat,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.renameGroup = catchAsync(async (req, res, next) => {
  const { chatId, chatName } = req.body;

  if (!chatId || !chatName) {
    return next(new AppError("please send all the required fields", 400));
  }

  const updatedGroup = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName,
    },
    {
      new: true,
    }
  )
    .populate("users")
    .populate("groupAdmin");

  if (!updatedGroup) {
    return next(new AppError("No group chat found!", 404));
  }

  res.status(200).json({
    status: "success",
    data: updatedGroup,
  });
});

exports.addToGroup = catchAsync(async (req, res, next) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return next(new AppError("Please send all the required data!", 400));
  }

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users")
    .populate("groupAdmin");

  if (!added) {
    return next(new AppError("Chat not found!", 400));
  }

  res.status(200).json({
    status: "success",
    data: added,
  });
});

exports.removeFromGroup = catchAsync(async (req, res, next) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return next(new AppError("Please send all the required data!", 400));
  }

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users")
    .populate("groupAdmin");

  if (!removed) {
    return next(new AppError("Chat not found!", 400));
  }

  res.status(200).json({
    status: "success",
    data: removed,
  });
});
