import { NextRequest, NextResponse } from 'next/server';
import { buildStats, claimTask, getUserBySession } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { taskId } = body || {};
        const token = request.cookies.get('waitlist_session')?.value;
        const user = await getUserBySession(token || '');

        if (!user) {
            return NextResponse.json({ ok: false, error: 'Invalid or expired session.' }, { status: 401 });
        }

        if (!taskId) {
            return NextResponse.json({ ok: false, error: 'Missing taskId.' }, { status: 400 });
        }

        const updatedUser = await claimTask(user, String(taskId));
        return NextResponse.json({ ok: true, data: buildStats(updatedUser) }, { status: 200 });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'An unexpected error occurred.';
        const status = msg.includes('session') ? 401 : 400;
        return NextResponse.json({ ok: false, error: msg }, { status });
    }
}
