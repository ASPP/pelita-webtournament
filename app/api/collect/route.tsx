import { eventBus } from '@/lib/event-bus';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const data = await req.text();

  eventBus.emit(data);

  return Response.json({ ok: true });
}
