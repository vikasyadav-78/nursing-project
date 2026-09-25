import fs from "fs";
import {
  createCollegeService,
  getAllCollegesService,
  updateCollegeService,
  deleteCollegeService,
  getCollegeByIdService,
  getCollegeCoursesService,
  bulkCreateCollegesService,
} from "../services/college.service.js";

import { createAuditLog } from "../services/audit.service.js";
import { upload, deleteByKey, getSignedFileUrl } from "../utils/fileUploadService.js";

// Helper to extract S3 key from URL
function extractKeyFromUrl(url) {
  if (!url) return null;
  try {
    // Extract key from S3 URL format: https://bucket.s3.region.amazonaws.com/key
    const urlParts = url.split('.amazonaws.com/');
    if (urlParts.length > 1) {
      return urlParts[1];
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Helper function to generate signed URLs for college data
async function generateSignedUrlsForCollege(college) {
  if (!college) return college;

  try {
    const updatedCollege = { ...college };

    // Generate signed URL for thumbnail
    if (college.thumbnail) {
      try {
        const key = extractKeyFromUrl(college.thumbnail);
        if (key) {
          updatedCollege.thumbnailSignedUrl = await getSignedFileUrl(key);
        } else {
          updatedCollege.thumbnailSignedUrl = college.thumbnail;
        }
      } catch (error) {
        console.error("Error generating signed URL for thumbnail:", error);
        updatedCollege.thumbnailSignedUrl = college.thumbnail;
      }
    }

    // Generate signed URLs for gallery images
    if (college.gallery && Array.isArray(college.gallery) && college.gallery.length > 0) {
      updatedCollege.gallerySignedUrls = await Promise.all(
        college.gallery.map(async (imageUrl) => {
          try {
            const key = extractKeyFromUrl(imageUrl);
            if (key) {
              return await getSignedFileUrl(key);
            }
            return imageUrl;
          } catch (error) {
            console.error("Error generating gallery signed URL:", error);
            return imageUrl;
          }
        })
      );
    }

    return updatedCollege;
  } catch (err) {
    console.error("Error in generateSignedUrlsForCollege:", err);
    return college;
  }
}

export const addCollege = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      sector,
      genderAcceptance,
      establishedYear,
      state,
      district,
      city,
      address,
      googleMapLink,
      affiliation,
      approvedBy,
      coursesCount,
      experienceYears,
      facilities,
      courseIds,
      studentsCount,
      youtubeVideo,
      stream,
      isFeatured,
      isPopular,
    } = req.body;

    const facilitiesArray = Array.isArray(facilities)
      ? facilities
      : facilities?.split(",").map(f => f.trim()).filter(Boolean) || [];

    const parsedCourseIds = courseIds
      ? Array.isArray(courseIds)
        ? courseIds
        : JSON.parse(courseIds)
      : [];

    // Upload thumbnail to S3 - store only URL
    let thumbnailUrl = null;
    const thumbnailFile = req.files?.thumbnail?.[0];

    if (thumbnailFile) {
      try {
        const thumbnailLocalPath = thumbnailFile.path;
        
        if (!fs.existsSync(thumbnailLocalPath)) {
          throw new Error(`Thumbnail file not found at path: ${thumbnailLocalPath}`);
        }

        const s3Result = await upload(thumbnailLocalPath);
        thumbnailUrl = s3Result.url;
        console.log("Thumbnail uploaded to S3:", thumbnailUrl);
      } catch (error) {
        console.error("S3 Upload Error for thumbnail:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to upload thumbnail. " + error.message,
        });
      }
    }
    // Upload brochure PDF to S3
    let brochureUrl = req.body.brochureUrl || null;
    const brochureFile = req.files?.brochure?.[0];

    if (brochureFile) {
      try {
        const brochureLocalPath = brochureFile.path;
        if (fs.existsSync(brochureLocalPath)) {
          const s3Result = await upload(brochureLocalPath);
          brochureUrl = s3Result.url;
          console.log("Brochure uploaded to S3:", brochureUrl);
        }
      } catch (error) {
        console.error("S3 Upload Error for brochure:", error);
      }
    }

    // Upload gallery images to S3 - store only URLs
    let galleryUrls = [];
    const galleryFiles = req.files?.gallery || [];

    if (galleryFiles.length > 0) {
      try {
        galleryUrls = await Promise.all(
          galleryFiles.map(async (file) => {
            const localPath = file.path;
            
            if (!fs.existsSync(localPath)) {
              throw new Error(`Gallery file not found at path: ${localPath}`);
            }

            const s3Result = await upload(localPath);
            return s3Result.url;
          })
        );
        console.log("Gallery uploaded to S3. Count:", galleryUrls.length);
      } catch (error) {
        console.error("S3 Upload Error for gallery:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to upload gallery images. " + error.message,
        });
      }
    }

    const college = await createCollegeService({
      name,
      code,
      description: description || '',
      sector: sector || 'Private',
      genderAcceptance: genderAcceptance || 'Co-ed',
      establishedYear: establishedYear ? parseInt(establishedYear) : null,
      state: state || null,
      district: district || null,
      city: city || null,
      address: address || null,
      googleMapLink: googleMapLink || null,
      affiliation: affiliation || null,
      approvedBy: approvedBy || null,
      coursesCount: coursesCount ? parseInt(coursesCount) : 0,
      experienceYears: experienceYears ? parseInt(experienceYears) : 0,
      studentsCount: studentsCount ? parseInt(studentsCount) : 0,
      facilities: facilitiesArray,
      courseIds: parsedCourseIds,
      thumbnail: thumbnailUrl,
      gallery: galleryUrls,
      youtubeVideo: youtubeVideo || null,
      stream: stream || null,
      rating: req.body.rating || null,
      nirfRank: req.body.nirfRank || null,
      minFee: req.body.minFee ? parseInt(req.body.minFee) : null,
      maxFee: req.body.maxFee ? parseInt(req.body.maxFee) : null,
      tuitionFeesDisplay: req.body.tuitionFeesDisplay || null,
      examsAccepted: Array.isArray(req.body.examsAccepted)
        ? req.body.examsAccepted
        : typeof req.body.examsAccepted === "string"
        ? req.body.examsAccepted.split(",").map((e) => e.trim()).filter(Boolean)
        : [],
      accreditation: req.body.accreditation || null,
      brochureUrl: req.body.brochureUrl || null,
      specialization: req.body.specialization || null,
      programMode: req.body.programMode || null,
      courseType: req.body.courseType || null,
      isFeatured: isFeatured === true || isFeatured === "true",
      isPopular: isPopular === true || isPopular === "true",
    });

    await createAuditLog({
      action: "CREATE",
      module: "College",
      description: `College created: ${name}`,
      userAgent: req.headers["user-agent"],
    });

    const collegeWithSignedUrls = await generateSignedUrlsForCollege(college);

    res.status(201).json({
      success: true,
      message: "College created successfully",
      data: collegeWithSignedUrls,
    });

  } catch (error) {
    console.error("CREATE COLLEGE ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getColleges = async (req, res) => {
  try {
    const {
      featured,
      popular,
      stream,
      sector,
      ownership,
      city,
      state,
      search,
      sortBy,
      specialization,
      programMode,
      courseType,
      exam,
      affiliation,
      approvedBy,
      approval,
      minFee,
      maxFee,
      page = 1,
      limit = 50,
    } = req.query;

    let colleges = await getAllCollegesService();

    // 1. Keyword search (Name, Code, City, State, Description)
    if (search && search.trim() !== "" && search !== "undefined") {
      const q = search.toLowerCase();
      colleges = colleges.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.code?.toLowerCase().includes(q) ||
          c.city?.toLowerCase().includes(q) ||
          c.state?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }

    // 2. State Filter
    if (state && state.trim() !== "" && state !== "undefined") {
      colleges = colleges.filter(
        (c) => c.state?.toLowerCase() === state.toLowerCase()
      );
    }

    // 3. City Filter (Cascaded)
    if (city && city.trim() !== "" && city !== "undefined") {
      colleges = colleges.filter(
        (c) => c.city?.toLowerCase() === city.toLowerCase()
      );
    }

    // 4. Stream Filter
    if (stream && stream.trim() !== "" && stream !== "undefined") {
      colleges = colleges.filter(
        (c) => c.stream?.toLowerCase() === stream.toLowerCase()
      );
    }

    // 5. Specialization Filter
    if (specialization && specialization.trim() !== "" && specialization !== "undefined") {
      colleges = colleges.filter(
        (c) => c.specialization?.toLowerCase().includes(specialization.toLowerCase())
      );
    }

    // 6. Program Mode Filter (Full-Time, Distance, etc.)
    if (programMode && programMode.trim() !== "" && programMode !== "undefined") {
      colleges = colleges.filter(
        (c) => c.programMode?.toLowerCase() === programMode.toLowerCase()
      );
    }

    // 7. Ownership / Sector Filter (Government, Private)
    const targetSector = sector || ownership;
    if (targetSector && targetSector.trim() !== "" && targetSector !== "undefined") {
      colleges = colleges.filter(
        (c) => c.sector?.toLowerCase() === targetSector.toLowerCase()
      );
    }

    // 8. Exams Accepted Filter
    if (exam) {
      const targetExam = exam.toLowerCase();
      colleges = colleges.filter((c) =>
        Array.isArray(c.examsAccepted)
          ? c.examsAccepted.some((e) => e.toLowerCase().includes(targetExam))
          : false
      );
    }

    // 9. Course Type Filter (Degree, Diploma)
    if (courseType) {
      colleges = colleges.filter(
        (c) => c.courseType?.toLowerCase() === courseType.toLowerCase()
      );
    }

    // 10. Affiliation & Approval / Accreditation Filter
    if (affiliation) {
      colleges = colleges.filter((c) =>
        c.affiliation?.toLowerCase().includes(affiliation.toLowerCase())
      );
    }

    const targetApproval = approvedBy || approval;
    if (targetApproval) {
      const appQ = targetApproval.toLowerCase();
      colleges = colleges.filter(
        (c) =>
          c.approvedBy?.toLowerCase().includes(appQ) ||
          c.accreditation?.toLowerCase().includes(appQ)
      );
    }

    // 11. Fees Range Filter (minFee and maxFee bounds)
    if (minFee) {
      const minF = parseInt(minFee);
      colleges = colleges.filter((c) => (c.maxFee || c.minFee || 0) >= minF);
    }
    if (maxFee) {
      const maxF = parseInt(maxFee);
      colleges = colleges.filter((c) => (c.minFee || c.maxFee || 0) <= maxF);
    }

    // 12. Featured & Popular Flags
    if (featured === "true") {
      colleges = colleges.filter((c) => c.isFeatured === true);
    }
    if (popular === "true") {
      colleges = colleges.filter((c) => c.isPopular === true);
    }

    // 13. Sort By Parameters (Ranking, Popularity, Highest Fees, Lowest Fees)
    if (sortBy === "Popularity" || sortBy === "popularity") {
      colleges.sort(
        (a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || (b.studentsCount || 0) - (a.studentsCount || 0)
      );
    } else if (sortBy === "Ranking" || sortBy === "ranking") {
      colleges.sort((a, b) => {
        const rankA = parseInt(String(a.nirfRank || "").replace(/\D/g, "")) || 999;
        const rankB = parseInt(String(b.nirfRank || "").replace(/\D/g, "")) || 999;
        return rankA - rankB;
      });
    } else if (sortBy === "Highest Fees" || sortBy === "highest_fees") {
      colleges.sort((a, b) => (b.maxFee || 0) - (a.maxFee || 0));
    } else if (sortBy === "Lowest Fees" || sortBy === "lowest_fees") {
      colleges.sort((a, b) => (a.minFee || 9999999) - (b.minFee || 9999999));
    }

    const totalCount = colleges.length;

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedColleges = colleges.slice(startIndex, startIndex + limitNum);

    const collegesWithSignedUrls = await Promise.all(
      paginatedColleges.map((college) => generateSignedUrlsForCollege(college))
    );

    res.json({
      success: true,
      message: "Colleges fetched successfully",
      count: totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
      data: collegesWithSignedUrls,
    });

  } catch (error) {
    console.error("GET COLLEGES ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getFilterOptions = async (req, res) => {
  try {
    const { state } = req.query;
    const allColleges = await getAllCollegesService();

    // Unique states
    const states = [...new Set(allColleges.map((c) => c.state).filter(Boolean))].sort();

    // Unique cities (cascaded by state if state param provided)
    let cityColleges = allColleges;
    if (state) {
      cityColleges = cityColleges.filter((c) => c.state?.toLowerCase() === state.toLowerCase());
    }
    const cities = [...new Set(cityColleges.map((c) => c.city).filter(Boolean))].sort();

    // Unique streams
    const streams = [...new Set(allColleges.map((c) => c.stream).filter(Boolean))].sort();

    // Unique specializations
    const specializations = [...new Set(allColleges.map((c) => c.specialization).filter(Boolean))].sort();

    // Program modes
    const programModes = ["Full-Time", "Part-Time", "Distance", "Online"];

    // Course types
    const courseTypes = ["Degree", "Diploma", "Certificate"];

    // Sectors / Ownerships
    const sectors = ["Private", "Government", "Semi-Govt"];

    // Unique exams accepted
    const examsSet = new Set();
    allColleges.forEach((c) => {
      if (Array.isArray(c.examsAccepted)) {
        c.examsAccepted.forEach((e) => examsSet.add(e));
      }
    });
    const exams = [...examsSet].sort();

    // Unique approvals & accreditations
    const approvalsSet = new Set();
    allColleges.forEach((c) => {
      if (c.approvedBy) approvalsSet.add(c.approvedBy);
      if (c.affiliation) approvalsSet.add(c.affiliation);
      if (c.accreditation) approvalsSet.add(c.accreditation);
    });
    const approvals = [...approvalsSet].sort();

    // Min and Max fee bounds
    const allMinFees = allColleges.map((c) => c.minFee).filter(Boolean);
    const allMaxFees = allColleges.map((c) => c.maxFee).filter(Boolean);
    const minFee = allMinFees.length > 0 ? Math.min(...allMinFees) : 0;
    const maxFee = allMaxFees.length > 0 ? Math.max(...allMaxFees) : 1000000;

    res.json({
      success: true,
      data: {
        states,
        cities,
        streams,
        specializations,
        programModes,
        courseTypes,
        sectors,
        exams,
        approvals,
        feeRange: { minFee, maxFee },
      },
    });
  } catch (error) {
    console.error("GET FILTER OPTIONS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const compareColleges = async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({
        success: false,
        message: "Please provide college IDs to compare (e.g. ?ids=id1,id2)",
      });
    }

    const idList = typeof ids === "string" ? ids.split(",") : ids;
    const allColleges = await getAllCollegesService();
    const selectedColleges = allColleges.filter((c) => idList.includes(c.id));

    const collegesWithUrls = await Promise.all(
      selectedColleges.map((c) => generateSignedUrlsForCollege(c))
    );

    res.json({
      success: true,
      count: collegesWithUrls.length,
      data: collegesWithUrls,
    });
  } catch (error) {
    console.error("COMPARE COLLEGES ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCollegeById = async (req, res) => {
  try {
    const college = await getCollegeByIdService(req.params.id);
    
    if (!college) {
      return res.status(404).json({ 
        success: false, 
        message: "College not found" 
      });
    }

    const collegeWithSignedUrls = await generateSignedUrlsForCollege(college);

    res.json({ 
      success: true, 
      data: collegeWithSignedUrls 
    });
  } catch (error) {
    console.error("GET COLLEGE ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const editCollege = async (req, res) => {
  try {
    const existingCollege = await getCollegeByIdService(req.params.id);
    
    if (!existingCollege) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    const updatedData = { ...req.body };

    // Handle thumbnail upload to S3
    const thumbnailFile = req.files?.thumbnail?.[0];
    
    if (thumbnailFile) {
      try {
        // Delete old thumbnail from S3
        if (existingCollege.thumbnail) {
          const oldKey = extractKeyFromUrl(existingCollege.thumbnail);
          if (oldKey) {
            try {
              await deleteByKey(oldKey);
              console.log("Deleted old thumbnail from S3:", oldKey);
            } catch (error) {
              console.error("Failed to delete old thumbnail:", error);
            }
          }
        }

        // Upload new thumbnail
        const thumbnailLocalPath = thumbnailFile.path;
        
        if (!fs.existsSync(thumbnailLocalPath)) {
          throw new Error(`Thumbnail file not found at path: ${thumbnailLocalPath}`);
        }

        const s3Result = await upload(thumbnailLocalPath);
        updatedData.thumbnail = s3Result.url;
        console.log("New thumbnail uploaded:", s3Result.url);
      } catch (error) {
        console.error("S3 Upload Error for thumbnail:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to upload thumbnail. " + error.message,
        });
      }
    }

    // Handle brochure upload to S3
    const brochureFile = req.files?.brochure?.[0];
    if (brochureFile) {
      try {
        const brochureLocalPath = brochureFile.path;
        if (fs.existsSync(brochureLocalPath)) {
          const s3Result = await upload(brochureLocalPath);
          updatedData.brochureUrl = s3Result.url;
          console.log("New brochure uploaded:", s3Result.url);
        }
      } catch (error) {
        console.error("S3 Upload Error for brochure:", error);
      }
    }

    // Handle gallery upload to S3
    const galleryFiles = req.files?.gallery || [];
    
    if (galleryFiles.length > 0) {
      try {
        // Delete old gallery images from S3
        const existingGallery = Array.isArray(existingCollege.gallery) 
          ? existingCollege.gallery 
          : JSON.parse(existingCollege.gallery || '[]');
          
        for (const imageUrl of existingGallery) {
          const key = extractKeyFromUrl(imageUrl);
          if (key) {
            try {
              await deleteByKey(key);
              console.log("Deleted old gallery image:", key);
            } catch (error) {
              console.error("Failed to delete old gallery image:", error);
            }
          }
        }

        // Upload new gallery images
        const galleryUrls = await Promise.all(
          galleryFiles.map(async (file) => {
            const localPath = file.path;
            
            if (!fs.existsSync(localPath)) {
              throw new Error(`Gallery file not found at path: ${localPath}`);
            }

            const s3Result = await upload(localPath);
            return s3Result.url;
          })
        );

        updatedData.gallery = galleryUrls;
        console.log("New gallery uploaded. Count:", galleryUrls.length);
      } catch (error) {
        console.error("S3 Upload Error for gallery:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to upload gallery images. " + error.message,
        });
      }
    }

    // Parse arrays if they exist
    if (req.body.facilities) {
      updatedData.facilities = Array.isArray(req.body.facilities)
        ? req.body.facilities
        : JSON.parse(req.body.facilities);
    }

    if (req.body.courseIds) {
      updatedData.courseIds = Array.isArray(req.body.courseIds)
        ? req.body.courseIds
        : JSON.parse(req.body.courseIds);
    }

    await updateCollegeService(req.params.id, updatedData);

    // Get updated college with signed URLs
    const updatedCollege = await getCollegeByIdService(req.params.id);
    const collegeWithSignedUrls = await generateSignedUrlsForCollege(updatedCollege);

    res.json({
      success: true,
      message: "College updated successfully",
      data: collegeWithSignedUrls,
    });
  } catch (error) {
    console.error("UPDATE COLLEGE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCollege = async (req, res) => {
  try {
    const college = await getCollegeByIdService(req.params.id);
    
    if (college) {
      // Delete thumbnail from S3
      if (college.thumbnail) {
        const key = extractKeyFromUrl(college.thumbnail);
        if (key) {
          try {
            await deleteByKey(key);
            console.log("Deleted thumbnail from S3:", key);
          } catch (error) {
            console.error("Failed to delete thumbnail:", error);
          }
        }
      }

      // Delete gallery images from S3
      const gallery = Array.isArray(college.gallery) 
        ? college.gallery 
        : JSON.parse(college.gallery || '[]');
        
      for (const imageUrl of gallery) {
        const key = extractKeyFromUrl(imageUrl);
        if (key) {
          try {
            await deleteByKey(key);
            console.log("Deleted gallery image:", key);
          } catch (error) {
            console.error("Failed to delete gallery image:", error);
          }
        }
      }
    }

    await deleteCollegeService(req.params.id);

    await createAuditLog({
      action: "DELETE",
      module: "College",
      description: `College deleted (ID: ${req.params.id})`,
      userAgent: req.headers["user-agent"],
    });

    res.json({ success: true, message: "College deleted successfully" });
  } catch (error) {
    console.error("DELETE COLLEGE ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCollegeCourses = async (req, res) => {
  try {
    const courses = await getCollegeCoursesService(req.params.id);
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchColleges = async (req, res) => {
  try {
    const { q, state, city } = req.query;

    let conditions = [];

    if (q) {
      const keyword = `%${q.toLowerCase()}%`;
      conditions.push(
        sql`(
          LOWER(${collegesTable.name}) LIKE ${keyword}
          OR LOWER(${collegesTable.city}) LIKE ${keyword}
          OR LOWER(${collegesTable.state}) LIKE ${keyword}
        )`
      );
    }

    if (state) {
      conditions.push(
        sql`LOWER(${collegesTable.state}) = ${state.toLowerCase()}`
      );
    }

    if (city) {
      conditions.push(
        sql`LOWER(${collegesTable.city}) = ${city.toLowerCase()}`
      );
    }

    if (conditions.length === 0) {
      const colleges = await db.select().from(collegesTable);
      const collegesWithSignedUrls = await Promise.all(
        colleges.map(college => generateSignedUrlsForCollege(college))
      );
      return res.json({ success: true, data: collegesWithSignedUrls });
    }

    const colleges = await db
      .select()
      .from(collegesTable)
      .where(sql.join(conditions, sql` AND `));

    const collegesWithSignedUrls = await Promise.all(
      colleges.map(college => generateSignedUrlsForCollege(college))
    );

    if (q) {
      const description = `Searched "${q}" (${colleges.length} results found)`;
      await createAuditLog({
        action: "SEARCH",
        module: "College",
        description,
        userAgent: req.headers["user-agent"],
      });
    }

    res.json({
      success: true,
      data: collegesWithSignedUrls,
    });

  } catch (error) {
    console.error("COLLEGE SEARCH ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCollegesByCourse = async (req, res) => {
  try {
    const { course } = req.query;

    if (!course) {
      return res.json({ success: true, data: [] });
    }

    const colleges = await db
      .select()
      .from(collegesTable)
      .where(
        sql`${collegesTable.courseIds} LIKE ${`%"${course}"%`}`
      );

    const collegesWithSignedUrls = await Promise.all(
      colleges.map(college => generateSignedUrlsForCollege(college))
    );

    res.json({
      success: true,
      data: collegesWithSignedUrls,
    });

  } catch (error) {
    console.error("COURSE FILTER ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCollegesByLocation = async (req, res) => {
  try {
    const { state, city } = req.query;

    let query = sql`1=1`;

    if (state) {
      query = sql`${query} AND LOWER(${collegesTable.state}) = LOWER(${state})`;
    }

    if (city) {
      query = sql`${query} AND LOWER(${collegesTable.city}) = LOWER(${city})`;
    }

    const colleges = await db
      .select()
      .from(collegesTable)
      .where(query);

    const collegesWithSignedUrls = await Promise.all(
      colleges.map(college => generateSignedUrlsForCollege(college))
    );

    res.json({
      success: true,
      data: collegesWithSignedUrls,
    });
  } catch (error) {
    console.error("LOCATION FILTER ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const bulkAddColleges = async (req, res) => {
  try {
    const { colleges } = req.body;
    if (!colleges || !Array.isArray(colleges) || colleges.length === 0) {
      return res.status(400).json({ success: false, message: "Valid array of colleges is required" });
    }

    const result = await bulkCreateCollegesService(colleges);

    await createAuditLog({
      action: "BULK_COLLEGES_IMPORT",
      module: "COLLEGE",
      description: `Bulk imported ${result.createdCount} new colleges and updated ${result.updatedCount} colleges`,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json({
      success: true,
      message: `Bulk import completed! ${result.createdCount} colleges created, ${result.updatedCount} updated.`,
      data: result,
    });
  } catch (error) {
    console.error("Bulk add colleges error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};