import CollegeImage from '../components/CollegeImage.jsx';
import CollegeLogo from '../components/CollegeLogo.jsx';
import { useState, useEffect, useMemo } from 'react';
import { collegesData } from '../data/collegesData.js';
import apiService from '../services/api.js';

const stateMap = {
  'HR': 'Haryana',
  'RJ': 'Rajasthan',
  'TG': 'Telangana',
  'OR': 'Odisha',
  'JK': 'Jammu & Kashmir',
  'KA': 'Karnataka',
  'BR': 'Bihar',
  'ML': 'Meghalaya',
  'UP': 'Uttar Pradesh',
  'PB': 'Punjab',
  'MH': 'Maharashtra',
  'WB': 'West Bengal',
  'TR': 'Tripura',
  'HP': 'Himachal Pradesh',
  'JH': 'Jharkhand',
  'CT': 'Chhattisgarh',
  'AP': 'Andhra Pradesh',
  'GJ': 'Gujarat',
  'GA': 'Goa',
  'TN': 'Tamil Nadu',
  'MP': 'Madhya Pradesh',
  'KL': 'Kerala',
  'UT': 'Uttarakhand',
};

const cityAliases = {
  'bangalore': ['bangalore', 'bengaluru', 'bangalore urban'],
  'bengaluru': ['bangalore', 'bengaluru', 'bangalore urban'],
  'delhi': ['delhi', 'new delhi', 'north delhi', 'south delhi', 'noida', 'gurugram'],
  'new delhi': ['delhi', 'new delhi', 'north delhi', 'south delhi'],
  'mumbai': ['mumbai', 'nashik', 'pune'],
  'chennai': ['chennai', 'tamil nadu'],
  'kolkata': ['kolkata', 'howrah'],
  'hyderabad': ['hyderabad', 'nizamabad', 'warangal', 'mancheral'],
  'pune': ['pune', 'mumbai', 'nashik'],
  'jaipur': ['jaipur', 'jodhpur', 'dausa', 'kota', 'ajmer', 'udaipur'],
};

const popularCities = [
  { name: 'Bangalore', image: 'https://media.getmyuni.com/assets/images/city-logos/bangalore-bengaluru.webp' },
  { name: 'Chennai', image: 'https://media.getmyuni.com/assets/images/city-logos/chennai.webp' },
  { name: 'Delhi', image: 'https://media.getmyuni.com/assets/images/city-logos/delhi.webp' },
  { name: 'Mumbai', image: 'https://media.getmyuni.com/assets/images/city-logos/mumbai.webp' },
  { name: 'Pune', image: 'https://media.getmyuni.com/assets/images/city-logos/pune.webp' },
  { name: 'Jaipur', image: 'https://media.getmyuni.com/assets/images/city-logos/jaipur.webp' },
  { name: 'Hyderabad', image: 'https://media.getmyuni.com/assets/images/city-logos/hyderabad.webp' },
  { name: 'Panipat', image: 'https://media.getmyuni.com/assets/images/city-logos/panipat.webp' },
];

export default function CityColleges({ onNavigate }) {
  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [apiColleges, setApiColleges] = useState([]);

  useEffect(() => {
    const parseCityFromUrl = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const queryCity = searchParams.get('city');

      if (queryCity) {
        return queryCity;
      }

      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2 && pathParts[0] === 'city') {
        const pathCity = pathParts[1].replace(/-/g, ' ');
        return pathCity.charAt(0).toUpperCase() + pathCity.slice(1);
      }

      return 'Bangalore';
    };

    const currentCity = parseCityFromUrl();
    setSelectedCity(currentCity);
    window.scrollTo(0, 0);

    // Fetch from backend API
    apiService.getColleges({ city: currentCity }).then(res => {
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setApiColleges(res.data);
      }
    }).catch(() => {});
  }, [window.location.search, window.location.pathname]);

  const sourceData = apiColleges.length > 0 ? apiColleges : collegesData;

  const rawCollegesForCity = useMemo(() => {
    if (!selectedCity) return sourceData;

    const normalizedQuery = selectedCity.toLowerCase().trim();
    const aliasList = cityAliases[normalizedQuery] || [normalizedQuery];

    return sourceData.filter(c => {
      const cCity = (c.city || '').toLowerCase();
      const cDistrict = (c.district || '').toLowerCase();
      const cAddr = (c.address || '').toLowerCase();

      return aliasList.some(alias =>
        cCity.includes(alias) || alias.includes(cCity) ||
        cDistrict.includes(alias) ||
        cAddr.includes(alias)
      );
    });
  }, [selectedCity, sourceData]);

  const filteredColleges = useMemo(() => {
    return rawCollegesForCity.filter(c => {
      const matchesSearch = !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.sector || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSector = sectorFilter === 'ALL' || (c.sector || '').toUpperCase() === sectorFilter.toUpperCase();
      const matchesGender = genderFilter === 'ALL' || (c.genderAcceptance || '').toUpperCase().includes(genderFilter.toUpperCase());

      return matchesSearch && matchesSector && matchesGender;
    });
  }, [rawCollegesForCity, searchQuery, sectorFilter, genderFilter]);

  const handleApplyNow = (college) => {
    window.dispatchEvent(new CustomEvent('open-apply-modal', {
      detail: { collegeName: college.name }
    }));
  };

  const handleViewDetails = (college) => {
    window.dispatchEvent(new CustomEvent('open-details-modal', {
      detail: { collegeId: college.id, collegeName: college.name }
    }));
  };

  const handleSwitchCity = (cityName) => {
    setSelectedCity(cityName);
    if (onNavigate) {
      onNavigate(`/city-colleges?city=${encodeURIComponent(cityName)}`);
    } else {
      window.history.pushState({}, '', `/city-colleges?city=${encodeURIComponent(cityName)}`);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="converted-page min-h-screen bg-[#f4f5f7] pb-16" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Hero Header Banner */}
      <div className="bg-[#0966c2] text-white pt-8 pb-12 px-4 sm:px-6 shadow-md">
        <div className="max-w-[1240px] mx-auto">
          {/* Breadcrumb */}
          <nav className="text-xs text-white/80 mb-3 flex items-center gap-2">
            <a 
              href="/home" 
              onClick={(e) => { e.preventDefault(); onNavigate?.('/home'); }}
              className="hover:underline text-white/90"
            >
              Home
            </a>
            <span>›</span>
            <span>City Wise Colleges</span>
            <span>›</span>
            <span className="font-bold text-white">{selectedCity}</span>
          </nav>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Top Colleges in <span className="text-[#a5f3fc]">{selectedCity}</span> 2026
          </h1>
          <p className="text-sm sm:text-base text-white/90 max-w-3xl leading-relaxed mb-6">
            Find and compare top accredited colleges in {selectedCity} with details on course fees, rankings, admission cut-offs, review ratings, and placement records.
          </p>

          {/* Search & Filter Bar Container */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg flex flex-col sm:flex-row gap-3 items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder={`Search colleges in ${selectedCity}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-800 text-sm font-medium placeholder-gray-400 border border-transparent focus:border-white outline-none shadow-sm"
              />
              <span className="absolute left-3.5 top-3.5 text-gray-400 text-base">🔍</span>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white text-gray-800 font-semibold text-xs border border-transparent outline-none cursor-pointer shadow-sm flex-1 sm:flex-none"
              >
                <option value="ALL">All Sectors</option>
                <option value="PRIVATE">Private</option>
                <option value="GOVERNMENT">Government</option>
              </select>

              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white text-gray-800 font-semibold text-xs border border-transparent outline-none cursor-pointer shadow-sm flex-1 sm:flex-none"
              >
                <option value="ALL">All Genders</option>
                <option value="CO-ED">Co-ed</option>
                <option value="GIRLS">Girls Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 mt-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left / Main Colleges List */}
          <div className="w-full flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Showing {filteredColleges.length} Colleges in {selectedCity}
              </h2>
              {(sectorFilter !== 'ALL' || genderFilter !== 'ALL' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => { setSectorFilter('ALL'); setGenderFilter('ALL'); setSearchQuery(''); }}
                  className="text-xs font-bold text-[#e5383b] hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Colleges Grid */}
            {filteredColleges.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-xs border border-gray-200">
                <p className="text-lg font-semibold text-gray-700">No colleges match your search criteria</p>
                <p className="text-xs text-gray-400 mt-1">Try clearing your filters or searching for another term.</p>
              </div>
            ) : (
              <div className="searchedcollegeList space-y-4">
                {filteredColleges.map((item, index) => {
                  const stateName = stateMap[item.state] || item.state || '';
                  const locationStr = [item.city || item.district, stateName].filter(Boolean).join(', ');

                  return (
                    <div
                      className="college__card__new bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-all"
                      key={item.id || index}
                    >
                      <div className="card__header__row flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="college__detail__grid flex items-start gap-4">
                          <CollegeLogo college={item}
                            size={64}
                            className="college__image rounded-xl shrink-0"
                          />
                          <div className="college__detail__row min-w-0">
                            <h2 className="college__name text-lg font-bold text-gray-900 hover:text-[#0966c2]">
                              <a href={`/college/${item.id}`} title={item.name}>
                                {item.name}
                              </a>
                            </h2>
                            <div className="detail__list__mobile flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-500">
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-semibold rounded-md">
                                📍 {locationStr}
                              </span>
                              <span className="px-2 py-0.5 bg-red-50 text-red-600 font-bold rounded-md uppercase">
                                {item.sector || "Private"}
                              </span>
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md uppercase">
                                {item.genderAcceptance || "Co-ed"}
                              </span>
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold rounded-md">
                                ⭐ 4.5
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="summary-text my-3">
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {`${item.name} is a leading ${item.sector || 'Private'} educational institute located in ${locationStr}. Code: ${item.code || 'N/A'}. Affiliated with ${item.affiliation || item.name}.`}
                        </p>
                      </div>

                      <div className="highlight__cta__row flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-gray-100">
                        <div className="highlights__grid flex flex-wrap gap-4 text-xs">
                          <div>
                            <span className="text-gray-400 font-semibold block">Courses</span>
                            <span className="font-bold text-gray-800">{item.coursesCount || 6}+ Programs</span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-semibold block">Entrance</span>
                            <span className="font-bold text-gray-800">Neet / Merit</span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-semibold block">Rating</span>
                            <span className="font-bold text-amber-600">4.5 / 5 ★</span>
                          </div>
                        </div>

                        <div className="cta__grid flex items-center gap-2.5 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => handleApplyNow(item)}
                            className="cta__div lead-cta-college-filter-2 apply-now-btn flex-1 sm:flex-none px-5 py-2.5 rounded-xl border-1.8 border-[#e5383b] text-[#e5383b] hover:bg-[#fff5f5] font-bold text-xs transition-all text-center"
                          >
                            Apply Now
                          </button>
                          <button
                            type="button"
                            onClick={() => handleViewDetails(item)}
                            className="cta__div lead-cta-college-filter-1 view-details-btn flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#e5383b] hover:bg-[#c92a37] text-white font-bold text-xs transition-all text-center shadow-2xs"
                          >
                            View College
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar: Popular Cities Navigation */}
          <div className="w-full lg:w-[320px] shrink-0 space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
              <h3 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                🏙️ Popular Cities
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {popularCities.map(city => (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => handleSwitchCity(city.name)}
                    className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                      selectedCity.toLowerCase() === city.name.toLowerCase()
                        ? 'bg-[#e5383b] text-white border-[#e5383b] shadow-xs'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200/80'
                    }`}
                  >
                    📍 {city.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Help / Counseling Card */}
            <div className="bg-gradient-to-br from-[#0966c2] to-[#04478a] text-white rounded-2xl p-6 shadow-md text-center">
              <span className="text-2xl mb-2 block">🎓</span>
              <h4 className="text-base font-bold mb-1">Need Admission Help?</h4>
              <p className="text-xs text-white/80 mb-4">Get free expert 1-on-1 counseling for top colleges in {selectedCity}.</p>
              <button
                type="button"
                onClick={() => handleApplyNow({ name: `General Counseling - ${selectedCity}` })}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-[#0966c2] font-extrabold text-xs shadow-sm hover:bg-gray-50 transition-all"
              >
                Talk to Admission Expert
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
