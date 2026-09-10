import { NextResponse } from "next/server";
import { getSentEmails, getSentWhatsApp, retryMessageJob, flushAllQueues, dispatchSimulatedQueueJob } from "@/lib/db";

export async function GET() {
  try {
    const emails = getSentEmails();
    const whatsapp = getSentWhatsApp();

    const emailFailedCount = emails.filter((e) => e.status === "Failed").length;
    const whatsappFailedCount = whatsapp.filter((w) => w.status === "Failed").length;
    const dlqCount = emailFailedCount + whatsappFailedCount;

    const queues = [
      {
        id: "email-dispatch-queue",
        name: "Patient & Guardian Email Dispatch",
        driver: "BullMQ / Redis",
        concurrency: 4,
        rateLimit: "25 jobs/sec",
        active: 0,
        waiting: 1,
        completed: emails.filter((e) => e.status === "Delivered").length,
        failed: emailFailedCount,
        delayed: 0,
        status: "RUNNING",
        latencyAvgMs: 382,
        backendProvider: "SendGrid / Enterprise SMTP Pool",
      },
      {
        id: "whatsapp-notify-queue",
        name: "WhatsApp Diagnostic Notifications",
        driver: "BullMQ / Redis",
        concurrency: 6,
        rateLimit: "80 jobs/sec",
        active: 0,
        waiting: 0,
        completed: whatsapp.filter((w) => w.status === "Delivered" || w.status === "Sent").length,
        failed: whatsappFailedCount,
        delayed: 0,
        status: "RUNNING",
        latencyAvgMs: 145,
        backendProvider: "Meta WhatsApp Cloud API Gateway",
      },
      {
        id: "analyzer-telemetry-queue",
        name: "Automated Instrument ASTM/HL7 Ingestion",
        driver: "BullMQ / Redis",
        concurrency: 10,
        rateLimit: "120 events/sec",
        active: 1,
        waiting: 0,
        completed: 1842,
        failed: 0,
        delayed: 0,
        status: "RUNNING",
        latencyAvgMs: 42,
        backendProvider: "LIMS Instrument Serial/TCP Bridge",
      },
      {
        id: "pdf-render-queue",
        name: "NABL/ISO Diagnostic PDF Rendering",
        driver: "BullMQ / Redis",
        concurrency: 2,
        rateLimit: "10 renders/sec",
        active: 0,
        waiting: 0,
        completed: emails.length + 12,
        failed: 0,
        delayed: 0,
        status: "RUNNING",
        latencyAvgMs: 620,
        backendProvider: "Headless PDF Rendering Engine",
      },
    ];

    // Combined job timeline
    const allJobs = [
      ...emails.map((e) => ({
        id: e.id,
        queueId: "email-dispatch-queue",
        channel: "EMAIL" as const,
        recipient: e.recipientEmail,
        recipientName: e.recipientName,
        reportId: e.reportId,
        subject: e.subject,
        timestamp: e.timestamp,
        status: e.status,
        messageId: e.messageId,
        notes: e.notes,
      })),
      ...whatsapp.map((w) => ({
        id: w.id,
        queueId: "whatsapp-notify-queue",
        channel: "WHATSAPP" as const,
        recipient: w.recipientPhone,
        recipientName: w.recipientName,
        reportId: w.reportId,
        subject: `Report ready for ${w.patientName}`,
        timestamp: w.timestamp,
        status: w.status,
        messageId: w.messageId,
        notes: w.notes,
      })),
    ];

    return NextResponse.json({
      success: true,
      queues,
      metrics: {
        totalQueues: queues.length,
        totalActiveWorkers: 22,
        dlqJobCount: dlqCount,
        throughput: "235 jobs/min",
        systemHealth: dlqCount > 0 ? "DEGRADED (DLQ Pending)" : "HEALTHY (Nominal)",
      },
      recentJobs: allJobs,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch queue metrics", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action = "retry_job", jobId, channel = "EMAIL", recipient } = body;

    if (action === "retry_job" || action === "process_job") {
      if (!jobId) {
        return NextResponse.json(
          { success: false, error: `jobId is required for ${action}` },
          { status: 400 }
        );
      }
      const result = retryMessageJob(jobId);
      return NextResponse.json({
        success: true,
        action,
        result,
      });
    }

    if (action === "flush_queue") {
      const result = flushAllQueues();
      return NextResponse.json({
        success: true,
        action: "flush_queue",
        result,
      });
    }

    if (action === "dispatch_test_job") {
      const result = dispatchSimulatedQueueJob(channel, recipient);
      return NextResponse.json({
        success: true,
        action: "dispatch_test_job",
        result,
      });
    }

    return NextResponse.json(
      { success: false, error: "Unsupported action: " + action },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Queue action failed", details: String(error) },
      { status: 500 }
    );
  }
}
