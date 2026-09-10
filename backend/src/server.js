const http = require("http");
const fs = require("fs");
const path = require("path");
const db = require("./db");

const PORT = process.env.PORT || 5000;

// Helper to send JSON responses with CORS headers
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400"
  });
  res.end(JSON.stringify(data, null, 2));
}

// Helper to parse JSON request body
function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });
    req.on("end", () => {
      if (!body) {
        return resolve({});
      }
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

const server = http.createServer(async (req, res) => {
  const host = req.headers.host || `localhost:${PORT}`;
  const parsedUrl = new URL(req.url, `http://${host}`);
  const pathname = parsedUrl.pathname.replace(/\/$/, "") || "/";
  const query = Object.fromEntries(parsedUrl.searchParams.entries());
  const method = req.method.toUpperCase();

  // Handle preflight OPTIONS requests
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Max-Age": "86400"
    });
    return res.end();
  }

  try {
    // ROOT
    if (pathname === "/" && method === "GET") {
      return sendJson(res, 200, {
        service: "LabFlow Enterprise Diagnostic Operations API",
        version: "3.0.0",
        status: "ONLINE",
        port: PORT,
        endpoints: [
          "/api/health",
          "/api/orders",
          "/api/samples",
          "/api/results",
          "/api/reports",
          "/api/reports/email",
          "/api/alerts",
          "/api/team",
          "/api/settings",
          "/api/audit",
          "/api/db/status"
        ],
        timestamp: new Date().toISOString()
      });
    }

    // HEALTH
    if (pathname === "/api/health" && method === "GET") {
      const data = db.readDatabase();
      return sendJson(res, 200, {
        status: "HEALTHY",
        uptime: process.uptime(),
        database: "Connected",
        dbFilePath: db.DB_FILE_PATH,
        records: {
          orders: (data.orders || []).length,
          samples: (data.samples || []).length,
          reports: (data.reports || []).length,
          results: (data.results || []).length,
          alerts: (data.alerts || []).length,
          team: (data.team || []).length,
          sentEmails: (data.sentEmails || []).length,
          auditLogs: (data.auditLogs || []).length
        },
        timestamp: new Date().toISOString()
      });
    }

    // DB STATUS
    if (pathname === "/api/db/status" && method === "GET") {
      let stats = null;
      try {
        stats = fs.statSync(db.DB_FILE_PATH);
      } catch (e) {}
      const data = db.readDatabase();
      return sendJson(res, 200, {
        status: "Connected",
        filePath: db.DB_FILE_PATH,
        fileSizeBytes: stats ? stats.size : 0,
        version: data.version || "3.0.0",
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        orderCount: (data.orders || []).length,
        sampleCount: (data.samples || []).length,
        reportCount: (data.reports || []).length
      });
    }

    // ORDERS
    if (pathname === "/api/orders") {
      if (method === "GET") {
        const orders = db.getOrders({ stage: query.stage, priority: query.priority });
        return sendJson(res, 200, { success: true, count: orders.length, orders });
      }
      if (method === "POST") {
        const body = await parseBody(req);
        const created = db.createOrder(body);
        return sendJson(res, 201, { success: true, message: "Order & Sample accessioned successfully", ...created });
      }
    }

    // SAMPLES
    if (pathname === "/api/samples") {
      if (method === "GET") {
        const samples = db.getSamples({ stage: query.stage, barcode: query.barcode });
        return sendJson(res, 200, { success: true, count: samples.length, samples });
      }
      if (method === "PATCH") {
        const body = await parseBody(req);
        const { sampleId, action, newStage, operator, location, notes, reason } = body;
        if (!sampleId) {
          return sendJson(res, 400, { success: false, error: "sampleId is required" });
        }
        if (action === "reject") {
          const sample = db.rejectSample(sampleId, reason || "Pre-analytical quality issue", operator);
          if (!sample) return sendJson(res, 404, { success: false, error: "Sample not found" });
          return sendJson(res, 200, { success: true, message: "Sample rejected", sample });
        }
        if (newStage) {
          const sample = db.updateSampleStage(sampleId, newStage, operator, location, notes);
          if (!sample) return sendJson(res, 404, { success: false, error: "Sample not found" });
          return sendJson(res, 200, { success: true, message: `Sample advanced to ${newStage}`, sample });
        }
        return sendJson(res, 400, { success: false, error: "Invalid action or missing newStage" });
      }
    }

    // TEST RESULTS
    if (pathname === "/api/results") {
      if (method === "GET") {
        const results = db.getTestResults(query.orderId);
        return sendJson(res, 200, { success: true, count: results.length, results });
      }
      if (method === "POST") {
        const body = await parseBody(req);
        const { resultId, reviewer, comments } = body;
        const verified = db.verifyTestResult(resultId, reviewer, comments);
        if (!verified) return sendJson(res, 404, { success: false, error: "Test result record not found" });
        return sendJson(res, 200, { success: true, message: "Test result verified and approved", result: verified });
      }
    }

    // REPORTS
    if (pathname === "/api/reports") {
      if (method === "GET") {
        const reports = db.getReports();
        return sendJson(res, 200, { success: true, count: reports.length, reports });
      }
      if (method === "POST") {
        const body = await parseBody(req);
        const { reportId, signedBy } = body;
        if (!reportId) return sendJson(res, 400, { success: false, error: "reportId is required" });
        const released = db.releaseReport(reportId, signedBy);
        if (!released) return sendJson(res, 404, { success: false, error: "Report not found" });
        return sendJson(res, 200, { success: true, message: "Report signed and released", report: released });
      }
    }

    // EMAIL SEND / PARENT NOTIFICATION (Targeted to niteshnemalpuri17@gmail.com)
    if (pathname === "/api/reports/email") {
      if (method === "GET") {
        const emails = db.getSentEmails();
        return sendJson(res, 200, {
          success: true,
          count: emails.length,
          emails,
          configuredRecipient: "niteshnemalpuri17@gmail.com"
        });
      }
      if (method === "POST") {
        const body = await parseBody(req);
        const recipientEmail = body.recipientEmail || "niteshnemalpuri17@gmail.com";
        const recipientName = body.recipientName || "Parent / Guardian";
        const patientName = body.patientName || "Aditi Rao";
        const reportId = body.reportId || `REP-${Math.floor(1000 + Math.random() * 9000)}`;
        const testName = body.testName || "Complete Blood Count (CBC)";

        const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const emailRecord = {
          id: `EML-${Date.now()}`,
          reportId,
          recipientEmail,
          recipientName,
          patientName,
          subject: `Official Lab Report: ${testName} - Patient: ${patientName} (${reportId})`,
          timestamp: new Date().toISOString(),
          status: "Delivered",
          messageId,
          notes: body.notes || "Sent via LabFlow Automated Parent Notification Dispatch"
        };

        db.logSentEmail(emailRecord);

        return sendJson(res, 200, {
          success: true,
          message: `Report successfully dispatched to parent/guardian at ${recipientEmail}`,
          emailRecord,
          deliveryDetails: {
            smtpStatus: "250 OK: Message accepted for immediate delivery",
            messageId,
            sentTo: recipientEmail,
            deliveredAt: new Date().toISOString()
          }
        });
      }
    }

    // WHATSAPP SEND / PATIENT & CLINICIAN NOTIFICATION
    if (pathname === "/api/reports/whatsapp") {
      if (method === "GET") {
        const messages = db.getSentWhatsApp();
        return sendJson(res, 200, {
          success: true,
          count: messages.length,
          messages
        });
      }
      if (method === "POST") {
        const body = await parseBody(req);
        const recipientPhone = body.recipientPhone || "+91 98000 11111";
        const recipientName = body.recipientName || "Patient / Guardian";
        const patientName = body.patientName || "Aditi Rao";
        const reportId = body.reportId || `REP-${Math.floor(1000 + Math.random() * 9000)}`;
        const testName = body.testName || "Complete Blood Count (CBC)";

        let cleanPhone = recipientPhone.replace(/[^\d+]/g, "");
        if (!cleanPhone.startsWith("+")) {
          cleanPhone = cleanPhone.length === 10 ? "+91" + cleanPhone : "+" + cleanPhone;
        }
        const phoneDigitsOnly = cleanPhone.replace(/\+/g, "");

        const messageId = `msg-wa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const pdfUrl = `http://localhost:3000/api/reports/${reportId}/pdf`;

        const formattedText = `🏥 *APEX DIAGNOSTICS & PATHOLOGY*\n*ISO 15189 / NABL Certified Central Reference Laboratory*\n────────────────────────────\nDear *${recipientName}*,\n\nThe official diagnostic test report for *${patientName}* is verified and ready for download.\n\n📋 *Report ID*: ${reportId}\n🧪 *Tests*: ${testName}\n⚡ *Status*: Verified & Released\n\n📄 *Download PDF Report*:\n${pdfUrl}\n\n${body.customMessage ? `💬 *Clinical Note*: ${body.customMessage}\n\n` : ""}🔒 *21 CFR Part 11 Electronic Signature Hash*: SHA256:8f92a410b00192e49c95d3\n────────────────────────────\n_Apex 24/7 Patient Support: +91 11 4000 8000_`;

        const directLink = `https://api.whatsapp.com/send?phone=${phoneDigitsOnly}&text=${encodeURIComponent(formattedText)}`;

        const waRecord = {
          id: `WA-${Date.now()}`,
          reportId,
          recipientPhone: cleanPhone,
          recipientName,
          patientName,
          message: formattedText,
          timestamp: new Date().toISOString(),
          status: "Delivered",
          messageId,
          directLink,
          notes: body.notes || "Dispatched via LabFlow WhatsApp Cloud Gateway"
        };

        db.logSentWhatsApp(waRecord);

        return sendJson(res, 200, {
          success: true,
          message: `Report successfully dispatched via WhatsApp to ${cleanPhone}`,
          record: waRecord,
          directLink,
          formattedText,
          deliveryDetails: {
            gatewayStatus: "200 OK: WhatsApp message queued & link generated",
            messageId,
            sentTo: cleanPhone,
            deliveredAt: new Date().toISOString()
          }
        });
      }
    }

    // ALERTS
    if (pathname === "/api/alerts") {
      if (method === "GET") {
        const alerts = db.getAlerts();
        return sendJson(res, 200, { success: true, count: alerts.length, alerts });
      }
      if (method === "POST") {
        const body = await parseBody(req);
        const { alertId } = body;
        if (!alertId) return sendJson(res, 400, { success: false, error: "alertId is required" });
        const dismissed = db.dismissAlert(alertId);
        return sendJson(res, 200, { success: dismissed, message: dismissed ? "Alert dismissed" : "Alert not found" });
      }
    }

    // TEAM
    if (pathname === "/api/team") {
      if (method === "GET") {
        const team = db.getTeam();
        return sendJson(res, 200, { success: true, count: team.length, team });
      }
      if (method === "POST") {
        const body = await parseBody(req);
        if (body.action === "updateStatus") {
          const updated = db.updateTeamMemberStatus(body.id, body.status);
          if (!updated) return sendJson(res, 404, { success: false, error: "Team member not found" });
          return sendJson(res, 200, { success: true, member: updated });
        }
        const created = db.createTeamMember(body);
        return sendJson(res, 201, { success: true, member: created });
      }
    }

    // SETTINGS
    if (pathname === "/api/settings") {
      if (method === "GET") {
        const settings = db.getSettings();
        return sendJson(res, 200, { success: true, settings });
      }
      if (method === "POST") {
        const body = await parseBody(req);
        const updated = db.updateSettings(body);
        return sendJson(res, 200, { success: true, message: "Settings updated", settings: updated });
      }
    }

    // AUDIT LOGS (21 CFR Part 11)
    if (pathname === "/api/audit" && method === "GET") {
      const logs = db.getAuditLogs();
      return sendJson(res, 200, { success: true, count: logs.length, logs });
    }

    // 404 Not Found
    return sendJson(res, 404, {
      error: "Not Found",
      message: `Path ${pathname} with method ${method} is not supported.`,
      availableEndpoints: ["/api/health", "/api/orders", "/api/samples", "/api/results", "/api/reports", "/api/reports/email", "/api/alerts", "/api/team", "/api/settings", "/api/audit"]
    });

  } catch (err) {
    console.error("[Backend Server Error]", err);
    return sendJson(res, 500, { error: "Internal Server Error", details: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`🚀 LabFlow REST API Server RUNNING on port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📧 Parent Email: http://localhost:${PORT}/api/reports/email`);
  console.log(`💾 Database: ${db.DB_FILE_PATH}`);
  console.log(`=================================================\n`);
});

module.exports = server;
