import { cn } from "../lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Resume Bias Detection Tool",
  description: "AI-powered resume bias detection and analysis",
}

export default function Page() {
  return (
    <div className={cn("flex", "flex-col", "items-center", "justify-center", "min-h-screen")}>
      <h1 className={cn("text-4xl", "font-bold", "mb-4")}>Welcome to the Resume Bias Detection Tool</h1>
      <p className={cn("text-lg", "text-center", "max-w-2xl")}>
        This tool uses AI to detect and analyze bias in resumes. Upload your resume to get started.
      </p>
    </div>
  )
}
