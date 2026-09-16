import { prisma } from "../database/prisma.js";
import { getOrSetCache } from "./cache.service.js";

// Common Nursing Platform Synonyms
const SYNONYMS_MAP = {
  "bsc": ["b.sc", "bachelor of science", "bsc nursing", "b.sc nursing"],
  "b.sc": ["bsc", "bachelor of science", "bsc nursing"],
  "gnm": ["general nursing and midwifery", "gnm nursing", "g.n.m."],
  "anm": ["auxiliary nurse midwife", "anm nursing", "a.n.m."],
  "msc": ["m.sc", "master of science", "msc nursing", "m.sc nursing"],
  "post basic": ["pb bsc", "p.b. b.sc", "post basic bsc nursing"],
  "nursing": ["nurse", "nursing college", "nursing course"],
  "aiims": ["all india institute of medical sciences"],
  "ruhs": ["rajasthan university of health sciences"],
};

/**
 * Expand query term into token variations and synonyms
 */
const expandQueryTerms = (rawQuery = "") => {
  const normalized = rawQuery.toLowerCase().trim();
  if (!normalized) return [];

  const tokens = normalized.split(/\s+/);
  const termsSet = new Set([normalized, ...tokens]);

  tokens.forEach((token) => {
    if (SYNONYMS_MAP[token]) {
      SYNONYMS_MAP[token].forEach((syn) => termsSet.add(syn));
    }
  });

  return Array.from(termsSet);
};

/**
 * Calculate relevance score for an entity based on search terms
 */
const calculateScore = (item, rawQuery, searchTerms) => {
  if (!rawQuery) return 100;
  const name = (item.name || "").toLowerCase();
  const code = (item.code || "").toLowerCase();
  const description = (item.description || "").toLowerCase();

  let score = 0;

  // Exact Match
  if (name === rawQuery || code === rawQuery) {
    score += 100;
  }
  // Prefix Match
  else if (name.startsWith(rawQuery) || code.startsWith(rawQuery)) {
    score += 80;
  }

  // Synonym & Token Matches
  for (const term of searchTerms) {
    if (name.includes(term) || code.includes(term)) {
      score += 40;
    } else if (description.includes(term)) {
      score += 15;
    }
  }

  // Feature / Popularity Boost
  if (item.isFeatured) score += 15;
  if (item.isPopular) score += 10;

  return score;
};

/**
 * Core Search Function with Supported Filters, Scoring & Pagination
 */
export const searchEntitiesService = async (params = {}) => {
  const {
    q = "",
    entityType = "all", // "colleges" | "courses" | "exams" | "blogs" | "all"
    state,
    city,
    district,
    stream,
    sector,
    minFee,
    maxFee,
    rating,
    exam,
    isFeatured,
    isPopular,
    page = 1,
    limit = 10,
  } = params;

  const cacheKey = `search:query:${JSON.stringify(params)}`;

  return await getOrSetCache(cacheKey, async () => {
    const rawQuery = q.toLowerCase().trim();
    const searchTerms = expandQueryTerms(rawQuery);

    let colleges = [];
    let courses = [];
    let exams = [];
    let blogs = [];

    // 1. Fetch & Filter Colleges
    if (entityType === "all" || entityType === "colleges") {
      let rawColleges = await prisma.college.findMany();

      colleges = rawColleges.filter((c) => {
        // Filter by Location
        if (state && c.state?.toLowerCase() !== state.toLowerCase()) return false;
        if (city && c.city?.toLowerCase() !== city.toLowerCase()) return false;
        if (district && c.district?.toLowerCase() !== district.toLowerCase()) return false;

        // Filter by Sector (Govt/Private)
        if (sector && c.sector?.toLowerCase() !== sector.toLowerCase()) return false;

        // Filter by Stream
        if (stream && c.stream?.toLowerCase() !== stream.toLowerCase()) return false;

        // Filter by Fees
        if (minFee && (c.maxFee || c.minFee || 0) < Number(minFee)) return false;
        if (maxFee && (c.minFee || 0) > Number(maxFee)) return false;

        // Filter by Rating
        if (rating && Number(c.rating || 0) < Number(rating)) return false;

        // Filter by Entrance Exam Accepted
        if (exam) {
          const accepted = Array.isArray(c.examsAccepted) ? c.examsAccepted : [];
          if (!accepted.some((e) => String(e).toLowerCase().includes(exam.toLowerCase()))) {
            return false;
          }
        }

        // Filter by Flags
        if (isFeatured === "true" && !c.isFeatured) return false;
        if (isPopular === "true" && !c.isPopular) return false;

        // Search Query Filtering
        if (rawQuery) {
          const score = calculateScore(c, rawQuery, searchTerms);
          if (score <= 0) return false;
          c._score = score;
        } else {
          c._score = 100;
        }

        return true;
      }).map(c => ({ ...c, _entityType: "college" }));
    }

    // 2. Fetch & Filter Courses
    if (entityType === "all" || entityType === "courses") {
      let rawCourses = await prisma.course.findMany();
      courses = rawCourses.filter((crs) => {
        if (rawQuery) {
          const score = calculateScore(crs, rawQuery, searchTerms);
          if (score <= 0) return false;
          crs._score = score;
        } else {
          crs._score = 100;
        }
        return true;
      }).map(crs => ({ ...crs, _entityType: "course" }));
    }

    // 3. Fetch & Filter Exams
    if (entityType === "all" || entityType === "exams") {
      let rawExams = await prisma.exam.findMany();
      exams = rawExams.filter((ex) => {
        if (rawQuery) {
          const score = calculateScore(ex, rawQuery, searchTerms);
          if (score <= 0) return false;
          ex._score = score;
        } else {
          ex._score = 100;
        }
        return true;
      }).map(ex => ({ ...ex, _entityType: "exam" }));
    }

    // 4. Fetch & Filter Blogs
    if (entityType === "all" || entityType === "blogs") {
      let rawBlogs = await prisma.blog.findMany();
      blogs = rawBlogs.filter((b) => {
        if (rawQuery) {
          const score = calculateScore(b, rawQuery, searchTerms);
          if (score <= 0) return false;
          b._score = score;
        } else {
          b._score = 100;
        }
        return true;
      }).map(b => ({ ...b, _entityType: "blog" }));
    }

    // Combine & Sort by Relevance Score
    let combined = [...colleges, ...courses, ...exams, ...blogs];
    combined.sort((a, b) => (b._score || 0) - (a._score || 0));

    // Pagination Calculation
    const total = combined.length;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedResults = combined.slice(startIndex, startIndex + limitNum);

    return {
      query: q,
      entityType,
      appliedFilters: { state, city, district, stream, sector, minFee, maxFee, rating, exam, isFeatured, isPopular },
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
      results: paginatedResults,
    };
  }, 300); // 5 min TTL
};

/**
 * High-Speed Autocomplete Suggestions for Search Bar
 */
export const autocompleteSearchService = async (q = "", limit = 8) => {
  if (!q.trim()) return [];

  const cacheKey = `search:autocomplete:${q.toLowerCase().trim()}:${limit}`;

  return await getOrSetCache(cacheKey, async () => {
    const rawQuery = q.toLowerCase().trim();
    const searchTerms = expandQueryTerms(rawQuery);

    const [colleges, courses, exams, blogs] = await Promise.all([
      prisma.college.findMany(),
      prisma.course.findMany(),
      prisma.exam.findMany(),
      prisma.blog.findMany(),
    ]);

    const suggestions = [];

    // Match Colleges
    colleges.forEach((c) => {
      const score = calculateScore(c, rawQuery, searchTerms);
      if (score > 0) {
        suggestions.push({
          id: c.id,
          title: c.name,
          subtitle: `${c.city || c.state || "College"} • ${c.sector || ""}`,
          type: "college",
          score,
        });
      }
    });

    // Match Courses
    courses.forEach((crs) => {
      const score = calculateScore(crs, rawQuery, searchTerms);
      if (score > 0) {
        suggestions.push({
          id: crs.id,
          title: crs.name,
          subtitle: `Duration: ${crs.duration || "N/A"}`,
          type: "course",
          score,
        });
      }
    });

    // Match Exams
    exams.forEach((ex) => {
      const score = calculateScore(ex, rawQuery, searchTerms);
      if (score > 0) {
        suggestions.push({
          id: ex.id,
          title: ex.name,
          subtitle: `Category: ${ex.category || "Exam"}`,
          type: "exam",
          score,
        });
      }
    });

    // Match Blogs
    blogs.forEach((b) => {
      const score = calculateScore(b, rawQuery, searchTerms);
      if (score > 0) {
        suggestions.push({
          id: b.id,
          title: b.title,
          subtitle: "Article / Blog",
          type: "blog",
          score,
        });
      }
    });

    suggestions.sort((a, b) => b.score - a.score);
    return suggestions.slice(0, Number(limit));
  }, 600); // 10 min TTL
};

/**
 * Fetch Aggregated Supported Filter Options for Frontend Sidebar
 */
export const getSupportedFilterOptionsService = async () => {
  const cacheKey = `search:supported-filters:metadata`;

  return await getOrSetCache(cacheKey, async () => {
    const colleges = await prisma.college.findMany();
    const courses = await prisma.course.findMany();
    const exams = await prisma.exam.findMany();

    const statesSet = new Set();
    const citiesSet = new Set();
    const streamsSet = new Set();
    const sectorsSet = new Set();
    const examsSet = new Set();

    let minFeeLowest = Infinity;
    let maxFeeHighest = 0;

    colleges.forEach((c) => {
      if (c.state) statesSet.add(c.state);
      if (c.city) citiesSet.add(c.city);
      if (c.stream) streamsSet.add(c.stream);
      if (c.sector) sectorsSet.add(c.sector);

      if (c.minFee && c.minFee < minFeeLowest) minFeeLowest = c.minFee;
      if (c.maxFee && c.maxFee > maxFeeHighest) maxFeeHighest = c.maxFee;

      if (Array.isArray(c.examsAccepted)) {
        c.examsAccepted.forEach((ex) => examsSet.add(ex));
      }
    });

    exams.forEach((ex) => {
      if (ex.name) examsSet.add(ex.name);
    });

    return {
      states: Array.from(statesSet).sort(),
      cities: Array.from(citiesSet).sort(),
      streams: Array.from(streamsSet).sort(),
      sectors: Array.from(sectorsSet).sort(),
      entranceExams: Array.from(examsSet).sort(),
      feeRange: {
        min: minFeeLowest === Infinity ? 0 : minFeeLowest,
        max: maxFeeHighest,
      },
      availableCourses: courses.map((crs) => ({ id: crs.id, name: crs.name, code: crs.code })),
    };
  }, 900); // 15 min TTL
};
