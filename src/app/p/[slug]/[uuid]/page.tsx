import { ProfileAvatar } from "@/components/ProfileAvatar"
import { BASEURL, getPublicOwnerUser, getQuestionDetail } from "@/lib/api"
import { Question, UserProfile } from "@/lib/types"
import { LinkAds } from "@/modules/PublicQuestionPage/LinkAds"
import { QuestionDetail } from "@/modules/PublicQuestionPage/QuestionDetail"
import { Metadata } from "next"
import { notFound } from "next/navigation"

type PublicQuestionPageProps = {
  params: { slug: string, uuid: string }
}

export async function generateMetadata(
  { params }: PublicQuestionPageProps
): Promise<Metadata> {
  const slug = params.slug
  const uuid = params.uuid

  const ownerData = getPublicOwnerUser(slug as string)
  const questionData = getQuestionDetail(uuid as string)

  const [owner, question] = await Promise.all([ownerData, questionData])

  const q: Question = (question?.data || [])[0] || {}

  return {
    title: `Tanyakan ke ${owner?.data?.name} dengan anonim | TanyaAja`,
    description: `Tanyakan apa saja ke ${owner?.data?.name} dengan anonim`,
    openGraph: {
      siteName: 'TanyaAja.in',
      description: `Tanyakan apa saja ke ${owner?.data?.name} dengan anonim`,
      url: `${BASEURL}/p/${owner?.data?.slug}`,
      title: `Tanyakan ke ${owner?.data?.name} dengan anonim`,
      images: [{
        url: `${BASEURL}/api/og?type=question&user=${owner?.data?.name}&questionId=${q?.uuid}&question=${q?.question}&slug=${owner?.data?.slug}`
      }]
    },
    twitter: {
      site: 'TanyaAja.in',
      description: `Tanyakan apa saja ke ${owner?.data?.name} dengan anonim`,
      creator: '@Maz_Ipan',
      title: `Tanyakan ke ${owner?.data?.name} dengan anonim`,
      images: [{
        url: `${BASEURL}/api/og?type=question&user=${owner?.data?.name}&questionId=${q?.uuid}&question=${q?.question}&slug=${owner?.data?.slug}`
      }]
    }
  }
}

export default async function PublicQuestionPage({
  params: { slug, uuid },
}: PublicQuestionPageProps) {
  const ownerData = await getPublicOwnerUser(slug as string)
  const questionData = await getQuestionDetail(uuid as string)

  const [owner, question] = await Promise.all([ownerData, questionData])

  if (!owner?.data) {
    notFound()
  }

  return (
    <main className="flex flex-col gap-6 items-center py-16 px-4 md:px-8">
      {owner ? (
        <>
          <ProfileAvatar
            image={owner?.data?.image}
            name={owner?.data?.name}
            size="96"
          />

          <h1 className="text-3xl font-extrabold text-center">
            Pertanyaan untuk {owner?.data?.name}
          </h1>

          <QuestionDetail
            questions={(question.data || []).filter(q => q.public)}
            slug={owner?.data?.slug} />

          <LinkAds />
        </>
      ) : null}
    </main>
  )
}