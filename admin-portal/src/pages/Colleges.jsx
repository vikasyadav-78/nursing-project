import React, { useState, useEffect } from "react";
import API from "../api/client";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  GraduationCap,
  AlertTriangle,
  X,
  Star,
  Download,
  Bookmark,
  Scale,
  LayoutGrid,
  List,
  Building,
  FileText,
  Upload,
  Image as ImageIcon,
  Filter,
  RefreshCw
} from "lucide-react";
const formatNirfDisplay = (rank) => {
  if (!rank) return "";
  const str = String(rank).trim();
  if (!str) return "";
  if (str.startsWith("#")) return str;
  const num = str.replace(/\D/g, "");
  if (num) return `# ${num} NIRF`;
  return str;
};

const formatFeeDisplay = (college) => {
  if (!college) return "-";
  let display = college.tuitionFeesDisplay ? String(college.tuitionFeesDisplay).trim() : "";
  if (!display) {
    const minF = college.minFee;
    const maxF = college.maxFee;
    if (minF && maxF && minF !== maxF) {
      const formatNum = (n) => (n >= 100000 ? `${n / 100000} L` : n >= 1000 ? `${n / 1000} K` : `${n}`);
      display = `${formatNum(minF)} - ${formatNum(maxF)}`;
    } else if (minF || maxF) {
      const n = minF || maxF;
      display = n >= 100000 ? `${n / 100000} L` : n >= 1000 ? `${n / 1000} K` : `${n}`;
    }
  }
  if (!display) return "-";
  return display.includes("₹") ? display : `₹${display}`;
};

const Colleges = () => {
  const [colleges, setColleges] = useState([]);
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Ranking"); // Ranking, Popularity, Highest Fees, Lowest Fees
  const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'table'

  // Cascading Filter States
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedStream, setSelectedStream] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedProgramMode, setSelectedProgramMode] = useState("");
  const [filterOptions, setFilterOptions] = useState({
    states: [],
    cities: [],
    streams: [],
    sectors: [],
    programModes: [],
  });

  // Expanded description state for cards
  const [expandedDesc, setExpandedDesc] = useState({});

  // Shortlisted colleges
  const [shortlisted, setShortlisted] = useState({});

  // Compare Colleges state
  const [compareList, setCompareList] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // GetMyUni "Add College to Compare" Modal Popup State
  const [isAddCompareModalOpen, setIsAddCompareModalOpen] = useState(false);
  const [slot1CollegeId, setSlot1CollegeId] = useState("");
  const [slot1Program, setSlot1Program] = useState("B.Sc Nursing");
  const [slot2CollegeId, setSlot2CollegeId] = useState("");
  const [slot2Program, setSlot2Program] = useState("B.Sc Nursing");

  const handleOpenAddCompareModal = () => {
    if (compareList.length >= 1) {
      setSlot1CollegeId(compareList[0].id);
      setSlot1Program(compareList[0].specialization || "B.Sc Nursing");
    } else if (colleges.length > 0) {
      setSlot1CollegeId(colleges[0].id);
      setSlot1Program(colleges[0].specialization || "B.Sc Nursing");
    }

    if (compareList.length >= 2) {
      setSlot2CollegeId(compareList[1].id);
      setSlot2Program(compareList[1].specialization || "B.Sc Nursing");
    } else if (colleges.length > 1) {
      const other = colleges.find((c) => c.id !== (compareList[0]?.id || colleges[0]?.id));
      if (other) {
        setSlot2CollegeId(other.id);
        setSlot2Program(other.specialization || "B.Sc Nursing");
      }
    }
    setIsAddCompareModalOpen(true);
  };

  const handleStartComparisonFromModal = () => {
    if (!slot1CollegeId || !slot2CollegeId) {
      toast.error("Please select both colleges to compare");
      return;
    }
    if (slot1CollegeId === slot2CollegeId) {
      toast.error("Please select two different colleges to compare");
      return;
    }
    const c1 = colleges.find((c) => c.id === slot1CollegeId);
    const c2 = colleges.find((c) => c.id === slot2CollegeId);
    if (c1 && c2) {
      setCompareList([c1, c2]);
      setIsAddCompareModalOpen(false);
      setIsCompareModalOpen(true);
    }
  };

  // Brochure modal
  const [brochureModal, setBrochureModal] = useState({ isOpen: false, college: null });

  // Add/Edit/Delete Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, college: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, collegeId: null, collegeName: "" });

  // Files state (Device File Picker)
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [brochureFile, setBrochureFile] = useState(null);

  const initialForm = {
    name: "",
    code: "",
    description: "",
    sector: "Private",
    genderAcceptance: "Co-ed",
    establishedYear: new Date().getFullYear(),
    state: "",
    district: "",
    city: "",
    address: "",
    affiliation: "",
    approvedBy: "",
    stream: "",
    coursesCount: "",
    rating: "",
    nirfRank: "",
    tuitionFeesDisplay: "",
    minFee: "",
    maxFee: "",
    examsAccepted: "",
    accreditation: "",
    specialization: "",
    programMode: "Full-Time",
    courseType: "Degree",
    isFeatured: false,
    isPopular: false,
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchColleges();
    fetchStreams();
    fetchFilterOptions();
  }, []);

  // Re-fetch cascaded cities whenever selectedState changes
  useEffect(() => {
    fetchFilterOptions(selectedState);
    if (selectedState === "") setSelectedCity("");
  }, [selectedState]);

  const fetchFilterOptions = async (stateParam = "") => {
    try {
      const url = stateParam ? `/college/filter-options?state=${encodeURIComponent(stateParam)}` : "/college/filter-options";
      const res = await API.get(url);
      if (res.data?.success && res.data.data) {
        setFilterOptions((prev) => ({
          ...prev,
          states: res.data.data.states || [],
          cities: res.data.data.cities || [],
          streams: res.data.data.streams || [],
          sectors: res.data.data.sectors || [],
          programModes: res.data.data.programModes || [],
        }));
      }
    } catch (err) {
      console.error("Failed to load filter options", err);
    }
  };

  const fetchStreams = async () => {
    try {
      const res = await API.get("/stream");
      if (res.data?.success && res.data.data) {
        const streamList = res.data.data.map((s) => s.name);
        setStreams(streamList);
      }
    } catch (err) {
      console.error("Failed to load dynamic streams", err);
    }
  };

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (sortBy) queryParams.append("sortBy", sortBy);
      if (selectedState) queryParams.append("state", selectedState);
      if (selectedCity) queryParams.append("city", selectedCity);
      if (selectedStream) queryParams.append("stream", selectedStream);
      if (selectedSector) queryParams.append("sector", selectedSector);
      if (selectedProgramMode) queryParams.append("programMode", selectedProgramMode);
      if (search) queryParams.append("search", search);

      const endpoint = `/college?${queryParams.toString()}`;
      console.log("Calling API:", endpoint);
      const res = await API.get(endpoint);
      console.log("College API Response:", res.data);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setColleges(res.data.data);
      }
    } catch (err) {
      console.error("Fetch colleges error:", err);
      toast.error("Failed to load colleges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, [sortBy, selectedState, selectedCity, selectedStream, selectedSector, selectedProgramMode]);

  const handleCreateCollege = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== "") {
          data.append(key, formData[key]);
        }
      });
      if (thumbnailFile) data.append("thumbnail", thumbnailFile);
      if (brochureFile) data.append("brochure", brochureFile);

      const res = await API.post("/college", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        toast.success("College added successfully!");
        setIsAddModalOpen(false);
        setFormData(initialForm);
        setThumbnailFile(null);
        setBrochureFile(null);
        fetchColleges();
        fetchFilterOptions(selectedState);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add college");
    }
  };

  const handleOpenEditModal = (college) => {
    setEditModal({
      isOpen: true,
      college,
    });
    setFormData({
      ...college,
      examsAccepted: Array.isArray(college.examsAccepted)
        ? college.examsAccepted.join(", ")
        : college.examsAccepted || "",
    });
    setThumbnailFile(null);
    setBrochureFile(null);
  };

  const handleUpdateCollege = async (e) => {
    e.preventDefault();
    if (!editModal.college?.id) return;
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== "") {
          data.append(key, formData[key]);
        }
      });
      if (thumbnailFile) data.append("thumbnail", thumbnailFile);
      if (brochureFile) data.append("brochure", brochureFile);

      const res = await API.put(`/college/${editModal.college.id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        toast.success("College details updated successfully!");
        setEditModal({ isOpen: false, college: null });
        setFormData(initialForm);
        setThumbnailFile(null);
        setBrochureFile(null);
        fetchColleges();
        fetchFilterOptions(selectedState);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update college");
    }
  };

  const resetAllFilters = () => {
    setSelectedState("");
    setSelectedCity("");
    setSelectedStream("");
    setSelectedSector("");
    setSelectedProgramMode("");
    setSearch("");
    setSortBy("Ranking");
  };

  const confirmDelete = (college) => {
    setDeleteModal({
      isOpen: true,
      collegeId: college.id,
      collegeName: college.name,
    });
  };

  const handleExecuteDelete = async () => {
    if (!deleteModal.collegeId) return;
    try {
      await API.delete(`/college/${deleteModal.collegeId}`);
      toast.success("College deleted successfully");
      setDeleteModal({ isOpen: false, collegeId: null, collegeName: "" });
      fetchColleges();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete college");
    }
  };

  const toggleDescription = (id) => {
    setExpandedDesc((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleShortlist = (id) => {
    const isCurrentlyShortlisted = !!shortlisted[id];
    setShortlisted((prev) => ({ ...prev, [id]: !isCurrentlyShortlisted }));
    if (!isCurrentlyShortlisted) {
      toast.success("College added to Shortlist!");
    } else {
      toast.success("College removed from Shortlist");
    }
  };

  const toggleCompare = (college) => {
    const exists = compareList.some((item) => item.id === college.id);
    if (exists) {
      setCompareList((prev) => prev.filter((item) => item.id !== college.id));
      toast.success(`Removed ${college.name} from comparison`);
    } else {
      if (compareList.length >= 4) {
        toast.error("You can compare up to 4 colleges at a time");
        return;
      }
      setCompareList((prev) => [...prev, college]);
      toast.success(`Added ${college.name} to comparison!`);
    }
  };

  const displayedColleges = colleges;

  return (
    <div className="space-y-6 relative pb-28">
      {/* Header & Controls Bar */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>Showing {displayedColleges.length} Colleges</span>
              <button
                onClick={() => {
                  toast.success("Refreshing colleges...");
                  fetchColleges();
                }}
                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Reload List"
              >
                <RefreshCw size={16} />
              </button>
            </h1>
            <p className="text-xs text-slate-500 mt-1">Multi-Filter Cascading Search APIs & Management</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 md:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search for Colleges..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchColleges()}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    fetchColleges();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort By Dropdown (GetMyUni API parameter test) */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="Ranking">Ranking</option>
                <option value="Popularity">Popularity</option>
                <option value="Highest Fees">Highest Fees</option>
                <option value="Lowest Fees">Lowest Fees</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded ${viewMode === "cards" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                title="GetMyUni Card View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded ${viewMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                title="Admin Table View"
              >
                <List size={18} />
              </button>
            </div>

            {/* Compare Colleges (GetMyUni Style Modal Button) */}
            <button
              onClick={handleOpenAddCompareModal}
              className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-4 py-2 rounded-lg text-sm border border-indigo-200 transition-colors shadow-sm"
            >
              <Scale size={16} />
              <span>Compare Colleges</span>
            </button>

            {/* Add College Button */}
            <button
              onClick={() => {
                setFormData(initialForm);
                setThumbnailFile(null);
                setBrochureFile(null);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span>Add College</span>
            </button>
          </div>
        </div>

        {/* CASCADING FILTER BAR */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-blue-700 font-bold pr-2 border-r">
            <Filter size={14} />
            <span>Cascading Filters:</span>
          </div>

          {/* 1. State Filter */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-700 focus:border-blue-500"
          >
            <option value="">All States</option>
            {filterOptions.states.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* 2. City Filter (Cascaded under State) */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-700 focus:border-blue-500"
          >
            <option value="">
              {selectedState ? `All Cities in ${selectedState}` : "All Cities (Select State First)"}
            </option>
            {filterOptions.cities.map((ct) => (
              <option key={ct} value={ct}>
                {ct}
              </option>
            ))}
          </select>

          {/* 3. Stream Filter */}
          <select
            value={selectedStream}
            onChange={(e) => setSelectedStream(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-700 focus:border-blue-500"
          >
            <option value="">All Streams</option>
            {filterOptions.streams.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* 4. Sector / Ownership Filter */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-700 focus:border-blue-500"
          >
            <option value="">All Sectors (Private / Govt)</option>
            <option value="Private">Private</option>
            <option value="Government">Government</option>
            <option value="Semi-Govt">Semi-Govt</option>
          </select>

          {/* 5. Program Mode Filter */}
          <select
            value={selectedProgramMode}
            onChange={(e) => setSelectedProgramMode(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-700 focus:border-blue-500"
          >
            <option value="">All Program Modes</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Distance">Distance</option>
            <option value="Online">Online</option>
          </select>

          {/* Reset Filters */}
          {(selectedState || selectedCity || selectedStream || selectedSector || selectedProgramMode || search) && (
            <button
              onClick={resetAllFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors"
            >
              <RefreshCw size={12} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200">
          <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
          <p className="text-xs text-slate-500">Loading colleges list...</p>
        </div>
      ) : displayedColleges.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          No colleges match your filter criteria. Try resetting filters.
        </div>
      ) : viewMode === "cards" ? (
        /* GETMYUNI CARD VIEW */
        <div className="space-y-4">
          {displayedColleges.map((college) => {
            const isExpanded = expandedDesc[college.id];
            const isShortlisted = shortlisted[college.id];
            const isCompared = compareList.some((item) => item.id === college.id);
            const defaultDesc =
              college.description ||
              `${college.name} is a ${college.sector || "Private"} College, located in ${college.city || "Chennai"}, ${college.state || "Tamil Nadu"}. ${college.name} offers various courses across Bachelors, Masters, and Doctorate Levels.`;

            return (
              <div
                key={college.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative"
              >
                {/* Compare Icon Button Top Right */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(college)}
                    className="p-2 rounded-full border bg-slate-50 text-slate-500 border-slate-200 hover:bg-blue-50 hover:text-blue-600 transition-all"
                    title="Edit College Attributes"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => toggleCompare(college)}
                    className={`p-2 rounded-full border transition-all ${
                      isCompared
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                    title={isCompared ? "Remove from Compare" : "Add to Compare"}
                  >
                    <Scale size={18} />
                  </button>
                </div>

                {/* Top Header: Logo, Name, Meta Tags */}
                <div className="flex items-start gap-4 pr-24">
                  <div className="w-14 h-14 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0 overflow-hidden">
                    {college.thumbnail ? (
                      <img src={college.thumbnail} alt={college.name} className="w-full h-full object-cover" />
                    ) : (
                      <GraduationCap size={28} />
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-2">
                      {college.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>
                        {college.city}{college.state ? `, ${college.state}` : ""}
                      </span>
                      <span>•</span>
                      <span>{college.sector || "Private"}</span>
                      {college.rating && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-amber-500 font-semibold">
                            <Star size={14} className="fill-amber-400 text-amber-400" />
                            {college.rating}
                          </span>
                        </>
                      )}
                      {college.nirfRank && (
                        <>
                          <span>•</span>
                          <span className="bg-blue-900 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                            {formatNirfDisplay(college.nirfRank)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description Snippet */}
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {isExpanded ? defaultDesc : `${defaultDesc.slice(0, 160)}${defaultDesc.length > 160 ? "..." : ""}`}
                  {defaultDesc.length > 160 && (
                    <button
                      onClick={() => toggleDescription(college.id)}
                      className="text-red-600 font-bold ml-1 hover:underline text-xs"
                    >
                      {isExpanded ? "Read Less" : "Read More"}
                    </button>
                  )}
                </p>

                {/* Key Metrics Grid & Action Buttons */}
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {/* Courses Offered */}
                    <div>
                      <p className="text-slate-400 font-medium">Courses Offered</p>
                      <p className="text-blue-600 font-bold text-sm mt-0.5">
                        {college.coursesCount ? `${college.coursesCount} Courses` : "N/A"}
                      </p>
                    </div>

                    {/* Exams Accepted */}
                    <div>
                      <p className="text-slate-400 font-medium">Exams Accepted</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Array.isArray(college.examsAccepted) && college.examsAccepted.length > 0 ? (
                          college.examsAccepted.map((ex, idx) => (
                            <span key={idx} className="text-blue-700 font-bold text-xs">
                              {ex}
                              {idx < college.examsAccepted.length - 1 ? " , " : ""}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 font-medium text-xs">-</span>
                        )}
                      </div>
                    </div>

                    {/* Tuition Fees Range */}
                    <div>
                      <p className="text-slate-400 font-medium">Tuition Fees Range</p>
                      <p className="text-slate-800 font-bold text-sm mt-0.5">
                        {formatFeeDisplay(college)}
                      </p>
                    </div>

                    {/* Accreditation */}
                    <div>
                      <p className="text-slate-400 font-medium">Accreditation</p>
                      <p className="text-slate-700 font-semibold text-xs mt-0.5">
                        {college.accreditation || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Right Action Buttons */}
                  <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-3">
                    <button
                      onClick={() => toggleShortlist(college.id)}
                      className={`px-4 py-2 border rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                        isShortlisted
                          ? "border-red-500 text-red-600 bg-red-50"
                          : "border-red-400 text-red-500 hover:bg-red-50"
                      }`}
                    >
                      <Bookmark size={14} className={isShortlisted ? "fill-red-500" : ""} />
                      <span>{isShortlisted ? "Shortlisted" : "Shortlist"}</span>
                    </button>

                    <button
                      onClick={() => setBrochureModal({ isOpen: true, college })}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Download size={14} />
                      <span>Brochure</span>
                    </button>

                    <button
                      onClick={() => confirmDelete(college)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Delete College"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ADMIN TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-5 py-3">College Name</th>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">City & State</th>
                  <th className="px-5 py-3">NIRF Rank</th>
                  <th className="px-5 py-3">Rating</th>
                  <th className="px-5 py-3">Fees Display</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedColleges.map((college) => (
                  <tr key={college.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-800 flex items-center gap-3">
                      <GraduationCap size={18} className="text-blue-600 shrink-0" />
                      <span>{college.name}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 font-mono text-xs">{college.code}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {college.city}, {college.state}
                    </td>
                    <td className="px-5 py-3">
                      {college.nirfRank ? (
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">
                          {formatNirfDisplay(college.nirfRank)}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-bold text-amber-600">
                      {college.rating ? `⭐ ${college.rating}` : "-"}
                    </td>
                    <td className="px-5 py-3 text-slate-700 font-medium text-xs">
                      {formatFeeDisplay(college)}
                    </td>
                    <td className="px-5 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(college)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                        title="Edit College"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => toggleCompare(college)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                        title="Compare API"
                      >
                        <Scale size={16} />
                      </button>
                      <button
                        onClick={() => confirmDelete(college)}
                        className="p-1.5 text-slate-500 hover:text-red-600 rounded hover:bg-slate-100"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STICKY BOTTOM COMPARE DRAWER (GetMyUni Style) */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-300 shadow-2xl p-4 transition-all">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <h4 className="font-bold text-slate-800 text-sm whitespace-nowrap">Add College to Compare</h4>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono">
                {compareList.length}/4 Selected
              </span>
            </div>

            {/* Selected Colleges Slots */}
            <div className="flex items-center gap-4 overflow-x-auto w-full md:w-auto py-1">
              {compareList.map((c, idx) => (
                <React.Fragment key={c.id}>
                  {idx > 0 && <span className="text-slate-400 font-bold text-xs">VS</span>}
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 shrink-0">
                    <Building size={14} className="text-blue-600" />
                    <span className="max-w-[140px] truncate">{c.name}</span>
                    <button
                      onClick={() => toggleCompare(c)}
                      className="text-slate-400 hover:text-red-600 ml-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </React.Fragment>
              ))}

              {compareList.length < 2 && (
                <button
                  onClick={handleOpenAddCompareModal}
                  className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>Select / Add college to compare</span>
                </button>
              )}
            </div>

            {/* Go To Compare Action */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={() => setCompareList([])}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Clear All
              </button>
              <button
                disabled={compareList.length < 2}
                onClick={() => setIsCompareModalOpen(true)}
                className={`px-6 py-2.5 rounded-lg font-bold text-xs transition-colors shadow-sm ${
                  compareList.length >= 2
                    ? "bg-red-400 hover:bg-red-500 text-white cursor-pointer"
                    : "bg-red-200 text-white cursor-not-allowed"
                }`}
              >
                Go To Compare
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GETMYUNI "ADD COLLEGE TO COMPARE" POPUP MODAL */}
      {isAddCompareModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Add College to Compare</h3>
              <button
                onClick={() => setIsAddCompareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content - Two Slots Side by Side */}
            <div className="p-8">
              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                {/* Central VS Badge */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-slate-100 border border-slate-200 rounded-full items-center justify-center text-xs font-black text-slate-500 shadow-sm uppercase">
                  vs
                </div>

                {/* Left Slot - College 1 */}
                <div className="flex items-start gap-4 p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
                  <div className="w-14 h-14 bg-blue-100/70 border border-blue-200 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                    <Building size={28} />
                  </div>
                  <div className="flex-1 space-y-3">
                    {/* Select College 1 Dropdown */}
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select
                        value={slot1CollegeId}
                        onChange={(e) => setSlot1CollegeId(e.target.value)}
                        className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="">Add a College</option>
                        {colleges.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.city || c.state || "India"})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Select Program 1 Dropdown */}
                    <div className="relative">
                      <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select
                        value={slot1Program}
                        onChange={(e) => setSlot1Program(e.target.value)}
                        className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="">Select Program</option>
                        <option value="B.Sc Nursing">B.Sc Nursing</option>
                        <option value="M.Sc Nursing">M.Sc Nursing</option>
                        <option value="Post Basic B.Sc">Post Basic B.Sc</option>
                        <option value="GNM">GNM</option>
                        <option value="ANM">ANM</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Slot - College 2 */}
                <div className="flex items-start gap-4 p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
                  <div className="w-14 h-14 bg-blue-100/70 border border-blue-200 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                    <Building size={28} />
                  </div>
                  <div className="flex-1 space-y-3">
                    {/* Select College 2 Dropdown */}
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select
                        value={slot2CollegeId}
                        onChange={(e) => setSlot2CollegeId(e.target.value)}
                        className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="">Add a College</option>
                        {colleges.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.city || c.state || "India"})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Select Program 2 Dropdown */}
                    <div className="relative">
                      <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select
                        value={slot2Program}
                        onChange={(e) => setSlot2Program(e.target.value)}
                        className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="">Select Program</option>
                        <option value="B.Sc Nursing">B.Sc Nursing</option>
                        <option value="M.Sc Nursing">M.Sc Nursing</option>
                        <option value="Post Basic B.Sc">Post Basic B.Sc</option>
                        <option value="GNM">GNM</option>
                        <option value="ANM">ANM</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Footer Action */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-center">
              <button
                disabled={!slot1CollegeId || !slot2CollegeId || slot1CollegeId === slot2CollegeId}
                onClick={handleStartComparisonFromModal}
                className={`px-12 py-3 rounded-lg font-bold text-sm transition-all shadow-sm ${
                  slot1CollegeId && slot2CollegeId && slot1CollegeId !== slot2CollegeId
                    ? "bg-red-400 hover:bg-red-500 text-white cursor-pointer shadow-md transform active:scale-95"
                    : "bg-red-200 text-white cursor-not-allowed"
                }`}
              >
                Go To Compare
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPARE SIDE-BY-SIDE MODAL */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Scale size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Colleges Comparison API Result</h3>
                  <p className="text-xs text-slate-500">
                    Endpoint: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">GET /api/college/compare?ids={compareList.map(c=>c.id).join(",")}</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="p-3 font-bold text-slate-500 w-1/5">Metrics</th>
                    {compareList.map((college) => (
                      <th key={college.id} className="p-3 font-bold text-blue-600 text-sm">
                        {college.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">NIRF Ranking</td>
                    {compareList.map((c) => (
                      <td key={c.id} className="p-3 font-bold text-slate-800">
                        {c.nirfRank ? (
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {formatNirfDisplay(c.nirfRank)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Rating</td>
                    {compareList.map((c) => (
                      <td key={c.id} className="p-3 font-bold text-amber-600">
                        {c.rating ? (
                          <span className="flex items-center gap-1">
                            <Star size={14} className="fill-amber-400 text-amber-400" />
                            {c.rating} / 5
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Tuition Fees Range</td>
                    {compareList.map((c) => (
                      <td key={c.id} className="p-3 font-bold text-slate-800">
                        {formatFeeDisplay(c)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Sector & Type</td>
                    {compareList.map((c) => (
                      <td key={c.id} className="p-3 font-medium text-slate-700">
                        {c.sector || "Private"} ({c.genderAcceptance || "Co-ed"})
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Location</td>
                    {compareList.map((c) => (
                      <td key={c.id} className="p-3 text-slate-700">
                        {c.city}, {c.state}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Accreditation</td>
                    {compareList.map((c) => (
                      <td key={c.id} className="p-3 text-slate-700 font-medium">
                        {c.accreditation || "-"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Courses Count</td>
                    {compareList.map((c) => (
                      <td key={c.id} className="p-3 text-slate-800 font-bold">
                        {c.coursesCount ? `${c.coursesCount} Courses` : "-"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Established Year</td>
                    {compareList.map((c) => (
                      <td key={c.id} className="p-3 text-slate-700">
                        {c.establishedYear || "-"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-6 border-t mt-4">
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="px-5 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BROCHURE MODAL */}
      {brochureModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Download Brochure
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Get full details, course info & fee structure for{" "}
              <span className="font-bold text-slate-800">{brochureModal.college?.name}</span>
            </p>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-left space-y-2 mb-5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Location:</span>
                <span className="font-semibold text-slate-800">{brochureModal.college?.city}, {brochureModal.college?.state}</span>
              </div>
              <div className="flex justify-between">
                <span>Fees Range:</span>
                <span className="font-semibold text-slate-800">{brochureModal.college?.tuitionFeesDisplay || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span>Accreditation:</span>
                <span className="font-semibold text-slate-800">{brochureModal.college?.accreditation || "-"}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setBrochureModal({ isOpen: false, college: null })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (brochureModal.college?.brochureUrl) {
                    window.open(brochureModal.college.brochureUrl, "_blank");
                    toast.success("Opening brochure PDF...");
                  } else {
                    toast.error("No brochure PDF uploaded for this college yet.");
                  }
                  setBrochureModal({ isOpen: false, college: null });
                }}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit College Modal Popup */}
      {(isAddModalOpen || editModal.isOpen) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                {editModal.isOpen ? "Edit College Details" : "Add New GetMyUni College"}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditModal({ isOpen: false, college: null });
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={editModal.isOpen ? handleUpdateCollege : handleCreateCollege}
              className="space-y-4 text-sm"
            >
              {/* DEVICE FILE PICKERS FOR LOGO AND BROCHURE AT THE TOP */}
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1.5 text-xs">
                    <ImageIcon size={16} className="text-blue-600" />
                    <span>College Logo / Thumbnail (File)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files[0])}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer shadow-sm"
                  />
                  {thumbnailFile && (
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                      Selected: {thumbnailFile.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1.5 text-xs">
                    <Upload size={16} className="text-red-600" />
                    <span>Brochure PDF Document (File)</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => setBrochureFile(e.target.files[0])}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer shadow-sm"
                  />
                  {brochureFile && (
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                      Selected: {brochureFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">College Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. IIT Madras"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">College Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. IITM-01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Chennai"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Tamil Nadu"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Stream *</label>
                  <select
                    value={formData.stream}
                    onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                  >
                    <option value="">-- Select Stream --</option>
                    {streams.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* GetMyUni Specific Fields */}
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
                <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider">
                  GetMyUni Display & Ranking Attributes (API Managed)
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">NIRF Rank (e.g. 1 or 5)</label>
                    <input
                      type="text"
                      value={formData.nirfRank}
                      onChange={(e) => setFormData({ ...formData, nirfRank: e.target.value })}
                      placeholder="e.g. 1 (Auto-formats to # 1 NIRF)"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Rating (Out of 5)</label>
                    <input
                      type="text"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      placeholder="e.g. 4.3"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Tuition Fees Display (Auto-calculated)</label>
                    <input
                      type="text"
                      value={formData.tuitionFeesDisplay}
                      onChange={(e) => setFormData({ ...formData, tuitionFeesDisplay: e.target.value })}
                      placeholder="e.g. 6 K-8 L (Auto adds ₹)"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Min Fee (₹ for Sorting)</label>
                    <input
                      type="number"
                      value={formData.minFee}
                      onChange={(e) => setFormData({ ...formData, minFee: e.target.value })}
                      placeholder="e.g. 6000"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Max Fee (₹ for Sorting)</label>
                    <input
                      type="number"
                      value={formData.maxFee}
                      onChange={(e) => setFormData({ ...formData, maxFee: e.target.value })}
                      placeholder="e.g. 800000"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Courses Count</label>
                    <input
                      type="number"
                      value={formData.coursesCount}
                      onChange={(e) => setFormData({ ...formData, coursesCount: e.target.value })}
                      placeholder="e.g. 6"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Specialization</label>
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      placeholder="e.g. B.Sc Nursing"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Program Mode</label>
                    <select
                      value={formData.programMode}
                      onChange={(e) => setFormData({ ...formData, programMode: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                    >
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Distance">Distance</option>
                      <option value="Online">Online</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Course Type</label>
                    <select
                      value={formData.courseType}
                      onChange={(e) => setFormData({ ...formData, courseType: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                    >
                      <option value="Degree">Degree</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Certificate">Certificate</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Exams Accepted (Comma separated)</label>
                    <input
                      type="text"
                      value={formData.examsAccepted}
                      onChange={(e) => setFormData({ ...formData, examsAccepted: e.target.value })}
                      placeholder="e.g. CAT, NEET, JEE"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Accreditation / Approval</label>
                    <input
                      type="text"
                      value={formData.accreditation}
                      onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                      placeholder="e.g. NAAC A++, INC Approved"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Overview Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of the college..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditModal({ isOpen: false, college: null });
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
                >
                  {editModal.isOpen ? "Update College" : "Save College"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-slate-800">Confirm Deletion</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-900">"{deleteModal.collegeName}"</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, collegeId: null, collegeName: "" })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm"
              >
                Delete College
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Colleges;
