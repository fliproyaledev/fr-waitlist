import { NextRequest, NextResponse } from 'next/server';
import { claimTaskBySession } from '@/lib/db';
import { ApiResponse } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('x-session-token') || '';
        const body = await request.json().catch(() => ({}));
        const { task_id } = body || {};

        if (!token) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: 'Missing session token.' },
                { status: 401 }
            );
        }

        if (!task_id) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: 'Missing task_id.' },
                { status: 400 }
            );
        }

        const stats = await claimTaskBySession(token, String(task_id));
        return NextResponse.json<ApiResponse>(
            { success: true, message: 'Task recorded.', data: { stats } },
            { status: 200 }
        );
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'An unexpected error occurred.';
        const status = msg.includes('session') ? 401 : 400;
        return NextResponse.json<ApiResponse>(
            { success: false, message: msg },
            { status }
        );
    }
}
