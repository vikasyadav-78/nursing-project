import React, { useState, useEffect } from "react";
import API from "../api/client";
import { toast } from "react-hot-toast";
import { Search, Sparkles, Filter, CheckCircle2, SlidersHorizontal } from "lucide-react";

const SearchTester = () => {
  const [query, setQuery] = useState("bsc nursing");
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [filterMetadata, setFilterMetadata] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);

  const [selectedState, setSelectedState] = useState("");
  const [selectedSector, setSelectedSector] = useState("");

  const handleAutocomplete = async (val) => {
    setQuery(val);
    if (!val.trim()) {
      setAutocompleteResults([]);
      return;
    }

    try {
      const res = await API.get(`/search/autocomplete?q=${encodeURIComponent(val)}`);
      setAutocompleteResults(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecuteSearch = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoadingSearch(true);
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (selectedState) params.append("state", selectedState);
      if (selectedSector) params.append("sector", selectedSector);

      const res = await API.get(`/search?${params.toString()}`);
      setSearchResults(res.data.data);
      toast.success("Search executed successfully!");
    } catch (err) {
      toast.error("Failed to execute search query");
    } finally {
      setLoadingSearch(false);
    }
  };

  const fetchFilters = async () => {
    try {
      setLoadingFilters(true);
      const res = await API.get("/search/filters");
      setFilterMetadata(res.data.data);
    } catch (err) {
      toast.error("Failed to load search filter options");
    } finally {
      setLoadingFilters(false);
    }
  };

  useEffect(() => {
    fetchFilters();
    handleExecuteSearch();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="text-blue-600" size={26} />
          Search & Supported Filters API Tester
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Interactive live tester for unified search engine, synonym matching & dynamic sidebar filters
        </p>
      </div>

      {/* Main Search Controls */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleExecuteSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Type search query (e.g. bsc nursing, gnm, jaipur)..."
              value={query}
              onChange={(e) => handleAutocomplete(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-600"
            />

            {/* Autocomplete Dropdown Preview */}
            {autocompleteResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-20 overflow-hidden divide-y divide-slate-100">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 uppercase tracking-wider">
                  Instant Autocomplete Suggestions
                </div>
                {autocompleteResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setQuery(item.title);
                      setAutocompleteResults([]);
                    }}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{item.title}</div>
                      <div className="text-slate-500 text-[11px]">{item.subtitle}</div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loadingSearch}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm shrink-0"
          >
            {loadingSearch ? "Searching..." : "Test Search API"}
          </button>
        </form>

        {/* Filter Sliders */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <SlidersHorizontal size={14} className="text-slate-400" />
            Apply Filters:
          </span>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-2.5 py-1 border border-slate-300 rounded bg-white font-medium"
            >
              <option value="">All States</option>
              {filterMetadata?.states?.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Sector:</span>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="px-2.5 py-1 border border-slate-300 rounded bg-white font-medium"
            >
              <option value="">All Sectors</option>
              <option value="Government">Government</option>
              <option value="Private">Private</option>
              <option value="Semi-Govt">Semi-Govt</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Output */}
      {searchResults && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="text-sm font-bold text-slate-800">
              Search Results ({searchResults.pagination?.total || searchResults.results?.length || 0} Found)
            </div>
            {searchResults.pagination && (
              <div className="text-xs text-slate-500 font-medium">
                Page {searchResults.pagination?.page || 1} of {searchResults.pagination?.totalPages || 1}
              </div>
            )}
          </div>

          {searchResults.results && searchResults.results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.results.map((item, idx) => (
                <div
                  key={item.id || item._id || idx}
                  className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow bg-slate-50/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-slate-800 text-base">
                        {item.name || item.title || item.collegeName || "Untitled"}
                      </h3>
                      <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-blue-100 text-blue-700 shrink-0">
                        {item.type || item.entityType || "Result"}
                      </span>
                    </div>

                    {item.state || item.city || item.location ? (
                      <p className="text-xs text-slate-500 mb-2">
                        📍 {[item.city, item.state, item.location].filter(Boolean).join(", ")}
                      </p>
                    ) : null}

                    {item.shortDescription || item.description || item.overview ? (
                      <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                        {item.shortDescription || item.description || item.overview}
                      </p>
                    ) : null}

                    {/* Metadata tags */}
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {item.sector && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.sector}
                        </span>
                      )}
                      {item.stream && (
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          {item.stream}
                        </span>
                      )}
                      {item.courseType && (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          {item.courseType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Search size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-base font-semibold text-slate-600">No results found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for keywords like "nursing", "bsc", "jaipur", "college" etc.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchTester;
