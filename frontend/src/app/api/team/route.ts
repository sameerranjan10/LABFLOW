import { NextResponse } from "next/server";
import { getTeam, createTeamMember, updateTeamMemberStatus } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const team = getTeam();
    return NextResponse.json({
      success: true,
      count: team.length,
      team,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.role) {
      return NextResponse.json(
        { success: false, error: "Staff member name and role are required." },
        { status: 400 }
      );
    }
    const newMember = createTeamMember(body);
    return NextResponse.json(
      {
        success: true,
        message: `Staff member ${newMember.name} successfully registered.`,
        member: newMember,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Member ID and status are required." },
        { status: 400 }
      );
    }
    const updated = updateTeamMemberStatus(id, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Staff member not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: `Status of ${updated.name} updated to ${updated.status}.`,
      member: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
