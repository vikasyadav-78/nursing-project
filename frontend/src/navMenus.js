export const abroadMenu = {
  columns: [
    {
      title: 'Study Abroad Options',
      items: [
        ['Canada', '/canada'],
        ['UK', '/uk'],
        ['USA', '/usa'],
        ['Australia', '/australia'],
        ['Germany', '/germany'],
      ],
    },
    {
      title: 'Colleges',
      items: [
        ['Universities in Canada', '/canada/universities'],
        ['Universities in UK', '/uk/universities'],
        ['Universities in USA', '/usa/universities'],
        ['Universities in Australia', '/australia/universities'],
      ],
    },
    {
      title: 'Exams',
      items: [
        ['IELTS', '/exams/ielts'],
        ['TOEFL', '/exams/toefl'],
        ['GRE', '/exams/gre'],
        ['GMAT', '/exams/gmat'],
      ],
    },
    {
      title: 'Resources',
      items: [
        ['Study Abroad', '/study-abroad'],
        ['Scholarships', '/scholarships'],
        ['Education Loan', '/education-loan'],
      ],
    },
  ],
};

export const megaMenus = {
  engineering: {
    columns: [
      { title: 'Colleges By Course', items: [['B.Tech Colleges', '/btech-colleges'], ['M.Tech Colleges', '/mtech-colleges']] },
      {
        title: 'Colleges By State',
        items: [
          ['Maharashtra', '/engineering-colleges/maharashtra'],
          ['Delhi', '/engineering-colleges/delhi'],
          ['Uttar Pradesh', '/engineering-colleges/uttar-pradesh'],
          ['Tamil Nadu', '/engineering-colleges/tamil-nadu'],
          ['Rajasthan', '/engineering-colleges/rajasthan'],
          ['Andhra Pradesh', '/engineering-colleges/andhra-pradesh'],
        ],
        secondTitle: 'Popular Colleges',
        secondItems: [
          ['IIT Kharagpur', '/college/indian-institute-of-technology-iit-kharagpur'],
          ['BMS College of Engineering', '/college/bms-college-of-engineering-bangalore'],
          ['IIT Delhi', '/college/indian-institute-of-technology-iit-delhi'],
        ],
      },
      {
        title: 'Colleges By City',
        items: [
          ['Noida', '/engineering-colleges/noida'],
          ['Mumbai', '/engineering-colleges/mumbai'],
          ['Bangalore', '/engineering-colleges/bangalore'],
          ['Chennai', '/engineering-colleges/chennai'],
          ['Pune', '/engineering-colleges/pune'],
          ['Hyderabad', '/engineering-colleges/hyderabad'],
        ],
      },
      {
        title: 'Colleges By Specialisation',
        items: [
          ['B.Tech Computer Engineering Colleges', '/engineering-colleges/computer-science'],
          ['B.Tech Civil Engineering Colleges', '/engineering-colleges/civil-engineering'],
          ['B.Tech Mechanical Engineering Colleges', '/engineering-colleges/mechanical-engineering'],
          ['M.Tech Computer Engineering Colleges', '/mtech/computer-science-engineering-colleges'],
          ['M.Tech Civil Engineering Colleges', '/mtech/civil-engineering-colleges'],
          ['M.Tech Mechanical Engineering Colleges', '/mtech/mechanical-engineering-colleges'],
        ],
      },
      {
        title: 'Exams',
        items: [
          ['JEE Main', '/exams/jee-main'],
          ['JEE Advanced', '/exams/jee-advanced'],
          ['UPSEE', '/exams/upsee'],
          ['WBJEE', '/exams/wbjee'],
          ['OUCET', '/exams/oucet'],
          ['AP EAMCET', '/exams/ap-eamcet'],
          ['LPUNEST', '/exams/lpunest'],
          ['All Engineering Exams >>', '/exams/engineering'],
        ],
      },
      { title: 'Courses', items: [['B.Tech', '/btech'], ['M.Tech', '/mtech'], ['B.E', '/be'], ['M.E', '/me']] },
    ],
  },
  management: {
    columns: [
      { title: 'Colleges By Course', items: [['MBA Colleges', '/mba-colleges'], ['PGDM Colleges', '/pgdm-colleges'], ['BBA Colleges', '/bba-colleges']] },
      {
        title: 'Colleges By State',
        items: [['Maharashtra', '/mba-colleges/maharashtra'], ['Delhi', '/mba-colleges/delhi'], ['Karnataka', '/mba-colleges/karnataka'], ['Tamil Nadu', '/mba-colleges/tamil-nadu'], ['Uttar Pradesh', '/mba-colleges/uttar-pradesh']],
      },
      {
        title: 'Colleges By City',
        items: [['Mumbai', '/mba-colleges/mumbai'], ['Delhi', '/mba-colleges/delhi'], ['Bangalore', '/mba-colleges/bangalore'], ['Pune', '/mba-colleges/pune'], ['Hyderabad', '/mba-colleges/hyderabad']],
      },
      {
        title: 'Exams',
        items: [['CAT', '/exams/cat'], ['XAT', '/exams/xat'], ['MAT', '/exams/mat'], ['CMAT', '/exams/cmat'], ['NMAT', '/exams/nmat'], ['All Management Exams >>', '/exams/management']],
      },
      { title: 'Courses', items: [['MBA', '/mba'], ['PGDM', '/pgdm'], ['BBA', '/bba'], ['Executive MBA', '/executive-mba']] },
    ],
  },
  medical: {
    columns: [
      { title: 'Colleges By Course', items: [['MBBS Colleges', '/mbbs-colleges'], ['BDS Colleges', '/bds-colleges'], ['BAMS Colleges', '/bams-colleges'], ['BHMS Colleges', '/bhms-colleges']] },
      {
        title: 'Colleges By State',
        items: [['Maharashtra', '/medical-colleges/maharashtra'], ['Delhi', '/medical-colleges/delhi'], ['Karnataka', '/medical-colleges/karnataka'], ['Tamil Nadu', '/medical-colleges/tamil-nadu'], ['Uttar Pradesh', '/medical-colleges/uttar-pradesh']],
      },
      {
        title: 'Colleges By City',
        items: [['Delhi', '/medical-colleges/delhi'], ['Chennai', '/medical-colleges/chennai'], ['Bangalore', '/medical-colleges/bangalore'], ['Mumbai', '/medical-colleges/mumbai'], ['Pune', '/medical-colleges/pune']],
      },
      { title: 'Exams', items: [['NEET', '/exams/neet'], ['NEET PG', '/exams/neet-pg'], ['INI CET', '/exams/ini-cet'], ['AIIMS', '/exams/aiims'], ['All Medical Exams >>', '/exams/medical']] },
      { title: 'Courses', items: [['MBBS', '/mbbs'], ['MD', '/md'], ['MS', '/ms'], ['BDS', '/bds'], ['BAMS', '/bams']] },
    ],
  },
  science: {
    columns: [
      { title: 'Colleges By Course', items: [['B.Sc Colleges', '/bsc-colleges'], ['M.Sc Colleges', '/msc-colleges'], ['BCA Colleges', '/bca-colleges']] },
      { title: 'Colleges By State', items: [['Maharashtra', '/science-colleges/maharashtra'], ['Delhi', '/science-colleges/delhi'], ['Tamil Nadu', '/science-colleges/tamil-nadu'], ['Karnataka', '/science-colleges/karnataka']] },
      { title: 'Colleges By City', items: [['Bangalore', '/science-colleges/bangalore'], ['Chennai', '/science-colleges/chennai'], ['Mumbai', '/science-colleges/mumbai'], ['Pune', '/science-colleges/pune']] },
      { title: 'Exams', items: [['CUET', '/exams/cuet'], ['IIT JAM', '/exams/iit-jam'], ['NEST', '/exams/nest'], ['All Science Exams >>', '/exams/science']] },
      { title: 'Courses', items: [['B.Sc', '/bsc'], ['M.Sc', '/msc'], ['BCA', '/bca'], ['MCA', '/mca']] },
    ],
  },
  commerce: {
    columns: [
      { title: 'Colleges By Course', items: [['B.Com Colleges', '/bcom-colleges'], ['M.Com Colleges', '/mcom-colleges'], ['CA Colleges', '/ca-colleges']] },
      { title: 'Colleges By State', items: [['Maharashtra', '/commerce-colleges/maharashtra'], ['Delhi', '/commerce-colleges/delhi'], ['Tamil Nadu', '/commerce-colleges/tamil-nadu'], ['Karnataka', '/commerce-colleges/karnataka']] },
      { title: 'Colleges By City', items: [['Mumbai', '/commerce-colleges/mumbai'], ['Delhi', '/commerce-colleges/delhi'], ['Chennai', '/commerce-colleges/chennai'], ['Bangalore', '/commerce-colleges/bangalore'], ['Kolkata', '/commerce-colleges/kolkata']] },
      { title: 'Exams', items: [['CUET', '/exams/cuet'], ['CA CPT', '/exams/ca-cpt'], ['CS Executive', '/exams/cs-executive'], ['All Commerce Exams >>', '/exams/commerce']] },
      { title: 'Courses', items: [['B.Com', '/bcom'], ['M.Com', '/mcom'], ['CA', '/ca'], ['CS', '/cs']] },
    ],
  },
  pharmacy: {
    columns: [
      { title: 'Colleges By Course', items: [['B.Pharm Colleges', '/bpharm-colleges'], ['D.Pharm Colleges', '/dpharm-colleges'], ['M.Pharm Colleges', '/mpharm-colleges']] },
      { title: 'Colleges By State', items: [['Maharashtra', '/pharmacy-colleges/maharashtra'], ['Delhi', '/pharmacy-colleges/delhi'], ['Uttar Pradesh', '/pharmacy-colleges/uttar-pradesh'], ['Tamil Nadu', '/pharmacy-colleges/tamil-nadu'], ['Rajasthan', '/pharmacy-colleges/rajasthan'], ['Andhra Pradesh', '/pharmacy-colleges/andhra-pradesh']] },
      { title: 'Colleges By City', items: [['Noida', '/pharmacy-colleges/noida'], ['Mumbai', '/pharmacy-colleges/mumbai'], ['Bangalore', '/pharmacy-colleges/bangalore'], ['Chennai', '/pharmacy-colleges/chennai'], ['Pune', '/pharmacy-colleges/pune'], ['Hyderabad', '/pharmacy-colleges/hyderabad']] },
      { title: 'Exams', items: [['UPTU', '/exams/upsee'], ['MAHE-OET', '/exams/met'], ['KEAM', '/exams/keam'], ['KCET', '/exams/kcet'], ['GPAT', '/exams/gpat'], ['RPET-Pharmacy', '/exams/rpet-pharmacy'], ['All Pharmacy Exams >>', '/exams/pharmacy']] },
      { title: 'Courses', items: [['B.Pharm', '/bpharm'], ['D.Pharm', '/dpharm'], ['M.Pharm', '/mpharm']] },
    ],
  },
  paramedical: {
    columns: [
      { title: 'Colleges By Course', items: [['B.Sc Nursing Colleges', '/bsc-nursing-colleges'], ['BPT Colleges', '/bpt-colleges'], ['BMLT Colleges', '/bmlt-colleges'], ['MPT Colleges', '/mpt-colleges']] },
      { title: 'Colleges By State', items: [['Maharashtra', '/paramedical-colleges/maharashtra'], ['Delhi', '/paramedical-colleges/delhi'], ['Tamil Nadu', '/paramedical-colleges/tamil-nadu'], ['Rajasthan', '/paramedical-colleges/rajasthan'], ['Karnataka', '/paramedical-colleges/karnataka']] },
      { title: 'Colleges By City', items: [['Chennai', '/paramedical-colleges/chennai'], ['Jaipur', '/paramedical-colleges/jaipur'], ['Dehradun', '/paramedical-colleges/dehradun'], ['Kolkata', '/paramedical-colleges/kolkata'], ['Bhopal', '/paramedical-colleges/bhopal']] },
      { title: 'Exams', items: [['NEET', '/exams/neet'], ['CUET', '/exams/cuet'], ['AIIMS Nursing', '/exams/aiims-nursing'], ['All Paramedical Exams >>', '/exams/paramedical']] },
      { title: 'Courses', items: [['BPT', '/bpt'], ['B.Sc Nursing', '/bsc-nursing'], ['BMLT', '/bmlt'], ['MPT', '/mpt']] },
    ],
  },
  architecture: {
    columns: [
      { title: 'Colleges By Course', items: [['B.Arch Colleges', '/barch-colleges'], ['M.Arch Colleges', '/march-colleges']] },
      { title: 'Colleges By State', items: [['Maharashtra', '/architecture-colleges/maharashtra'], ['Delhi', '/architecture-colleges/delhi'], ['Tamil Nadu', '/architecture-colleges/tamil-nadu'], ['Karnataka', '/architecture-colleges/karnataka']] },
      { title: 'Colleges By City', items: [['Mumbai', '/architecture-colleges/mumbai'], ['Delhi', '/architecture-colleges/delhi'], ['Chennai', '/architecture-colleges/chennai'], ['Bangalore', '/architecture-colleges/bangalore']] },
      { title: 'Exams', items: [['NATA', '/exams/nata'], ['JEE Main Paper 2', '/exams/jee-main'], ['GATE', '/exams/gate'], ['All Architecture Exams >>', '/exams/architecture']] },
      { title: 'Courses', items: [['B.Arch', '/barch'], ['M.Arch', '/march'], ['Diploma Architecture', '/diploma-in-architecture']] },
    ],
  },
  design: {
    columns: [
      { title: 'Colleges By Course', items: [['B.Des Colleges', '/bdes-colleges'], ['M.Des Colleges', '/mdes-colleges'], ['Fashion Design Colleges', '/fashion-design-colleges']] },
      { title: 'Colleges By State', items: [['Maharashtra', '/design-colleges/maharashtra'], ['Delhi', '/design-colleges/delhi'], ['Rajasthan', '/design-colleges/rajasthan'], ['Tamil Nadu', '/design-colleges/tamil-nadu']] },
      { title: 'Colleges By City', items: [['Jaipur', '/design-colleges/jaipur'], ['Mumbai', '/design-colleges/mumbai'], ['Pune', '/design-colleges/pune'], ['Delhi', '/design-colleges/delhi']] },
      { title: 'Exams', items: [['NID DAT', '/exams/nid-dat'], ['UCEED', '/exams/uceed'], ['CEED', '/exams/ceed'], ['NIFT', '/exams/nift'], ['All Design Exams >>', '/exams/design']] },
      { title: 'Courses', items: [['B.Des', '/bdes'], ['M.Des', '/mdes'], ['B.Sc Design', '/bsc-design']] },
    ],
  },
  hospitality: {
    columns: [
      { title: 'Colleges By Course', items: [['Hotel Management Colleges', '/hotel-management-colleges'], ['BHM Colleges', '/bhm-colleges'], ['BHMCT Colleges', '/bhmct-colleges']] },
      { title: 'Colleges By State', items: [['Maharashtra', '/hotel-management-colleges/maharashtra'], ['Delhi', '/hotel-management-colleges/delhi'], ['Karnataka', '/hotel-management-colleges/karnataka'], ['Tamil Nadu', '/hotel-management-colleges/tamil-nadu']] },
      { title: 'Colleges By City', items: [['Delhi', '/hotel-management-colleges/delhi'], ['Mumbai', '/hotel-management-colleges/mumbai'], ['Bangalore', '/hotel-management-colleges/bangalore'], ['Chennai', '/hotel-management-colleges/chennai']] },
      { title: 'Exams', items: [['NCHMCT JEE', '/exams/nchmct-jee'], ['CUET', '/exams/cuet'], ['AIMA UGAT', '/exams/aima-ugat'], ['All Hospitality Exams >>', '/exams/hotel-management']] },
      { title: 'Courses', items: [['BHM', '/bhm'], ['MHM', '/mhm'], ['BHMCT', '/bhmct'], ['Diploma Hotel Management', '/diploma-in-hotel-management']] },
    ],
  },
  law: {
    columns: [
      { title: 'Colleges By Course', items: [['LLB Colleges', '/llb-colleges'], ['BA LLB Colleges', '/ba-llb-colleges'], ['LLM Colleges', '/llm-colleges']] },
      { title: 'Colleges By State', items: [['Maharashtra', '/law-colleges/maharashtra'], ['Delhi', '/law-colleges/delhi'], ['Uttar Pradesh', '/law-colleges/uttar-pradesh'], ['Rajasthan', '/law-colleges/rajasthan']] },
      { title: 'Colleges By City', items: [['Jaipur', '/law-colleges/jaipur'], ['Lucknow', '/law-colleges/lucknow'], ['Pune', '/law-colleges/pune'], ['Delhi', '/law-colleges/delhi']] },
      { title: 'Exams', items: [['CLAT', '/exams/clat'], ['AILET', '/exams/ailet'], ['LSAT India', '/exams/lsat'], ['MH CET Law', '/exams/mh-cet-law'], ['All Law Exams >>', '/exams/law']] },
      { title: 'Courses', items: [['LLB', '/llb'], ['BA LLB', '/ba-llb'], ['BBA LLB', '/bba-llb'], ['LLM', '/llm']] },
    ],
  },
  veterinary: {
    columns: [
      { title: 'Colleges By Course', items: [['BVSc Colleges', '/bvsc-colleges'], ['MVSc Colleges', '/mvsc-colleges']] },
      { title: 'Colleges By State', items: [['Tamil Nadu', '/veterinary-colleges/tamil-nadu'], ['Maharashtra', '/veterinary-colleges/maharashtra'], ['Rajasthan', '/veterinary-colleges/rajasthan'], ['Uttar Pradesh', '/veterinary-colleges/uttar-pradesh']] },
      { title: 'Colleges By City', items: [['Chennai', '/veterinary-colleges/chennai'], ['Mumbai', '/veterinary-colleges/mumbai'], ['Jaipur', '/veterinary-colleges/jaipur'], ['Hisar', '/veterinary-colleges/hisar']] },
      { title: 'Exams', items: [['NEET', '/exams/neet'], ['AIPVT', '/exams/aipvt'], ['All Veterinary Exams >>', '/exams/veterinary']] },
      { title: 'Courses', items: [['BVSc', '/bvsc'], ['MVSc', '/mvsc'], ['Diploma Veterinary Science', '/diploma-veterinary-science']] },
    ],
  },
  vocational: {
    columns: [
      { title: 'Colleges By Course', items: [['Vocational Courses Colleges', '/vocational-courses-colleges'], ['Diploma Colleges', '/diploma-colleges'], ['ITI Colleges', '/iti-colleges']] },
      { title: 'Colleges By State', items: [['Maharashtra', '/vocational-courses-colleges/maharashtra'], ['Delhi', '/vocational-courses-colleges/delhi'], ['Tamil Nadu', '/vocational-courses-colleges/tamil-nadu'], ['Karnataka', '/vocational-courses-colleges/karnataka']] },
      { title: 'Colleges By City', items: [['Mumbai', '/vocational-courses-colleges/mumbai'], ['Delhi', '/vocational-courses-colleges/delhi'], ['Chennai', '/vocational-courses-colleges/chennai'], ['Bangalore', '/vocational-courses-colleges/bangalore']] },
      { title: 'Exams', items: [['CUET', '/exams/cuet'], ['State Entrance Exams', '/exams'], ['All Vocational Exams >>', '/exams/vocational']] },
      { title: 'Courses', items: [['B.Voc', '/bvoc'], ['Diploma', '/diploma'], ['Certificate Courses', '/certificate-courses']] },
    ],
  },
  arts: {
    columns: [
      { title: 'Colleges By Course', items: [['BA Colleges', '/ba-colleges'], ['MA Colleges', '/ma-colleges'], ['Fine Arts Colleges', '/fine-arts-colleges']] },
      { title: 'Colleges By State', items: [['Maharashtra', '/arts-colleges/maharashtra'], ['Delhi', '/arts-colleges/delhi'], ['Tamil Nadu', '/arts-colleges/tamil-nadu'], ['Karnataka', '/arts-colleges/karnataka']] },
      { title: 'Colleges By City', items: [['Delhi', '/arts-colleges/delhi'], ['Chennai', '/arts-colleges/chennai'], ['Kolkata', '/arts-colleges/kolkata'], ['Pune', '/arts-colleges/pune']] },
      { title: 'Exams', items: [['CUET', '/exams/cuet'], ['TISSNET', '/exams/tissnet'], ['All Arts Exams >>', '/exams/arts']] },
      { title: 'Courses', items: [['BA', '/ba'], ['MA', '/ma'], ['BFA', '/bfa'], ['MFA', '/mfa']] },
    ],
  },
  computer: {
    columns: [
      { title: 'Colleges By Course', items: [['BCA Colleges', '/bca-colleges'], ['MCA Colleges', '/mca-colleges'], ['B.Sc Computer Science Colleges', '/bsc-computer-science-colleges']] },
      { title: 'Colleges By State', items: [['Maharashtra', '/computer-colleges/maharashtra'], ['Delhi', '/computer-colleges/delhi'], ['Tamil Nadu', '/computer-colleges/tamil-nadu'], ['Karnataka', '/computer-colleges/karnataka']] },
      { title: 'Colleges By City', items: [['Pune', '/computer-colleges/pune'], ['Chennai', '/computer-colleges/chennai'], ['Coimbatore', '/computer-colleges/coimbatore'], ['Hyderabad', '/computer-colleges/hyderabad']] },
      { title: 'Exams', items: [['NIMCET', '/exams/nimcet'], ['CUET', '/exams/cuet'], ['TANCET', '/exams/tancet'], ['All Computer Exams >>', '/exams/computer-application']] },
      { title: 'Courses', items: [['BCA', '/bca'], ['MCA', '/mca'], ['B.Sc CS', '/bsc-computer-science'], ['M.Sc CS', '/msc-computer-science']] },
    ],
  },
  dental: {
    columns: [
      { title: 'Colleges By Course', items: [['BDS Colleges', '/bds-colleges'], ['MDS Colleges', '/mds-colleges']] },
      { title: 'Colleges By State', items: [['Maharashtra', '/dental-colleges/maharashtra'], ['Delhi', '/dental-colleges/delhi'], ['Tamil Nadu', '/dental-colleges/tamil-nadu'], ['Karnataka', '/dental-colleges/karnataka']] },
      { title: 'Colleges By City', items: [['Chennai', '/dental-colleges/chennai'], ['Bhopal', '/dental-colleges/bhopal'], ['Pune', '/dental-colleges/pune'], ['Lucknow', '/dental-colleges/lucknow']] },
      { title: 'Exams', items: [['NEET', '/exams/neet'], ['NEET MDS', '/exams/neet-mds'], ['All Dental Exams >>', '/exams/dental']] },
      { title: 'Courses', items: [['BDS', '/bds'], ['MDS', '/mds'], ['Diploma Dental', '/diploma-dental']] },
    ],
  },
  education: {
    columns: [
      { title: 'Colleges By Course', items: [['B.Ed Colleges', '/bed-colleges'], ['M.Ed Colleges', '/med-colleges'], ['D.El.Ed Colleges', '/deled-colleges']] },
      { title: 'Colleges By State', items: [['Maharashtra', '/education-colleges/maharashtra'], ['Delhi', '/education-colleges/delhi'], ['Tamil Nadu', '/education-colleges/tamil-nadu'], ['Uttar Pradesh', '/education-colleges/uttar-pradesh']] },
      { title: 'Colleges By City', items: [['Delhi', '/education-colleges/delhi'], ['Mumbai', '/education-colleges/mumbai'], ['Kolkata', '/education-colleges/kolkata'], ['Meerut', '/education-colleges/meerut']] },
      { title: 'Exams', items: [['CTET', '/exams/ctet'], ['CUET', '/exams/cuet'], ['UP B.Ed JEE', '/exams/up-bed-jee'], ['All Education Exams >>', '/exams/education']] },
      { title: 'Courses', items: [['B.Ed', '/bed'], ['M.Ed', '/med'], ['D.El.Ed', '/deled'], ['B.P.Ed', '/bped']] },
    ],
  },
  logo: abroadMenu,
};

// Reuse the saved category content for menu destinations without standalone files.
export const dropdownPages = new Map();
for (const [slug, menu] of Object.entries(megaMenus)) {
  for (const column of menu.columns) {
    for (const [, path] of [...column.items, ...(column.secondItems || [])]) {
      if (!dropdownPages.has(path)) dropdownPages.set(path, slug);
    }
  }
}
// Shared courses belong to their dedicated category when one is available.
for (const path of ['/bca', '/mca', '/bca-colleges', '/mca-colleges']) dropdownPages.set(path, 'computer');
for (const path of ['/bds', '/mds', '/bds-colleges', '/mds-colleges']) dropdownPages.set(path, 'dental');
dropdownPages.set('/study-abroad', 'logo');

export const dropdownFilters = new Map();
for (const [slug, menu] of Object.entries(megaMenus)) {
  for (const column of menu.columns) {
    for (const [title, items] of [[column.title, column.items], [column.secondTitle, column.secondItems || []]]) {
      for (const [label, path] of items) {
        const group = title === 'Colleges By State' ? 'state'
          : title === 'Colleges By City' ? 'city'
          : title === 'Popular Colleges' ? 'college'
          : title === 'Exams' ? 'exam'
          : title === 'Colleges By Specialisation' ? 'specialization' : 'program';
        const value = label.replace(/ Colleges$/, '');
        const filter = /^All .*Exams/.test(label) || path === '/study-abroad' ? null : { group, value };
        dropdownFilters.set(`${slug}:${path}`, filter);
      }
    }
  }
}
export function getDropdownSelection(location) {
  const url = new URL(location, 'https://site.invalid');
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const requested = url.searchParams.get('category');
  const slug = dropdownFilters.has(`${requested}:${path}`) ? requested : dropdownPages.get(path);
  return { slug, filter: dropdownFilters.get(`${slug}:${path}`) || null };
}
export function matchesFilter(record, group, value) {
  const normalize = (text) => String(text || '').toLowerCase().replace(/bengaluru/g, 'bangalore').replace(/[^a-z0-9]/g, '');
  const needle = normalize(value);
  if (group === 'state' || group === 'city') return normalize(record[group]) === needle;
  if (group === 'college') return normalize(record.name).includes(needle);
  if (group === 'exam') return record.exams.some(exam => normalize(exam) && (normalize(exam).includes(needle) || needle.includes(normalize(exam))));
  return normalize(record.searchText).includes(needle);
}
