import type { Metadata } from "next"
import ResumeBiasChecker from "./client_page"

export const metadata: Metadata = {
  title: "Resume Bias Detection Tool",
  description: "AI-powered resume bias detection and analysis",
}

export default function Page() {
  return <ResumeBiasChecker />
}
