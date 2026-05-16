import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBySlug, getRelated } from "@/lib/resources";
import ResourceDetailClient from "./client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resource = getBySlug(slug);
  if (!resource) return { title: "Not found" };
  return {
    title: `${resource.name} — ClaudeHub`,
    description: resource.description,
  };
}

export default async function ResourcePage({ params }: Props) {
  const { slug } = await params;
  const resource = getBySlug(slug);
  if (!resource) notFound();
  const related = getRelated(resource, 4);
  return <ResourceDetailClient resource={resource} related={related} />;
}
