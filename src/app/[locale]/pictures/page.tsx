import { redirect } from "next/navigation";

export default async function PicturesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}#pictures`);
}
