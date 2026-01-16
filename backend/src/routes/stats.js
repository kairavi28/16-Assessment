const express = require('express');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

let cachedStats = null;
let lastModified = null;
let fileWatcher = null;

async function computeStats() {
  const raw = await fsPromises.readFile(DATA_PATH, 'utf8');
  const items = JSON.parse(raw);
  
  if (items.length === 0) {
    return {
      total: 0,
      averagePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      categories: {}
    };
  }

  const categoryStats = {};
  let totalPrice = 0;
  let minPrice = Infinity;
  let maxPrice = -Infinity;

  for (const item of items) {
    totalPrice += item.price;
    minPrice = Math.min(minPrice, item.price);
    maxPrice = Math.max(maxPrice, item.price);
    
    const cat = item.category || 'Uncategorized';
    if (!categoryStats[cat]) {
      categoryStats[cat] = { count: 0, totalPrice: 0 };
    }
    categoryStats[cat].count++;
    categoryStats[cat].totalPrice += item.price;
  }

  return {
    total: items.length,
    averagePrice: Math.round((totalPrice / items.length) * 100) / 100,
    minPrice,
    maxPrice,
    categories: categoryStats
  };
}

async function getStats() {
  try {
    const stat = await fsPromises.stat(DATA_PATH);
    const mtime = stat.mtime.getTime();

    if (cachedStats && lastModified === mtime) {
      return cachedStats;
    }

    cachedStats = await computeStats();
    lastModified = mtime;
    return cachedStats;
  } catch (err) {
    throw err;
  }
}

if (process.env.NODE_ENV !== 'test') {
  try {
    fileWatcher = fs.watch(DATA_PATH, (eventType) => {
      if (eventType === 'change') {
        cachedStats = null;
        lastModified = null;
      }
    });
  } catch (err) {
    console.error('Could not set up file watcher:', err.message);
  }
}

router.get('/', async (req, res, next) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
