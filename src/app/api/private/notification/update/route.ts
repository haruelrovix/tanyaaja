import { revalidatePath, revalidateTag } from 'next/cache'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import {
  getNotifChannelByUid,
  getSession,
  updateNotifChannelByUuid,
} from '@/lib/notion'

export async function PATCH(request: Request) {
  const res = await request.json()
  try {
    const headersInstance = headers()
    const token = headersInstance.get('Authorization')

    if (token) {
      const session = await getSession(token)
      if (session.results.length > 0) {
        const existing = await getNotifChannelByUid(res?.uid)
        if (existing.results.length === 0) {
          return NextResponse.json(
            { message: 'Notif channel is not exist' },
            { status: 400 },
          )
        } else {
          const foundPage = existing.results[0]
          await updateNotifChannelByUuid(foundPage?.id, res)

          revalidatePath(`/p/${res.slug}`)
          revalidateTag(res.slug)
          revalidateTag(`notif-by-uid-${res.uid}`)

          return NextResponse.json({ message: 'Notif channel updated' })
        }
      }
    }

    return NextResponse.json(
      { message: `Can not found the session`, data: null },
      { status: 403 },
    )
  } catch (error) {
    console.error(request.url, error)
    return NextResponse.json(
      { message: 'Error while updating notif channel' },
      { status: 500 },
    )
  }
}
