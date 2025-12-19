import { NextRequest, NextResponse } from 'next/server';
import { buildStats, getUserBySession } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('waitlist_session')?.value;
        const user = await getUserBySession(token || '');

        if (!user) {
            return NextResponse.json({ ok: false, error: 'Invalid or expired session.' }, { status: 401 });
        }

        return NextResponse.json({ ok: true, data: buildStats(user) }, { status: 200 });
    } catch (error) {
        console.error('Waitlist /me error:', error);
        return NextResponse.json({ ok: false, error: 'An unexpected error occurred.' }, { status: 500 });
    }
}
