# 📌 Frontend APIs Documentation

**Base URL**: `http://localhost:5000/api`

---

## 1. Dynamic Search & Filters

### 🔹 API: `GET /api/search`
* **Kaam**: Unified search, synonym matching (e.g. B.Sc Nursing, GNM), relevance ranking, aur filters.
* **Params**: `q`, `entityType` (`all`, `colleges`, `courses`, `exams`, `blogs`), `state`, `city`, `sector`, `stream`, `minFee`, `maxFee`, `rating`, `exam`, `page`, `limit`
* **Response**:
```json
{
  "success": true,
  "message": "Search query processed successfully",
  "data": {
    "query": "nursing",
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    },
    "results": [
      {
        "id": "col_101",
        "name": "RUHS College of Nursing",
        "code": "RUHS-NURS",
        "sector": "Government",
        "state": "Rajasthan",
        "city": "Jaipur",
        "stream": "Nursing",
        "rating": "4.5",
        "tuitionFeesDisplay": "₹80 K - 1.5 L",
        "minFee": 80000,
        "maxFee": 150000,
        "_entityType": "college"
      }
    ]
  }
}
```

---

### 🔹 API: `GET /api/search/autocomplete`
* **Kaam**: Search bar me typing karte hi instant dropdown suggestions dena.
* **Params**: `q` (Search query string), `limit` (Max count, default: 8)
* **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "crs_202",
      "title": "General Nursing and Midwifery (GNM)",
      "subtitle": "Duration: 3.5 Years",
      "type": "course"
    },
    {
      "id": "col_105",
      "title": "Government GNM Nursing School",
      "subtitle": "Jaipur • Government",
      "type": "college"
    }
  ]
}
```

---

### 🔹 API: `GET /api/search/filters`
* **Kaam**: Frontend sidebar ke liye available States, Cities, Streams, Sectors, Entrance Exams aur Fee Range min/max options dena.
* **Response**:
```json
{
  "success": true,
  "data": {
    "states": ["Delhi", "Karnataka", "Punjab", "Rajasthan"],
    "cities": ["Bangalore", "Jaipur", "New Delhi"],
    "streams": ["Medical", "Nursing", "Paramedical"],
    "sectors": ["Government", "Private", "Semi-Govt"],
    "entranceExams": ["AIIMS B.Sc Nursing Exam", "NEET UG", "RUHS Nursing Entrance"],
    "feeRange": {
      "min": 15000,
      "max": 450000
    }
  }
}
```

---

## 2. Colleges APIs

### 🔹 API: `GET /api/college`
* **Kaam**: Sabhi colleges ki list Lana with multi-filters and pagination.
* **Params**: `search`, `state`, `city`, `sector`, `stream`, `minFee`, `maxFee`, `page`, `limit`
* **Response**:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "e67b2a9d-5120-11ef-8b8a-0242ac120002",
      "name": "SMS Medical College & Nursing Institute",
      "code": "SMS-JPR",
      "description": "Government nursing college.",
      "sector": "Government",
      "state": "Rajasthan",
      "city": "Jaipur",
      "thumbnail": "/uploads/colleges/sms.jpg",
      "rating": "4.8",
      "nirfRank": "# 10 NIRF",
      "tuitionFeesDisplay": "₹20 K - 80 K",
      "examsAccepted": ["RUHS Nursing Entrance"],
      "isFeatured": true
    }
  ]
}
```

---

### 🔹 API: `GET /api/college/:id`
* **Kaam**: Kisi ek specific college ki poori profile details fetch karna (Fast Redis Cached).
* **Response**:
```json
{
  "success": true,
  "data": {
    "id": "e67b2a9d-5120-11ef-8b8a-0242ac120002",
    "name": "SMS Medical College & Nursing Institute",
    "code": "SMS-JPR",
    "description": "Government nursing college in Jaipur.",
    "sector": "Government",
    "establishedYear": 1947,
    "state": "Rajasthan",
    "city": "Jaipur",
    "address": "JLN Marg, Jaipur",
    "facilities": ["Hostel", "Library", "Labs", "Hospital Attachment"],
    "gallery": ["/uploads/colleges/g1.jpg"],
    "rating": "4.8",
    "nirfRank": "# 10 NIRF",
    "tuitionFeesDisplay": "₹20 K - 80 K",
    "examsAccepted": ["RUHS Nursing Entrance"],
    "brochureUrl": "/uploads/colleges/brochure.pdf"
  }
}
```

---

### 🔹 API: `GET /api/college/compare`
* **Kaam**: Selected colleges ko side-by-side compare karne ke liye data Dena.
* **Params**: `ids` (Comma separated IDs, e.g. `?ids=id1,id2`)
* **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "col1_id",
      "name": "RUHS College of Nursing",
      "sector": "Government",
      "city": "Jaipur",
      "rating": "4.6",
      "tuitionFeesDisplay": "₹50 K - 1.2 L"
    },
    {
      "id": "col2_id",
      "name": "Apollo College of Nursing",
      "sector": "Private",
      "city": "Bangalore",
      "rating": "4.3",
      "tuitionFeesDisplay": "₹1.5 L - 3.2 L"
    }
  ]
}
```

---

## 3. Universities APIs

### 🔹 API: `GET /api/university`
* **Kaam**: Sabhi affiliated universities ki list Lana.
* **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "univ_1",
      "name": "Rajasthan University of Health Sciences (RUHS)",
      "type": "State",
      "location": "Jaipur, Rajasthan",
      "establishedYear": 2005
    }
  ]
}
```

---

## 4. Placements, Reviews & Scholarships APIs

### 🔹 API: `GET /api/placement/college/:collegeId`
* **Kaam**: College-wise placement statistics aur top recruiters list Dena.
* **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "plc_1",
      "collegeId": "col_101",
      "year": 2025,
      "highestPackage": "8.5 LPA",
      "averagePackage": "4.2 LPA",
      "topRecruiters": ["Fortis Healthcare", "Apollo Hospitals", "Max Healthcare"]
    }
  ]
}
```

---

### 🔹 API: `GET /api/review/college/:collegeId`
* **Kaam**: College student reviews & ratings list Lana.
* **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "rev_1",
      "collegeId": "col_101",
      "userName": "Amit Verma",
      "rating": 4.5,
      "comment": "Great clinical exposure and hospital training labs."
    }
  ]
}
```

---

### 🔹 API: `GET /api/scholarship/college/:collegeId`
* **Kaam**: College me available scholarships details Dena.
* **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "sch_1",
      "collegeId": "col_101",
      "name": "Merit-Cum-Means Scholarship",
      "amount": "50% Tuition Fee Waiver",
      "eligibility": "Min 85% in 10+2 PCB"
    }
  ]
}
```

---

## 5. Courses & Entrance Exams APIs

### 🔹 API: `GET /api/course`
* **Kaam**: Sabhi courses list (Supports `trending=true`).
* **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "crs_1",
      "name": "B.Sc. Nursing",
      "code": "BSC-NURS",
      "duration": "4 Years",
      "eligibility": "10+2 with PCB"
    }
  ]
}
```

---

### 🔹 API: `GET /api/exams`
* **Kaam**: Sabhi entrance exams list Dena.
* **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "ex_101",
      "name": "AIIMS B.Sc Nursing Entrance Exam",
      "code": "AIIMS-BSC-NURS",
      "category": "Nursing",
      "examLevel": "National",
      "examDate": "2026-06-08T00:00:00.000Z"
    }
  ]
}
```

---

## 6. Admission Enquiry / Student Lead API

### 🔹 API: `POST /api/leads`
* **Kaam**: Student admission inquiry form ya callback request submit karna.
* **Request Body**:
```json
{
  "studentName": "Rahul Sharma",
  "phone": "9876543210",
  "email": "rahul@gmail.com",
  "city": "Jaipur",
  "targetCourse": "B.Sc Nursing",
  "targetCollegeId": "col_101"
}
```
* **Response**:
```json
{
  "success": true,
  "message": "Enquiry submitted successfully! Our counselor will get in touch shortly."
}
```

---

## 7. Locations Metadata APIs

### 🔹 API: `GET /api/college/india/states`
* **Kaam**: India ke sabhi states ki list Dena.
* **Response**:
```json
{
  "success": true,
  "data": ["Delhi", "Gujarat", "Karnataka", "Maharashtra", "Punjab", "Rajasthan", "Uttar Pradesh"]
}
```

---

### 🔹 API: `GET /api/college/india/cities`
* **Kaam**: Selected state ke cities ki list Dena.
* **Params**: `state` (e.g. `?state=Rajasthan`)
* **Response**:
```json
{
  "success": true,
  "data": ["Ajmer", "Alwar", "Bikaner", "Jaipur", "Jodhpur", "Kota", "Udaipur"]
}
```
