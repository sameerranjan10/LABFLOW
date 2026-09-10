const http = require("http");
const server = require("../src/server");

const BASE_URL = "http://localhost:5000";

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        "Content-Type": "application/json"
      }
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on("error", reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("\n🧪 Running LabFlow Backend API Validation Suite...\n");
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}:`, err.message);
    }
  }

  // Allow server to listen
  await new Promise(r => setTimeout(r, 200));

  await test("GET /api/health returns 200 and HEALTHY", async () => {
    const res = await request("GET", "/api/health");
    if (res.status !== 200 || res.body.status !== "HEALTHY") {
      throw new Error(`Expected 200 HEALTHY, got ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test("GET /api/orders returns list of orders", async () => {
    const res = await request("GET", "/api/orders");
    if (res.status !== 200 || !Array.isArray(res.body.orders)) {
      throw new Error(`Expected 200 with orders array, got ${res.status}`);
    }
  });

  await test("POST /api/orders accessions a new order and sample", async () => {
    const res = await request("POST", "/api/orders", {
      patient: { name: "Test Patient", age: 35, gender: "Female", mrn: "MRN-TEST-1" },
      tests: ["CBC", "Lipid Profile"],
      priority: "STAT"
    });
    if (res.status !== 201 || !res.body.order || !res.body.sample) {
      throw new Error(`Expected 201 with order and sample, got ${res.status}`);
    }
  });

  await test("GET /api/samples returns sample tracking list", async () => {
    const res = await request("GET", "/api/samples");
    if (res.status !== 200 || !Array.isArray(res.body.samples)) {
      throw new Error(`Expected 200 with samples, got ${res.status}`);
    }
  });

  await test("POST /api/reports/email sends report to parent (niteshnemalpuri17@gmail.com)", async () => {
    const res = await request("POST", "/api/reports/email", {
      reportId: "REP-4892",
      patientName: "Aditi Rao",
      recipientEmail: "niteshnemalpuri17@gmail.com",
      recipientName: "Parent / Guardian",
      testName: "Complete Blood Count (18 Attributes)"
    });
    if (res.status !== 200 || !res.body.success || res.body.emailRecord.recipientEmail !== "niteshnemalpuri17@gmail.com") {
      throw new Error(`Expected delivery to niteshnemalpuri17@gmail.com, got ${JSON.stringify(res.body)}`);
    }
  });

  await test("GET /api/reports/email lists sent emails with configured recipient", async () => {
    const res = await request("GET", "/api/reports/email");
    if (res.status !== 200 || !Array.isArray(res.body.emails) || res.body.configuredRecipient !== "niteshnemalpuri17@gmail.com") {
      throw new Error(`Expected 200 with sent emails list, got ${res.status}`);
    }
  });

  console.log(`\n=================================================`);
  console.log(`📊 Test Results: ${passed}/${total} Passed (${Math.round((passed/total)*100)}%)`);
  console.log(`=================================================\n`);

  server.close(() => {
    process.exit(passed === total ? 0 : 1);
  });
}

runTests().catch(err => {
  console.error("Test Suite crashed:", err);
  process.exit(1);
});
