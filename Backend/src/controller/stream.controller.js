import { createStream, getStreams, deleteStream } from "../services/stream.service.js";

export const addStream = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: "Stream name and code are required" });
    }

    const stream = await createStream({ name, code, description });

    res.status(201).json({
      success: true,
      message: "Stream created successfully",
      data: stream,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllStreams = async (req, res) => {
  try {
    const streams = await getStreams();
    res.json({
      success: true,
      data: streams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeStream = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteStream(id);
    res.json({
      success: true,
      message: "Stream deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
