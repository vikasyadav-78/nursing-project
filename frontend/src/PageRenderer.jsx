import { useEffect, useRef } from 'react';
import { getDropdownSelection, matchesFilter } from './navMenus.js';
import { localLink } from './linkPolicy.js';
import { collegesData } from './data/collegesData.js';

const MANAGED_ATTR = 'data-nurshing-managed';
const LOCAL_BASE = 'https://site.invalid';

function ensureCompatibilityGlobals() {
  window.gmu = window.gmu || {};
  window.gmu.url = window.gmu.url || {};
  const navigate = (url) => {
    const destination = localLink(url);
    if (destination) window.location.assign(destination);
    return false;
  };
  window.gmu.url.goto = navigate;
  window.menuNavigate = navigate;
}

function getLocalRoute(href) {
  if (/^(mailto|tel):/i.test(href || '')) return null;
  return localLink(href) || '#';
}

function getStylesheetHref(href) {
  if (!href) return null;

  try {
    const url = new URL(href, LOCAL_BASE);
    const isGetMyUniAsset = ['site.invalid', 'www.getmyuni.com', 'getmyuni.com'].includes(url.hostname)
      && url.pathname.startsWith('/yas/css/');

    if (isGetMyUniAsset) {
      return `${url.pathname}${url.search}`;
    }

    if (
      url.protocol === 'https:'
      && ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'a.pub.network'].includes(url.hostname)
    ) {
      return url.href;
    }
  } catch {
    return null;
  }

  return null;
}

function promoteLazyImages(root) {
  root.querySelectorAll('img').forEach((image) => {
    const dataSrc = image.getAttribute('data-src');
    const hasUsableSrc = image.getAttribute('src') && image.getAttribute('src') !== '#';

    if (dataSrc && !hasUsableSrc) {
      image.setAttribute('src', dataSrc);
    }

    if (!image.hasAttribute('loading')) {
      image.setAttribute('loading', image.getAttribute('fetchpriority') === 'high' ? 'eager' : 'lazy');
    }
  });
}

function rewriteStaticLinks(root) {
  root.querySelectorAll('a[href]').forEach((anchor) => {
    const destination = localLink(anchor.getAttribute('href'));
    if (destination) anchor.setAttribute('href', destination);
    else {
      anchor.removeAttribute('href');
      anchor.setAttribute('aria-disabled', 'true');
    }
    anchor.removeAttribute('ping');
  });
}

function activateTab(root, trigger) {
  const targetSelector = trigger.getAttribute('data-target');
  if (!targetSelector) return false;

  const target = root.querySelector(targetSelector);
  if (!target) return false;

  const triggerGroup = trigger.closest('ul, .bannerTabButtons, .tabButtons') || trigger.parentElement;
  triggerGroup?.querySelectorAll('[data-target]').forEach((item) => {
    item.classList.remove('tabLink', 'activeLink', 'active');
  });
  trigger.classList.add('tabLink', 'activeLink', 'active');

  const panelGroup = target.parentElement;
  panelGroup?.querySelectorAll('.tab-content').forEach((panel) => {
    panel.classList.remove('activeTab');
  });
  target.classList.add('activeTab');

  return true;
}

function revealMoreCards(button) {
  const section = button.closest('.tab-content, section, .exploreCategoryContent, .indexSection');
  if (!section) return false;

  section.classList.add('show-all-cards');
  section.querySelectorAll('.dataCard, .displayCard, .collegeCard, .sliderCard').forEach((card) => {
    card.style.display = '';
  });
  button.setAttribute('hidden', '');
  return true;
}

function getSliderParts(control) {
  const wrapper = control.closest('.customSlider, .articleRelataedLinks');
  if (!wrapper) return null;

  const scroller = wrapper.querySelector('.customSliderCards, .customSliderList, ul');
  return scroller ? { wrapper, scroller } : null;
}

function updateSliderButtons(wrapper, scroller) {
  const left = wrapper.querySelector('.scrollLeft, .btn_left');
  const right = wrapper.querySelector('.scrollRight, .btn_right');
  const canScroll = scroller.scrollWidth > scroller.clientWidth + 2;
  const atStart = scroller.scrollLeft <= 2;
  const atEnd = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 2;

  left?.classList.toggle('over', !canScroll || atStart);
  right?.classList.toggle('over', !canScroll || atEnd);
}

function initializeHorizontalScrollers(root) {
  const sliders = Array.from(root.querySelectorAll('.customSlider, .articleRelataedLinks'))
    .map((wrapper) => {
      const scroller = wrapper.querySelector('.customSliderCards, .customSliderList, ul');
      return scroller ? { wrapper, scroller } : null;
    })
    .filter(Boolean);

  const refresh = () => {
    sliders.forEach(({ wrapper, scroller }) => updateSliderButtons(wrapper, scroller));
  };

  sliders.forEach(({ scroller }) => {
    scroller.addEventListener('scroll', refresh, { passive: true });
  });

  window.addEventListener('resize', refresh, { passive: true });
  window.requestAnimationFrame(refresh);

  return () => {
    sliders.forEach(({ scroller }) => {
      scroller.removeEventListener('scroll', refresh);
    });
    window.removeEventListener('resize', refresh);
  };
}

function scrollHorizontalSlider(control) {
  const parts = getSliderParts(control);
  if (!parts) return false;

  const { wrapper, scroller } = parts;
  const direction = control.matches('.scrollLeft, .btn_left') ? -1 : 1;
  const distance = Math.max(240, Math.round(scroller.clientWidth * 0.86));

  scroller.scrollBy({ left: direction * distance, behavior: 'smooth' });
  window.setTimeout(() => updateSliderButtons(wrapper, scroller), 360);
  return true;
}

function normalizeText(value) {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function getText(root, selector) {
  return normalizeText(root.querySelector(selector)?.textContent);
}

function parseLocation(location) {
  const parts = normalizeText(location)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) {
    return { city: parts[0] || '', state: parts[0] || '' };
  }

  return {
    city: parts[0],
    state: parts.slice(1).join(', '),
  };
}

function getHighlight(card, labelPattern) {
  for (const item of Array.from(card.querySelectorAll('.highlight__div'))) {
    const label = getText(item, '.highlight__name');

    if (labelPattern.test(label)) {
      return item;
    }
  }

  return null;
}

function parseFirstNumber(value) {
  const match = normalizeText(value).replace(/,/g, '').match(/[\d.]+/);
  return match ? Number(match[0]) : null;
}

function parseFeeValue(value) {
  const matches = Array.from(normalizeText(value).replace(/,/g, '').matchAll(/([\d.]+)\s*(cr|crore|l|lac|lakh|k)?/gi));
  const numbers = matches
    .map((match) => {
      const amount = Number(match[1]);
      const unit = (match[2] || '').toLowerCase();

      if (!Number.isFinite(amount)) return null;
      if (unit === 'cr' || unit === 'crore') return amount * 100;
      if (unit === 'k') return amount / 100;
      return amount;
    })
    .filter((amount) => amount !== null);

  return numbers.length ? Math.max(...numbers) : null;
}

function feeBucket(feeValue) {
  if (feeValue === null) return 'Fee not listed';
  if (feeValue < 1) return 'Under 1L';
  if (feeValue <= 5) return '1L - 5L';
  if (feeValue <= 10) return '5L - 10L';
  return 'Above 10L';
}

function courseBucket(courseCount) {
  if (courseCount === null) return 'Courses not listed';
  if (courseCount <= 5) return '1 - 5 courses';
  if (courseCount <= 15) return '6 - 15 courses';
  return '16+ courses';
}

function extractCardData(card, index) {
  const name = getText(card, '.college__name a') || `College ${index + 1}`;
  const location = getText(card, '.college__location');
  const { city, state } = parseLocation(location);
  const ownership = getText(card, '.college__affiliation');
  const rank = parseFirstNumber(getText(card, '.college__rank'));
  const courseText = normalizeText(getHighlight(card, /courses?/i)?.textContent);
  const feeText = normalizeText(getHighlight(card, /fees?/i)?.textContent);
  const examHighlight = getHighlight(card, /exam/i);
  const exams = Array.from(examHighlight?.querySelectorAll('a') || [])
    .map((exam) => normalizeText(exam.textContent))
    .filter(Boolean);
  const courseCount = parseFirstNumber(courseText);
  const feeValue = parseFeeValue(feeText);
  const searchText = [name, location, ownership, courseText, feeText, exams.join(' '), card.textContent]
    .join(' ')
    .toLowerCase();

  card.dataset.reactFilterIndex = String(index);

  return {
    card,
    index,
    name,
    location,
    city,
    state,
    ownership,
    rank,
    courseCount,
    courseBucket: courseBucket(courseCount),
    feeValue,
    feeBucket: feeBucket(feeValue),
    exams,
    searchText,
  };
}

function getCountedOptions(values, extraCounts = new Map()) {
  const counts = new Map(extraCounts);

  values.filter(Boolean).forEach((value) => {
    if (extraCounts.has(value)) return;
    counts.set(value, (counts.get(value) || 0) + 1);
  });

  return Array.from(counts, ([value, count]) => ({ value, count }))
    .filter((option) => option.value)
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function getSuggestedCityCounts(root) {
  const counts = new Map();

  root.querySelectorAll('.filter__by__exam .exam__list li').forEach((item) => {
    const text = normalizeText(item.textContent);
    const match = text.match(/^(.+?)\s*\((\d+)\)$/);

    if (match) {
      counts.set(match[1].trim(), Number(match[2]));
    }
  });

  return counts;
}

function createFilterGroup(title, groupName, options) {
  if (!options.length) return null;

  const group = document.createElement('section');
  group.className = 'react-filter-group';
  group.dataset.filterGroupWrap = groupName;

  const heading = document.createElement('h3');
  heading.textContent = title;
  group.appendChild(heading);

  const list = document.createElement('div');
  list.className = 'react-filter-options';

  options.forEach(({ value, count }) => {
    const label = document.createElement('label');
    label.className = 'react-filter-option';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = value;
    input.dataset.filterGroup = groupName;

    const text = document.createElement('span');
    text.textContent = value;

    const total = document.createElement('small');
    total.textContent = String(count);

    label.append(input, text, total);
    list.appendChild(label);
  });

  group.appendChild(list);
  return group;
}

const DEFAULT_FILTER_STATES = ['Delhi', 'Haryana', 'Karnataka', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Bihar', 'Gujarat', 'Kerala', 'Odisha'];
const DEFAULT_FILTER_CITIES = ['Bangalore', 'Chennai', 'Delhi', 'Hyderabad', 'Jaipur', 'Kolkata', 'Mumbai', 'Noida', 'Panipat', 'Pune', 'Gurugram', 'Lucknow', 'Patna', 'Ahmedabad'];
const DEFAULT_FILTER_OWNERSHIP = ['Government', 'Private', 'Semi-Govt'];
const DEFAULT_FILTER_EXAMS = ['AIIMS B.Sc Nursing Exam', 'NEET UG', 'RUHS Nursing Entrance', 'CAT', 'GATE', 'GPAT'];
const DEFAULT_FILTER_FEES = ['Under 1L', '1L - 5L', '5L - 10L', 'Above 10L'];

function buildCollegeFilterPanel(root, records = []) {
  const sidebar = root.querySelector('.all-college-ajax');
  if (!sidebar) return null;

  sidebar.innerHTML = '';
  sidebar.classList.add('react-filter-sidebar');
  sidebar.closest('.row')?.classList.add('react-filter-layout');

  const panel = document.createElement('aside');
  panel.className = 'react-filter-panel';
  panel.setAttribute('aria-label', 'College filters');

  const header = document.createElement('div');
  header.className = 'react-filter-header';

  const title = document.createElement('h2');
  title.textContent = 'Filters';

  const clear = document.createElement('button');
  clear.type = 'button';
  clear.textContent = 'Clear All';
  clear.dataset.reactFilterClear = 'true';

  header.append(title, clear);
  panel.appendChild(header);

  const searchLabel = document.createElement('label');
  searchLabel.className = 'react-filter-search';

  const searchText = document.createElement('span');
  searchText.textContent = 'College Name';

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.placeholder = 'Search college, city, exam';
  searchInput.autocomplete = 'off';
  searchInput.dataset.reactFilterSearch = 'true';

  searchLabel.append(searchText, searchInput);
  panel.appendChild(searchLabel);

  const stateOpts = getCountedOptions(records.map((record) => record.state));
  const cityOpts = getCountedOptions(records.map((record) => record.city), getSuggestedCityCounts(root));
  const collegeOpts = getCountedOptions(records.map((record) => record.name));
  const ownershipOpts = getCountedOptions(records.map((record) => record.ownership));
  const examOpts = getCountedOptions(records.flatMap((record) => record.exams));
  const courseOpts = getCountedOptions(records.map((record) => record.courseBucket));
  const feeOpts = getCountedOptions(records.map((record) => record.feeBucket));

  const finalStateOpts = stateOpts.length > 0 ? stateOpts : DEFAULT_FILTER_STATES.map(s => ({ value: s, count: 0 }));
  const finalCityOpts = cityOpts.length > 0 ? cityOpts : DEFAULT_FILTER_CITIES.map(c => ({ value: c, count: 0 }));
  const finalOwnershipOpts = ownershipOpts.length > 0 ? ownershipOpts : DEFAULT_FILTER_OWNERSHIP.map(o => ({ value: o, count: 0 }));
  const finalExamOpts = examOpts.length > 0 ? examOpts : DEFAULT_FILTER_EXAMS.map(e => ({ value: e, count: 0 }));
  const finalFeeOpts = feeOpts.length > 0 ? feeOpts : DEFAULT_FILTER_FEES.map(f => ({ value: f, count: 0 }));

  const groups = [
    createFilterGroup('State Wise', 'state', finalStateOpts),
    createFilterGroup('City Wise', 'city', finalCityOpts),
    collegeOpts.length > 0 ? createFilterGroup('College Wise', 'college', collegeOpts) : null,
    createFilterGroup('Ownership', 'ownership', finalOwnershipOpts),
    createFilterGroup('Exam Accepted', 'exam', finalExamOpts),
    courseOpts.length > 0 ? createFilterGroup('Course Count', 'course', courseOpts) : null,
    createFilterGroup('Fee Range', 'fee', finalFeeOpts),
  ].filter(Boolean);

  panel.append(...groups);
  sidebar.appendChild(panel);

  return panel;
}

function labelForGroup(group) {
  return {
    program: 'Course',
    specialization: 'Specialisation',
    city: 'City',
    college: 'College',
    course: 'Courses',
    exam: 'Exam',
    fee: 'Fees',
    ownership: 'Ownership',
    state: 'State',
  }[group] || group;
}

function hydrateActionButtons(root) {
  root.querySelectorAll('.leadFilterData, .download__brochure, .primaryBtn, [data-title*="Download"]').forEach((button) => {
    const title = (button.getAttribute('data-title') || '').toLowerCase();
    const currentText = (button.textContent || '').trim().toLowerCase();

    if (currentText.includes('download') || title.includes('download')) {
      button.textContent = 'View College';
      button.setAttribute('data-title', 'View College');
      button.classList.add('view-details-btn');
    } else if (!normalizeText(button.textContent)) {
      const text = title.includes('counselling') || title.includes('counsel')
        ? 'Talk to Experts'
        : 'Apply Now';
      button.textContent = text;
    }

    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
  });
}

function findHomeSection(root, headingText) {
  const requested = headingText.toLowerCase();

  return Array.from(root.querySelectorAll('.indexSection')).find((section) => {
    return normalizeText(section.querySelector('h2')?.textContent).toLowerCase() === requested;
  });
}

function getPreviewItems(section, limit = 5) {
  if (!section) return [];

  return Array.from(section.querySelectorAll('.displayCard'))
    .map((card) => {
      const link = card.matches('a') ? card : card.querySelector('a');
      const image = card.querySelector('img');
      const title = getText(card, '.widgetCardHeading') || normalizeText(link?.textContent);
      const href = link?.getAttribute('href');

      if (!title) return null;

      return {
        href,
        title,
        imageAlt: image?.getAttribute('alt') || title,
        imageSrc: image?.getAttribute('src') || image?.getAttribute('data-src') || '',
      };
    })
    .filter(Boolean)
    .slice(0, limit);
}

const STREAM_COLLEGE_ARTICLES = {
  agriculture: {
    recent: [
      { title: "Govt. IToT Jaipur Agri-Tech & Skill Training Admissions 2026", imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-d70faa0707fb2820ac6a112fcd0fd316.webp" },
      { title: "NSTI Panipat Agricultural Skill & Technology Workshop Schedule 2026", imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-09ff18767cf68d1ea75c62511e3b8320.webp" },
      { title: "Govt. IToT Dausa & Karauli Agri-Business Counseling Matrix 2026", imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-c19be755c26cda9c24594f6e7e42e8ac.webp" }
    ],
    popular: [
      { title: "Govt. IToT Malkangiri & Jharsuguda Agri-Tech Placement Drives", imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-f2a90f000a8fdc33d2773231b003ef83.webp" },
      { title: "NSTI Jodhpur Agriculture Technology & Equipment Guide 2026", imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-a9a300edebee2f25421a5b75f9060e45.webp" }
    ]
  },
  medical: {
    recent: [
      { title: "NSTI Panipat Medical Tech & Healthcare Skill Admissions 2026 Guide", imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-d70faa0707fb2820ac6a112fcd0fd316.webp" },
      { title: "Govt. IToT Jaipur Medical Equipment & Healthcare Skill Diploma", imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-09ff18767cf68d1ea75c62511e3b8320.webp" },
      { title: "NSTI Patna Medical Skill Training Center: Seat Matrix & Dates 2026", imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-c19be755c26cda9c24594f6e7e42e8ac.webp" }
    ],
    popular: [
      { title: "Syadwad IToT Baghpat Paramedical & Health Science Fee Structure", imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-f2a90f000a8fdc33d2773231b003ef83.webp" },
      { title: "Govt IToT Udhampur & Anantnag Medical Tech Cutoffs 2026", imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-a9a300edebee2f25421a5b75f9060e45.webp" }
    ]
  },
  pharmacy: {
    recent: [
      { title: "Govt. IToT Nashik & Amravati Diploma in Pharmacy Tech Admissions 2026", imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-d70faa0707fb2820ac6a112fcd0fd316.webp" },
      { title: "NSTI Mumbai Advanced Pharmacy & Skill Certification Open 2026", imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-09ff18767cf68d1ea75c62511e3b8320.webp" },
      { title: "GITI Aliganj Lucknow Pharmacy Tech Placement Reports 2026", imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-beea85bdef2068ddecd646eea1cf4313.webp" }
    ],
    popular: [
      { title: "NSTI Calicut & Jodhpur Pharma Tech Lab Assistant Certification", imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-f2a90f000a8fdc33d2773231b003ef83.webp" },
      { title: "Govt. IToT Lalru & Fazilka Pharmacy Counseling Matrix 2026", imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-a9a300edebee2f25421a5b75f9060e45.webp" }
    ]
  },
  engineering: {
    recent: [
      { title: "NSTI Panipat Advanced Technical & Engineering Skill Diploma 2026", imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-d70faa0707fb2820ac6a112fcd0fd316.webp" },
      { title: "Govt. IToT Jaipur Computer Science & Tech Certification Programs", imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-09ff18767cf68d1ea75c62511e3b8320.webp" },
      { title: "NSTI Patna Workshop & Technical Skill Cell Record Placements 2026", imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-c19be755c26cda9c24594f6e7e42e8ac.webp" }
    ],
    popular: [
      { title: "NSTI Jodhpur & Kolkata Technical Skills & Engineering Placements 2026", imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-f2a90f000a8fdc33d2773231b003ef83.webp" },
      { title: "Jain IToT Fazilka & Govt IToT Saket-Meerut Cutoff Matrix 2026", imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-a9a300edebee2f25421a5b75f9060e45.webp" }
    ]
  }
};

function fillHomeArticleList(list, items, clearExisting = false) {
  if (!list || !items || !items.length) return;

  if (clearExisting || !list.children.length) {
    list.innerHTML = '';
  } else if (list.children.length && !clearExisting) {
    return;
  }

  items.forEach((item) => {
    const entry = document.createElement('li');
    const link = document.createElement('a');
    const title = document.createElement('h3');

    link.href = item.href || '#';
    title.textContent = item.title;

    if (item.imageSrc) {
      const image = document.createElement('img');
      image.src = item.imageSrc;
      image.alt = item.title;
      image.loading = 'lazy';
      link.appendChild(image);
    }

    link.appendChild(title);
    entry.appendChild(link);
    list.appendChild(entry);
  });
}

function getStreamArticles(tabKey, tabTitle) {
  const normalizedKey = (tabKey || tabTitle || '').toLowerCase().trim();
  if (STREAM_COLLEGE_ARTICLES[normalizedKey]) {
    return STREAM_COLLEGE_ARTICLES[normalizedKey];
  }

  const titleText = tabTitle || tabKey || 'General';
  return {
    recent: [
      { title: `NSTI Panipat ${titleText} Tech & Skill Admissions 2026: Application Process`, imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-d70faa0707fb2820ac6a112fcd0fd316.webp" },
      { title: `Govt. IToT Jaipur ${titleText} Diploma & Scholarship Scheme 2026`, imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-09ff18767cf68d1ea75c62511e3b8320.webp" },
      { title: `NSTI Patna ${titleText} Workshop & Placement Cell Reports 2026`, imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-c19be755c26cda9c24594f6e7e42e8ac.webp" }
    ],
    popular: [
      { title: `NSTI Mumbai & GITI Lucknow ${titleText} Advanced Certification 2026`, imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-f2a90f000a8fdc33d2773231b003ef83.webp" },
      { title: `NSTI Jodhpur & Calicut ${titleText} Cutoffs & Counseling Matrix 2026`, imageSrc: "https://media.getmyuni.com/assets/images/articles/articles-a9a300edebee2f25421a5b75f9060e45.webp" }
    ]
  };
}

function handleArticleTabClick(root, tabElement) {
  const triggerGroup = tabElement.closest('ul') || tabElement.parentElement;
  triggerGroup?.querySelectorAll('a, li').forEach((el) => el.classList.remove('activeLink', 'active'));
  
  const anchor = tabElement.closest('a') || tabElement.querySelector('a') || tabElement;
  anchor.classList.add('activeLink', 'active');
  if (anchor.parentElement && anchor.parentElement.tagName === 'LI') {
    anchor.parentElement.classList.add('active');
  }

  const tabKey = anchor.getAttribute('data-tab') || '';
  const tabTitle = anchor.getAttribute('title') || anchor.textContent || '';
  const articles = getStreamArticles(tabKey, tabTitle);

  fillHomeArticleList(root.querySelector('#recentArticleHome'), articles.recent, true);
  fillHomeArticleList(root.querySelector('#popularArticleHome'), articles.popular, true);
}

function hydrateHomeArticleLists(root) {
  const defaultRecent = getPreviewItems(findHomeSection(root, 'Latest Articles'));
  const defaultPopular = getPreviewItems(findHomeSection(root, 'Latest News'));

  if (defaultRecent.length) {
    fillHomeArticleList(root.querySelector('#recentArticleHome'), defaultRecent, true);
  } else {
    fillHomeArticleList(root.querySelector('#recentArticleHome'), getStreamArticles('medical').recent, true);
  }

  if (defaultPopular.length) {
    fillHomeArticleList(root.querySelector('#popularArticleHome'), defaultPopular, true);
  } else {
    fillHomeArticleList(root.querySelector('#popularArticleHome'), getStreamArticles('medical').popular, true);
  }
}

function normalizeStudyAbroadLayout(root) {
  const map = root.querySelector('#worldmap');
  if (!map || map.children.length || normalizeText(map.textContent)) return;

  const mapColumn = map.closest('.col-md-6');
  const row = mapColumn?.parentElement;
  const contentColumn = Array.from(row?.children || []).find((child) => child !== mapColumn);

  if (mapColumn) {
    mapColumn.hidden = true;
  }

  contentColumn?.classList.add('react-full-width-study');
}

function initializeCollegeFilters(root) {
  const cards = Array.from(root.querySelectorAll('.filtered__colleges__list .college__card__new'));
  const records = cards.map((card, index) => extractCardData(card, index));
  const panel = buildCollegeFilterPanel(root, records);

  const container = root.querySelector('.filtered__colleges__list');
  if (container) {
    container.innerHTML = '';
    collegesData.forEach((col, idx) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'college__card__new';
      cardEl.id = `search-${col.id || idx}`;
      
      const imageHtml = (col.thumbnail || col.logo || col.image)
        ? `<img width="56" height="56" class="college__image" src="${col.thumbnail || col.logo || col.image}" alt="${col.name}" />`
        : `<div class="college__image flex items-center justify-center bg-red-50 text-red-600 font-extrabold text-xl rounded-xl w-14 h-14 border border-red-100 shrink-0">${(col.name || 'C').charAt(0).toUpperCase()}</div>`;

      cardEl.innerHTML = `
        <div class="card__header__row">
          <div class="college__detail__grid">
            ${imageHtml}
            <div class="college__detail__row">
              <h2 class="college__name">
                <a href="/college-details?id=${col.id}" title="${col.name}">${col.name}</a>
              </h2>
              <div class="detail__list__mobile">
                <span class="list__style college__location">${col.city || ''}${col.state ? ', ' + col.state : ''}</span>
                <span class="list__style college__affiliation">${col.sector || 'Government'}</span>
                <a class="list__style list__style__rating" title="${col.name} Reviews" href="/college-details?id=${col.id}">
                  <span class="list__style college__rating">
                    <span class="spriteIcon__2 review__star__icon"></span>
                    ${col.rating || '4.5'}
                  </span>
                </a>
              </div>
            </div>
          </div>
          <div class="like__compare__grid desktopOnly">
            <button type="button" class="compare__icon spriteIcon__2 compareIcon compare-btn" data-college-id="${col.id}" data-college-name="${col.name}" title="Compare College" aria-label="Compare College"></button>
          </div>
        </div>
        <div class="summary-text fsdfsdfs">
          <p class="template-text1 template-text add-read-more show-less-content">
            ${col.description || (col.name + ' is a recognized institute in ' + (col.city || 'India') + '.')}
          </p>
        </div>
        <div class="highlight__cta__row">
          <div class="highlights__grid">
            <div class="highlight__div">
              <h3 class="highlight__name">Courses Offered</h3>
              <span class="highlight__value">
                <h3><a title="${col.name} Courses">${col.coursesCount || '12'} Courses</a></h3>
              </span>
            </div>
            <div class="highlight__div exam__accepted__div">
              <h3 class="highlight__name">Exam Accepted</h3>
              <h3 class="highlight__value">
                <a>${Array.isArray(col.examsAccepted) ? col.examsAccepted.join(', ') : 'Entrance Exam'}</a>
              </h3>
            </div>
            <div class="highlight__div">
              <h3 class="highlight__name">Tuition Fees Range</h3>
              <h3 class="highlight__value">${col.tuitionFeesDisplay || '-/-'}</h3>
            </div>
            <div class="highlight__div">
              <h3 class="highlight__name">Gender Acceptance</h3>
              <h3 class="highlight__value">${col.genderAcceptance || 'Co-ed'}</h3>
            </div>
          </div>
          <div class="cta__grid flex gap-2">
            <a href="/college-details?id=${col.id}" class="cta__div lead-cta-college-filter-1 view-details-btn" data-title="View College" data-description="${col.name}">View College</a>
            <a class="leadFilterData primaryBtn lead-cta-college-filter-2 apply-now-btn" data-title="Apply Now" data-description="${col.name}">Apply Now</a>
          </div>
        </div>
      `;
      container.appendChild(cardEl);
    });
  }

  const countHeading = root.querySelector('.filtered__college_count');
  if (countHeading) {
    countHeading.textContent = `Showing ${collegesData.length} Colleges`;
  }

  if (!panel) return undefined;

  const selected = {
    program: new Set(),
    specialization: new Set(),
    city: new Set(),
    college: new Set(),
    course: new Set(),
    exam: new Set(),
    fee: new Set(),
    ownership: new Set(),
    state: new Set(),
  };
  let query = '';

  const externalSearch = root.querySelector('.search-listing');
  const selectedContainer = root.querySelector('.filter__selected__container #selectedFilters');
  const sortSelect = root.querySelector('#college-sort');
  const noResults = document.createElement('div');
  noResults.className = 'react-filter-empty';
  noResults.textContent = 'No colleges match these filters.';
  noResults.hidden = true;
  root.querySelector('.searchedcollegeList')?.appendChild(noResults);

  if (countHeading && !countHeading.dataset.originalText) {
    countHeading.dataset.originalText = normalizeText(countHeading.textContent);
  }

  function hasActiveFilters() {
    return Boolean(query) || Object.values(selected).some((values) => values.size > 0);
  }

  function renderSelectedChips() {
    selectedContainer?.querySelectorAll('[data-react-filter-chip]').forEach((chip) => chip.remove());

    if (!selectedContainer) return;

    Object.entries(selected).forEach(([group, values]) => {
      values.forEach((value) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'filter__selected react-filter-chip';
        chip.dataset.reactFilterChip = 'true';
        chip.dataset.filterGroup = group;
        chip.value = value;
        chip.textContent = `${labelForGroup(group)}: ${value}`;

        const close = document.createElement('i');
        close.className = 'spriteIcon small__close__icon remove-college-filter';
        chip.appendChild(close);
        selectedContainer.appendChild(chip);
      });
    });
  }

  function recordMatches(record) {
    if (query && !record.searchText.includes(query.toLowerCase())) return false;
    for (const group of ['program', 'specialization']) {
      if (selected[group].size && ![...selected[group]].some(v => matchesFilter(record, group, v))) return false;
    }
    if (selected.state.size && ![...selected.state].some(v => matchesFilter(record, 'state', v))) return false;
    if (selected.city.size && ![...selected.city].some(v => matchesFilter(record, 'city', v))) return false;
    if (selected.college.size && ![...selected.college].some(v => matchesFilter(record, 'college', v))) return false;
    if (selected.ownership.size && !selected.ownership.has(record.ownership)) return false;
    if (selected.exam.size && ![...selected.exam].some(v => matchesFilter(record, 'exam', v))) return false;
    if (selected.course.size && !selected.course.has(record.courseBucket)) return false;
    if (selected.fee.size && !selected.fee.has(record.feeBucket)) return false;
    return true;
  }

  function applyFilters() {
    const active = hasActiveFilters();
    let visibleCount = 0;

    records.forEach((record) => {
      const isVisible = recordMatches(record);
      record.card.hidden = !isVisible;
      record.card.classList.toggle('react-filter-hidden', !isVisible);
      if (isVisible) visibleCount += 1;
    });

    root.querySelectorAll('.filter__by__exam').forEach((widget) => {
      widget.hidden = active;
    });

    if (countHeading) {
      countHeading.textContent = active
        ? `Showing ${visibleCount} Matching Colleges`
        : countHeading.dataset.originalText || `Showing ${visibleCount} Colleges`;
    }

    noResults.hidden = visibleCount > 0;
    renderSelectedChips();
  }

  function clearFilters() {
    query = '';
    Object.values(selected).forEach((values) => values.clear());
    panel.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      input.checked = false;
    });
    panel.querySelectorAll('input[type="search"]').forEach((input) => {
      input.value = '';
    });

    if (externalSearch) externalSearch.value = '';
    if (sortSelect) sortSelect.value = 'position';
    applyFilters();
  }

  function selectValue(group, value) {
    if (!selected[group] || !value) return;

    selected[group].add(value);
    panel.querySelectorAll(`input[data-filter-group="${group}"]`).forEach((input) => {
      input.checked = input.value === value || input.checked;
    });
    applyFilters();
  }

  function sortCards() {
    const container = root.querySelector('.searchedcollegeList');
    if (!container || !sortSelect) return;

    const sortValue = sortSelect.value;
    const sortedRecords = [...records].sort((a, b) => {
      if (sortValue === 'rank') return (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER);
      if (sortValue === 'highest_fee') return (b.feeValue ?? -1) - (a.feeValue ?? -1);
      if (sortValue === 'lowest_fee') return (a.feeValue ?? Number.MAX_SAFE_INTEGER) - (b.feeValue ?? Number.MAX_SAFE_INTEGER);
      return a.index - b.index;
    });

    sortedRecords.forEach((record) => container.appendChild(record.card));
    container.appendChild(noResults);
  }

  function handlePanelInput(event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.matches('[data-react-filter-search]')) return;

    query = normalizeText(target.value).toLowerCase();
    if (externalSearch && externalSearch.value !== target.value) externalSearch.value = target.value;
    applyFilters();
  }

  function handlePanelChange(event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.dataset.filterGroup) return;

    const values = selected[target.dataset.filterGroup];
    if (!values) return;

    if (target.checked) {
      values.add(target.value);
    } else {
      values.delete(target.value);
    }

    applyFilters();
  }

  function handleExternalSearch(event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;

    query = normalizeText(target.value).toLowerCase();
    const panelSearch = panel.querySelector('[data-react-filter-search]');
    if (panelSearch && panelSearch.value !== target.value) panelSearch.value = target.value;
    applyFilters();
  }

  function handleSortChange() {
    sortCards();
    applyFilters();
  }

  function handleFilterClick(event) {
    const clicked = event.target;
    if (!(clicked instanceof Element)) return;

    const clearButton = clicked.closest('[data-react-filter-clear], #clearAllClg');
    if (clearButton && root.contains(clearButton)) {
      event.preventDefault();
      event.stopPropagation();
      clearFilters();
      return;
    }

    const chip = clicked.closest('[data-react-filter-chip]');
    if (chip && root.contains(chip)) {
      event.preventDefault();
      event.stopPropagation();
      const group = chip.getAttribute('data-filter-group');
      const value = chip.value;

      if (selected[group]) {
        selected[group].delete(value);
        panel.querySelectorAll(`input[data-filter-group="${group}"]`).forEach((input) => {
          if (input.value === value) input.checked = false;
        });
        applyFilters();
      }
      return;
    }

    const removeSearch = clicked.closest('.search-remove');
    if (removeSearch && root.contains(removeSearch)) {
      event.preventDefault();
      event.stopPropagation();
      query = '';
      if (externalSearch) externalSearch.value = '';
      const panelSearch = panel.querySelector('[data-react-filter-search]');
      if (panelSearch) panelSearch.value = '';
      applyFilters();
      return;
    }

    const citySuggestion = clicked.closest('.filter__by__exam a');
    if (citySuggestion && root.contains(citySuggestion)) {
      const city = normalizeText(citySuggestion.textContent).replace(/\s*\(\d+\)\s*$/, '');

      event.preventDefault();
      event.stopPropagation();
      selectValue('city', city);
    }
  }

  const initial = getDropdownSelection(window.location.href).filter;
  if (initial && selected[initial.group]) {
    const { group, value } = initial;
    const inputs = [...panel.querySelectorAll('input[data-filter-group]')];
    if (!inputs.some(input => input.dataset.filterGroup === group && input.value === value)) {
      const optionGroup = createFilterGroup(labelForGroup(group), group, [{ value, count: records.filter(record => matchesFilter(record, group, value)).length }]);
      const existing = panel.querySelector(`[data-filter-group-wrap="${group}"] .react-filter-options`);
      if (existing) existing.append(...optionGroup.querySelector('.react-filter-options').children);
      else panel.appendChild(optionGroup);
    }
    selectValue(group, value);
  }

  panel.addEventListener('input', handlePanelInput);
  panel.addEventListener('change', handlePanelChange);
  externalSearch?.addEventListener('input', handleExternalSearch);
  sortSelect?.addEventListener('change', handleSortChange);
  root.addEventListener('click', handleFilterClick, true);
  applyFilters();

  return () => {
    panel.removeEventListener('input', handlePanelInput);
    panel.removeEventListener('change', handlePanelChange);
    externalSearch?.removeEventListener('input', handleExternalSearch);
    sortSelect?.removeEventListener('change', handleSortChange);
    root.removeEventListener('click', handleFilterClick, true);
  };
}

function resetPageOverflow() {
  document.documentElement.style.overflowY = 'auto';
  document.body.style.overflowY = 'auto';
  document.body.style.position = '';
}

function resetManagedHead() {
  document.querySelectorAll(`[${MANAGED_ATTR}]`).forEach((node) => node.remove());
}

function appendHead(page) {
  resetManagedHead();

  document.title = page.title || page.name || 'Nurshing Azz';

  page.head?.meta?.forEach((attributes) => {
    if (String(attributes['http-equiv'] || '').toLowerCase() === 'refresh') return;
    const meta = document.createElement('meta');

    Object.entries(attributes).forEach(([name, value]) => {
      if (/^on/i.test(name) || value == null) return;
      meta.setAttribute(name, String(value));
    });

    meta.setAttribute(MANAGED_ATTR, 'true');
    document.head.appendChild(meta);
  });

  page.head?.links?.forEach((attributes) => {
    const rel = String(attributes.rel || '').toLowerCase();
    const stylesheetHref = rel === 'stylesheet' ? getStylesheetHref(attributes.href) : null;

    if (rel === 'stylesheet' && !stylesheetHref) return;

    const link = document.createElement('link');

    Object.entries(attributes).forEach(([name, value]) => {
      if (/^on/i.test(name) || value == null) return;
      link.setAttribute(name, String(value));
    });

    if (stylesheetHref) {
      link.setAttribute('href', stylesheetHref);
    }

    if (link.getAttribute('rel') === 'stylesheet' && link.getAttribute('media') === 'print') {
      link.setAttribute('media', 'all');
    }

    link.setAttribute(MANAGED_ATTR, 'true');
    document.head.appendChild(link);
  });

  page.head?.styles?.forEach((css) => {
    const style = document.createElement('style');

    style.textContent = css;
    style.setAttribute(MANAGED_ATTR, 'true');
    document.head.appendChild(style);
  });
}

export default function PageRenderer({ page, onNavigate, children }) {
  const pageRef = useRef(null);

  useEffect(() => {
    let cleanupFilters;
    let cleanupScrollers;

    ensureCompatibilityGlobals();
    appendHead(page);
    resetPageOverflow();

    if (pageRef.current) {
      promoteLazyImages(pageRef.current);
      rewriteStaticLinks(pageRef.current);
      hydrateActionButtons(pageRef.current);
      hydrateHomeArticleLists(pageRef.current);
      normalizeStudyAbroadLayout(pageRef.current);
      cleanupScrollers = initializeHorizontalScrollers(pageRef.current);
      cleanupFilters = initializeCollegeFilters(pageRef.current);
    }

    return () => {
      cleanupFilters?.();
      cleanupScrollers?.();
      resetManagedHead();
      resetPageOverflow();
    };
  }, [page]);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return undefined;

    const handleClick = (event) => {
      const clicked = event.target;
      if (!(clicked instanceof Element)) return;

      const sliderControl = clicked.closest('.scrollLeft, .scrollRight, .btn_left, .btn_right');
      if (sliderControl && root.contains(sliderControl) && scrollHorizontalSlider(sliderControl)) {
        event.preventDefault();
        return;
      }

      const scrollTopButton = clicked.closest('.scrollToTop');
      if (scrollTopButton && root.contains(scrollTopButton)) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const articleTab = clicked.closest('.homePageArticle a, li.homePageArticle');
      if (articleTab && root.contains(articleTab)) {
        event.preventDefault();
        handleArticleTabClick(root, articleTab);
        return;
      }

      const moreButton = clicked.closest('.viewMoreCards');
      if (moreButton && root.contains(moreButton) && revealMoreCards(moreButton)) {
        event.preventDefault();
        return;
      }

      const tabTrigger = clicked.closest('[data-target]');
      if (tabTrigger && root.contains(tabTrigger) && activateTab(root, tabTrigger)) {
        event.preventDefault();
        return;
      }

      const anchor = clicked.closest('a[href]');
      if (!anchor || !root.contains(anchor)) return;

      const href = anchor.getAttribute('href') || '';
      if (href.includes('/college/') || anchor.closest('.displayCard, .college__card__new, .collegeCard')) {
        // Avoid intercepting if it's the Apply Now button
        const isApplyBtn = clicked.closest('.lead-cta-college-filter-1, [data-title*="Apply"]') ||
          (clicked.textContent || '').toLowerCase().includes('apply');

        if (!isApplyBtn) {
          event.preventDefault();
          event.stopPropagation();

          const card = anchor.closest('.displayCard, .college__card__new, .collegeCard, .dataCard') || anchor;
          const collegeId = anchor.getAttribute('data-college-id') || href.replace(/.*\/college\//, '');

          const targetUrl = `/college-details?id=${encodeURIComponent(collegeId)}`;
          if (onNavigate) {
            onNavigate(targetUrl);
          } else {
            window.history.pushState({}, '', targetUrl);
            window.dispatchEvent(new Event('popstate'));
          }
          return;
        }
      }

      const localRoute = getLocalRoute(href);

      if (localRoute === '#') {
        event.preventDefault();
        return;
      }

      if (localRoute && onNavigate && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
        event.preventDefault();
        onNavigate(localRoute);
      }
    };

    root.addEventListener('click', handleClick);
    return () => root.removeEventListener('click', handleClick);
  }, [onNavigate, page]);

  return (
    <div className="converted-page" ref={pageRef}>
      {children}
    </div>
  );
}
