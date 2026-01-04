import { NextRequest, NextResponse } from 'next/server';
import { applyReferral, createSession, normalizeTwitter, normalizeWallet, upsertUser } from '@/lib/db';
import { validateTwitterUsername, validateWalletAddress } from '@/lib/validation';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    return NextResponse.json({ ok: false, error: 'Waitlist is closed.' }, { status: 403 });
}
