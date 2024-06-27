import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { verifyIdToken } from '@/lib/firebase-admin'
import { deleteQuestionsByUid, getUserByUid } from '@/lib/notion'

export const dynamic = 'force-dynamic'

export async function DELETE(request: Request) {
  try {
    const headersInstance = headers()
    const token = headersInstance.get('Authorization')

    if (token) {
      const decodedToken = await verifyIdToken(token)

      const userInNotion = await getUserByUid(decodedToken.uid)
      if (userInNotion.results.length === 0) {
        return NextResponse.json(
          { message: 'User is not exist' },
          { status: 400 },
        )
      }
      await Promise.allSettled([deleteQuestionsByUid(decodedToken.uid)])

      return NextResponse.json({ message: 'All questions deleted' })
    }

    return NextResponse.json(
      { message: 'Can not found the session', data: null },
      { status: 403 },
    )
  } catch (error) {
    console.error(request.url, error)
    return NextResponse.json(
      { message: 'Error while deleting all questions' },
      { status: 500 },
    )
  }
}
