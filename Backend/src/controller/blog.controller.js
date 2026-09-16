import fs from "fs";
import path from "path";
import { createBlog, getBlogs, getBlogByIdService, deleteBlog } from "../services/blog.service.js";
import { prisma } from "../database/prisma.js";
import { createAuditLog } from "../services/audit.service.js";
import { deleteCache, invalidatePattern } from "../services/cache.service.js";

export const addBlog = async (req, res) => {
  try {
    const image = req.file ? req.file.filename : null;

    const blog = await createBlog({
      title: req.body.title,
      code: req.body.code,
      contentType: req.body.contentType || "Article",
      description: req.body.description,
      image,
      status: req.body.status || "DRAFT",
      authorId: req.user?.id || null,
      authorName: req.user?.username || req.body.authorName || "Editor",
      publishedAt: req.body.status === "PUBLISHED" ? new Date() : null,
    });

    await createAuditLog({
      action: "CREATE",
      module: "Blog",
      description: `Content created: ${req.body.title} [Status: ${req.body.status || "DRAFT"}]`,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json({
      success: true,
      message: "Content created successfully",
      data: blog,
    });
  } catch (error) {
    console.error("ADD BLOG ERROR:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const { status } = req.query;
    // Default public view gets only PUBLISHED. CMS users can pass ?status=ALL or ?status=DRAFT
    const targetStatus = status || "PUBLISHED";
    const blogs = await getBlogs(targetStatus);

    res.json({
      success: true,
      message: "Blogs fetched successfully",
      data: blogs || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
    });
  }
};

export const updateBlogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const blogId = Number(id);
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: "Status is required" });

    const updateData = { status };
    if (status === "PUBLISHED") {
      updateData.publishedAt = new Date();
    }

    await prisma.blog.update({
      where: { id: blogId },
      data: updateData,
    });
    await deleteCache(`entity:blog:${id}`);
    await invalidatePattern("blogs:list:*");

    res.json({ success: true, message: `Content status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blogId = Number(id);
    const image = req.file?.filename;

    const data = {
      title: req.body.title,
      code: req.body.code,
      description: req.body.description,
    };

    if (image) data.image = image;

    await prisma.blog.update({
      where: { id: blogId },
      data,
    });

    await deleteCache(`entity:blog:${id}`);
    await invalidatePattern("blogs:list:*");

    await createAuditLog({
      action: "UPDATE",
      module: "Blog",
      description: `Blog updated: ID ${id}`,
      userAgent: req.headers["user-agent"],
    });

    res.json({ success: true, message: "Blog updated successfully" });
  } catch (error) {
    console.error("UPDATE BLOG ERROR:", error);

    await createAuditLog({
      action: "FAILED_UPDATE",
      module: "Blog",
      description: `Failed to update blog ID: ${req.params.id}`,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blogId = Number(id);

    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    if (blog.image) {
      const imgPath = path.join("uploads/blogs", blog.image);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await deleteBlog(blogId);

    await createAuditLog({
      action: "DELETE",
      module: "Blog",
      description: `Blog deleted: ${blog.title}`,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("DELETE BLOG ERROR:", error);

    await createAuditLog({
      action: "FAILED_DELETE",
      module: "Blog",
      description: `Failed to delete blog ID: ${req.params.id}`,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await getBlogByIdService(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};