import { NextRequest, NextResponse } from 'next/server';
import { buildStats, claimTask, getUserBySession } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    return NextResponse.json({ ok: false, error: 'Points claiming is closed.' }, { status: 403 });
}
