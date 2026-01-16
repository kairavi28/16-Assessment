# Solution Documentation

## Overview

This document explains the approach I took to address the issues identified in the take-home assessment. The focus was on improving performance, security, maintainability, and overall user experience while keeping the solution simple and practical.

---

## Backend Changes (Node.js)

### 1. Removed Blocking I/O (`src/routes/items.js`)

**Issue:**  
The original implementation used `fs.readFileSync`, which blocks the Node.js event loop and negatively impacts performance under concurrent load.

**Solution:**  
- Replaced synchronous file operations with async equivalents using `fs.promises`
- Converted route handlers to `async` functions
- Added proper `async/await` error handling

**Trade-off:**  
Slightly more verbose code, but significantly better scalability and non-blocking behavior.

---

### 2. Stats Caching with File Watching (`src/routes/stats.js`)

**Issue:**  
Statistics were recalculated on every request, causing unnecessary CPU usage.

**Solution:**  
- Implemented in-memory caching for computed stats
- Used file modification time (`mtime`) to detect changes
- Added `fs.watch()` to invalidate cache immediately when the data file changes
- Extended stats with additional metrics (min/max price, category breakdown)

**Trade-offs:**  
- Small memory overhead for caching  
- One additional file descriptor for file watching  
These were acceptable given the performance benefits.

---

### 3. Pagination Support

**Issue:**  
The API returned all items at once, which does not scale well.

**Solution:**  
- Added `page`, `limit`, and `offset` query parameters
- Included pagination metadata in the response:
  `{ items, total, page, limit, totalPages }`
- Default page size set to 20 items
- Search filtering works correctly with pagination