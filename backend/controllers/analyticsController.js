import { BetaAnalyticsDataClient } from '@google-analytics/data';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const key = JSON.parse(fs.readFileSync(path.join(__dirname, '../json/admin.json'), 'utf-8'));

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: key,
});

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '484529087'; // Read from env, fallback for dev

export const getAnalytics = async (req, res) => {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate: '365daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'newUsers' },
        { name: 'sessions' },
        { name: 'conversions' }
      ],
      dimensions: [{ name: 'month' }],
    });

    // Process GA4 response into arrays for frontend
    // response.rows: [{dimensionValues: [{value: '1'}], metricValues: [{value: '100'}, ...]}, ...]
    const monthNames = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const rows = response.rows || [];
    // Placeholder: Fetch AdSense revenue for each month (replace with real API call)
    // Example: const adsenseMonthly = await fetchAdsenseRevenue();
    // For now, use dummy data for demonstration
    const dummyAdsenseMonthly = Array(12).fill(0).map((_, i) => 1000 + i * 100); // Replace with real data

    const monthly = rows.map((row, idx) => {
      const monthIdx = parseInt(row.dimensionValues[0].value, 10);
      // Calculate the year for each month (assume data is for the last 12 months, ending this month)
      const now = new Date();
      // monthIdx: 1=Jan, 12=Dec
      let year = now.getFullYear();
      let month = monthIdx;
      // If the month is after the current month, it must be from the previous year
      if (month > now.getMonth() + 1) {
        year = year - 1;
      }
      return {
        month: monthNames[monthIdx] || `M${monthIdx}`,
        monthIdx,
        year,
        activeUsers: Number(row.metricValues[0].value),
        newUsers: Number(row.metricValues[1].value),
        sessions: Number(row.metricValues[2].value),
        conversions: Number(row.metricValues[3].value),
        revenue: dummyAdsenseMonthly[idx] || 0, // Use AdSense revenue here
        adsenseRevenue: dummyAdsenseMonthly[idx] || 0 // Expose AdSense revenue separately
      };
    });
    // Yearly: last 12 months
    const yearly = monthly.slice(-12);
    // Quarterly: group by 3 months
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    // Group months by year and quarter (calendar quarters)
    const quarterMap = {};
    yearly.forEach((row) => {
      const q = Math.floor((row.monthIdx - 1) / 3) + 1; // 1-based quarter
      const key = `${row.year}-Q${q}`;
      if (!quarterMap[key]) {
        quarterMap[key] = {
          quarter: `Q${q}`,
          quarterIdx: q,
          year: row.year,
          activeUsers: 0,
          newUsers: 0,
          sessions: 0,
          conversions: 0,
          revenue: 0,
          adsenseRevenue: 0,
        };
      }
      quarterMap[key].activeUsers += row.activeUsers;
      quarterMap[key].newUsers += row.newUsers;
      quarterMap[key].sessions += row.sessions;
      quarterMap[key].conversions += row.conversions;
      quarterMap[key].revenue += row.revenue;
      quarterMap[key].adsenseRevenue += row.adsenseRevenue;
    });
    const quarterly = Object.values(quarterMap).sort(
      (a, b) => a.year - b.year || a.quarterIdx - b.quarterIdx
    );
    res.json({ yearly, quarterly, monthly });
  } catch (error) {
    console.error('GA4 analytics error:', error && error.stack ? error.stack : error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};
