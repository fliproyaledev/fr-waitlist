import { NextRequest, NextResponse } from 'next/server';
import { buildStats, getUserBySession } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    return NextResponse.json({ ok: false, error: 'Waitlist is closed.' }, { status: 403 });
}
