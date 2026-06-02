import fetch from "node-fetch";

const urls = [
  "http://localhost:3005/admin",
  "http://localhost:3005/admin/analytics",
  "http://localhost:3005/admin/users",
  "http://localhost:3005/admin/leads",
  "http://localhost:3005/admin/subscriptions",
  "http://localhost:3005/admin/bookings",
  "http://localhost:3005/admin/community",
  "http://localhost:3005/admin/content",
  "http://localhost:3005/admin/stories",
  "http://localhost:3005/programs",
  "http://localhost:3005/admin/settings",
  "http://localhost:3005/admin/schedule",
  "http://localhost:3005/admin/classes",
  "http://localhost:3005/api/admin/schedule",
  "http://localhost:3005/api/admin/bookings",
  "http://localhost:3005/api/admin/classes",
  "http://localhost:3005/api/admin/leads",
  "http://localhost:3005/api/admin/content",
  "http://localhost:3005/api/admin/subscriptions",
  "http://localhost:3005/api/admin/users",
  "http://localhost:3005/api/admin/community",
  "http://localhost:3005/api/admin/stats",
  "http://localhost:3005/api/admin/analytics",
];

async function run() {
  for (const url of urls) {
    try {
      const res = await fetch(url);
      console.log(`${res.status} ${url}`);
    } catch (e) {
      console.log(`Error ${url} - ${e.message}`);
    }
  }
}
run();
