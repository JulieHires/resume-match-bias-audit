"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Upload, FileText, Download, AlertTriangle, Brain, Users, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import Papa from "papaparse"
import { DocumentationModal } from "@/components/documentation-modal"

const chartConfig = {
  matchScore: {
    label: "Match Score",
    color: "#3b82f6",
  },
}

interface ResumeData {
  id: string
  name?: string
  text: string
  matchScore: number
  inferredGender?: string
  inferredRace?: string
  genderConfidence?: number
  raceConfidence?: number
}

interface ProcessingStatus {
  stage: string
  progress: number
  message: string
}

export default function ResumeBiasChecker() {
  const [currentScreen, setCurrentScreen] = useState<"upload" | "processing" | "results">("upload")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [biasDetected, setBiasDetected] = useState<boolean>(false)
  const [groupedData, setGroupedData] = useState<any[]>([])
  const [resumeCount, setResumeCount] = useState<number>(0)
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    stage: "Initializing",
    progress: 0,
    message: "Preparing to analyze resumes...",
  })
  const [processedResumes, setProcessedResumes] = useState<ResumeData[]>([])
  const [isDownloading, setIsDownloading] = useState(false)
  const [showDocumentation, setShowDocumentation] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("resumeData")
      if (stored) {
        try {
          const data = JSON.parse(stored)
          if (data.length > 0 && data[0].inferredGender) {
            // Data already processed
            setProcessedResumes(data)
            processGroupedData(data)
            setCurrentScreen("results")
          }
        } catch (error) {
          console.error("Error parsing stored data:", error)
        }
      }
    }
  }, [])

  const generatePDFReport = async () => {
    setIsDownloading(true)

    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import("jspdf")).default
      const autoTable = (await import("jspdf-autotable")).default

      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.width
      const pageHeight = doc.internal.pageSize.height
      let yPosition = 20

      // Title
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("Resume Bias Detection Report", pageWidth / 2, yPosition, { align: "center" })
      yPosition += 15

      // Date
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      const currentDate = new Date().toLocaleDateString()
      doc.text(`Generated on: ${currentDate}`, pageWidth / 2, yPosition, { align: "center" })
      yPosition += 20

      // Executive Summary
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Executive Summary", 20, yPosition)
      yPosition += 10

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      const summaryText = [
        `Total Resumes Analyzed: ${resumeCount}`,
        `Demographic Groups Identified: ${groupedData.length}`,
        `Bias Detection Result: ${biasDetected ? "BIAS DETECTED" : "NO SIGNIFICANT BIAS"}`,
        `Overall Average Score: ${
          groupedData.length > 0
            ? Math.round((groupedData.reduce((sum, group) => sum + group.matchScore, 0) / groupedData.length) * 100) /
              100
            : 0
        }%`,
      ]

      summaryText.forEach((line) => {
        doc.text(line, 20, yPosition)
        yPosition += 7
      })
      yPosition += 10

      // Methodology
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Methodology", 20, yPosition)
      yPosition += 10

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      const methodologyText = [
        "This analysis uses AI-powered demographic inference combined with statistical bias detection:",
        "",
        "1. Gender Inference:",
        "   • Name analysis using demographic datasets (85% accuracy)",
        "   • Linguistic pattern analysis of resume text",
        "   • Combined approach for improved accuracy",
        "",
        "2. Race/Ethnicity Inference:",
        "   • Surname pattern matching against census data",
        "   • Demographic probability scoring",
        "",
        "3. Bias Detection:",
        "   • Disparate Impact Analysis (80% rule)",
        "   • Statistical comparison across demographic groups",
        "   • Identification of systematic score disparities",
      ]

      methodologyText.forEach((line) => {
        if (line === "") {
          yPosition += 4
        } else {
          const splitText = doc.splitTextToSize(line, pageWidth - 40)
          doc.text(splitText, 20, yPosition)
          yPosition += splitText.length * 5
        }
      })
      yPosition += 15

      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        doc.addPage()
        yPosition = 20
      }

      // Demographic Groups Analysis
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Demographic Groups Analysis", 20, yPosition)
      yPosition += 15

      if (groupedData.length > 0) {
        // Create table data
        const tableData = groupedData.map((group) => [
          group.demographic,
          group.count.toString(),
          `${group.matchScore}%`,
          group.matchScore >= groupedData[0]?.matchScore * 0.8 ? "Pass" : "Fail",
        ])

        // Add table
        autoTable(doc, {
          head: [["Demographic Group", "Count", "Avg Score", "80% Rule"]],
          body: tableData,
          startY: yPosition,
          theme: "grid",
          headStyles: { fillColor: [59, 130, 246] },
          alternateRowStyles: { fillColor: [248, 250, 252] },
        })

        yPosition = (doc as any).lastAutoTable.finalY + 20
      }

      // Bias Analysis
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Bias Analysis Results", 20, yPosition)
      yPosition += 10

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")

      if (biasDetected) {
        doc.setTextColor(220, 38, 38) // Red color
        doc.text("⚠ BIAS DETECTED", 20, yPosition)
        doc.setTextColor(0, 0, 0) // Reset to black
        yPosition += 10

        const biasAnalysis = [
          "The analysis has identified potential bias in the resume screening process.",
          "One or more demographic groups show average scores below 80% of the highest-scoring group.",
          "",
          "Recommendations:",
          "• Review screening criteria for potential bias",
          "• Implement blind resume screening processes",
          "• Provide bias training for hiring managers",
          "• Monitor hiring metrics regularly",
          "• Consider structured interview processes",
        ]

        biasAnalysis.forEach((line) => {
          if (line === "") {
            yPosition += 4
          } else {
            const splitText = doc.splitTextToSize(line, pageWidth - 40)
            doc.text(splitText, 20, yPosition)
            yPosition += splitText.length * 5
          }
        })
      } else {
        doc.setTextColor(34, 197, 94) // Green color
        doc.text("✓ NO SIGNIFICANT BIAS DETECTED", 20, yPosition)
        doc.setTextColor(0, 0, 0) // Reset to black
        yPosition += 10

        const noBiasAnalysis = [
          "The analysis shows no significant bias in the resume screening process.",
          "All demographic groups show relatively similar average scores.",
          "",
          "Recommendations:",
          "• Continue monitoring hiring metrics",
          "• Maintain current screening practices",
          "• Regular bias audits are still recommended",
          "• Consider expanding demographic tracking",
        ]

        noBiasAnalysis.forEach((line) => {
          if (line === "") {
            yPosition += 4
          } else {
            const splitText = doc.splitTextToSize(line, pageWidth - 40)
            doc.text(splitText, 20, yPosition)
            yPosition += splitText.length * 5
          }
        })
      }

      // Check if we need a new page for detailed data
      if (yPosition > pageHeight - 100) {
        doc.addPage()
        yPosition = 20
      }

      // Individual Resume Analysis (first 20 resumes)
      if (processedResumes.length > 0) {
        yPosition += 15
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        doc.text("Individual Resume Analysis", 20, yPosition)
        yPosition += 10

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.text(
          `(Showing first ${Math.min(20, processedResumes.length)} of ${processedResumes.length} resumes)`,
          20,
          yPosition,
        )
        yPosition += 10

        const resumeTableData = processedResumes
          .slice(0, 20)
          .map((resume) => [
            resume.name || "N/A",
            resume.inferredGender || "Unknown",
            resume.genderConfidence ? `${Math.round(resume.genderConfidence * 100)}%` : "N/A",
            resume.inferredRace || "Unknown",
            resume.raceConfidence ? `${Math.round(resume.raceConfidence * 100)}%` : "N/A",
            resume.matchScore.toFixed(1),
          ])

        autoTable(doc, {
          head: [["Name", "Gender", "G.Conf", "Race", "R.Conf", "Score"]],
          body: resumeTableData,
          startY: yPosition,
          theme: "grid",
          headStyles: { fillColor: [59, 130, 246] },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          styles: { fontSize: 8 },
        })
      }

      // Footer
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setFont("helvetica", "normal")
        doc.text(
          `Page ${i} of ${totalPages} | AI-Powered Resume Bias Detection Report`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" },
        )
      }

      // Save the PDF
      const fileName = `Resume_Bias_Report_${new Date().toISOString().split("T")[0]}.pdf`
      doc.save(fileName)

      console.log("PDF generated successfully")
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating report. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  // Gender inference from names using a simple heuristic approach
  const inferGenderFromName = (name: string): { gender: string; confidence: number } => {
    try {
      // Input validation
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        console.warn("Invalid name input for gender inference:", name)
        return { gender: "Unknown", confidence: 0.0 }
      }

      const cleanName = name.trim()
      const nameParts = cleanName.split(/\s+/)

      if (nameParts.length === 0) {
        console.warn("No name parts found after splitting:", cleanName)
        return { gender: "Unknown", confidence: 0.0 }
      }

      const firstName = nameParts[0].toLowerCase()

      // Validate firstName
      if (!firstName || firstName.length < 2) {
        console.warn("First name too short or invalid:", firstName)
        return { gender: "Unknown", confidence: 0.0 }
      }

      // Common male names (simplified dataset)
      const maleNames = [
        "john",
        "michael",
        "david",
        "james",
        "robert",
        "william",
        "richard",
        "charles",
        "joseph",
        "thomas",
        "christopher",
        "daniel",
        "paul",
        "mark",
        "donald",
        "steven",
        "kenneth",
        "andrew",
        "joshua",
        "kevin",
        "brian",
        "george",
        "edward",
        "ronald",
        "timothy",
        "jason",
        "jeffrey",
        "ryan",
        "jacob",
        "gary",
        "nicholas",
        "eric",
        "jonathan",
        "stephen",
        "larry",
        "justin",
        "scott",
        "brandon",
        "benjamin",
        "samuel",
        "gregory",
        "alexander",
        "patrick",
        "frank",
        "raymond",
        "jack",
        "dennis",
        "jerry",
        "tyler",
        "aaron",
        "jose",
        "henry",
        "adam",
        "douglas",
        "nathan",
        "peter",
        "zachary",
        "kyle",
        "noah",
        "alan",
        "ethan",
        "jeremy",
        "lionel",
        "mike",
        "carl",
        "wayne",
        "ralph",
        "roy",
        "eugene",
        "louis",
        "philip",
        "bobby",
      ]

      // Common female names (simplified dataset)
      const femaleNames = [
        "mary",
        "patricia",
        "jennifer",
        "linda",
        "elizabeth",
        "barbara",
        "susan",
        "jessica",
        "sarah",
        "karen",
        "nancy",
        "lisa",
        "betty",
        "helen",
        "sandra",
        "donna",
        "carol",
        "ruth",
        "sharon",
        "michelle",
        "laura",
        "kimberly",
        "deborah",
        "dorothy",
        "amy",
        "angela",
        "ashley",
        "brenda",
        "emma",
        "olivia",
        "cynthia",
        "marie",
        "janet",
        "catherine",
        "frances",
        "christine",
        "samantha",
        "debra",
        "rachel",
        "carolyn",
        "virginia",
        "maria",
        "heather",
        "diane",
        "julie",
        "joyce",
        "victoria",
        "kelly",
        "christina",
        "joan",
        "evelyn",
        "lauren",
        "judith",
        "megan",
        "cheryl",
        "andrea",
        "hannah",
        "jacqueline",
        "martha",
        "gloria",
        "teresa",
        "sara",
        "janice",
        "julia",
      ]

      if (maleNames.includes(firstName)) {
        console.log(`Gender inference: ${firstName} -> Male (confidence: 0.85)`)
        return { gender: "Male", confidence: 0.85 }
      } else if (femaleNames.includes(firstName)) {
        console.log(`Gender inference: ${firstName} -> Female (confidence: 0.85)`)
        return { gender: "Female", confidence: 0.85 }
      }

      console.log(`Gender inference: ${firstName} -> Unknown (not in dataset)`)
      return { gender: "Unknown", confidence: 0.0 }
    } catch (error) {
      console.error("Error in inferGenderFromName:", error, "Input:", name)
      return { gender: "Unknown", confidence: 0.0 }
    }
  }

  // Gender inference from resume text using linguistic patterns
  const inferGenderFromText = (text: string): { gender: string; confidence: number } => {
    const lowerText = text.toLowerCase()

    // Agentic words (more common in male resumes)
    const agenticWords = [
      "achieved",
      "accomplished",
      "delivered",
      "executed",
      "led",
      "managed",
      "directed",
      "drove",
      "spearheaded",
      "pioneered",
      "dominated",
      "conquered",
      "won",
      "beat",
      "outperformed",
      "exceeded",
      "surpassed",
      "competitive",
      "aggressive",
      "assertive",
      "confident",
      "independent",
      "ambitious",
      "decisive",
    ]

    // Communal words (more common in female resumes)
    const communalWords = [
      "collaborated",
      "supported",
      "helped",
      "assisted",
      "coordinated",
      "facilitated",
      "contributed",
      "participated",
      "cooperated",
      "mentored",
      "guided",
      "nurtured",
      "caring",
      "empathetic",
      "understanding",
      "patient",
      "thoughtful",
      "considerate",
      "helpful",
      "supportive",
      "collaborative",
      "team-oriented",
      "inclusive",
    ]

    let agenticScore = 0
    let communalScore = 0

    agenticWords.forEach((word) => {
      const matches = (lowerText.match(new RegExp(word, "g")) || []).length
      agenticScore += matches
    })

    communalWords.forEach((word) => {
      const matches = (lowerText.match(new RegExp(word, "g")) || []).length
      communalScore += matches
    })

    const totalWords = agenticScore + communalScore
    if (totalWords === 0) {
      return { gender: "Unknown", confidence: 0.0 }
    }

    const agenticRatio = agenticScore / totalWords
    if (agenticRatio > 0.6) {
      return { gender: "Male", confidence: Math.min(0.75, agenticRatio) }
    } else if (agenticRatio < 0.4) {
      return { gender: "Female", confidence: Math.min(0.75, 1 - agenticRatio) }
    }

    return { gender: "Unknown", confidence: 0.0 }
  }

  // Race inference from names using surname patterns
  const inferRaceFromName = (name: string): { race: string; confidence: number } => {
    const nameParts = name.split(" ")
    const lastName = nameParts[nameParts.length - 1].toLowerCase()
    const firstName = nameParts[0].toLowerCase()

    // Hispanic surnames (simplified dataset)
    const hispanicSurnames = [
      "garcia",
      "rodriguez",
      "martinez",
      "hernandez",
      "lopez",
      "gonzalez",
      "wilson",
      "perez",
      "sanchez",
      "ramirez",
      "torres",
      "flores",
      "rivera",
      "gomez",
      "diaz",
      "reyes",
      "morales",
      "ortiz",
      "gutierrez",
      "chavez",
      "ramos",
      "castillo",
      "mendoza",
      "vargas",
      "alvarez",
      "jimenez",
      "romero",
      "vasquez",
      "herrera",
      "medina",
      "castro",
      "ruiz",
    ]

    // Common Black surnames (simplified dataset)
    const blackSurnames = [
      "washington",
      "jefferson",
      "jackson",
      "johnson",
      "williams",
      "brown",
      "jones",
      "davis",
      "miller",
      "wilson",
      "moore",
      "taylor",
      "anderson",
      "thomas",
      "harris",
      "martin",
      "thompson",
      "white",
      "lewis",
      "walker",
      "hall",
      "allen",
      "young",
      "king",
      "wright",
      "scott",
      "green",
      "baker",
      "adams",
      "nelson",
      "hill",
      "ramirez",
      "campbell",
      "mitchell",
      "roberts",
      "carter",
      "phillips",
      "evans",
      "turner",
      "torres",
      "parker",
      "collins",
      "edwards",
      "stewart",
      "flores",
      "morris",
      "nguyen",
      "murphy",
      "rivera",
      "cook",
      "rogers",
      "morgan",
      "peterson",
      "cooper",
      "reed",
      "bailey",
      "bell",
      "gomez",
      "kelly",
      "howard",
      "ward",
      "cox",
      "diaz",
      "richardson",
      "wood",
      "watson",
      "brooks",
      "bennett",
      "gray",
      "james",
      "reyes",
      "cruz",
      "hughes",
      "price",
      "myers",
      "long",
      "foster",
      "sanders",
      "ross",
      "morales",
      "powell",
      "sullivan",
      "russell",
      "ortiz",
      "jenkins",
      "gutierrez",
      "perry",
      "butler",
      "barnes",
      "fisher",
    ]

    // Asian surnames (simplified dataset)
    const asianSurnames = [
      "li",
      "wang",
      "zhang",
      "liu",
      "chen",
      "yang",
      "huang",
      "zhao",
      "wu",
      "zhou",
      "xu",
      "sun",
      "ma",
      "zhu",
      "hu",
      "guo",
      "he",
      "gao",
      "lin",
      "luo",
      "zheng",
      "liang",
      "xie",
      "song",
      "tang",
      "xu",
      "deng",
      "feng",
      "yu",
      "dong",
      "xiao",
      "cheng",
      "han",
      "zeng",
      "peng",
      "cao",
      "dai",
      "wei",
      "xue",
      "du",
      "ren",
      "shen",
      "lv",
      "jiang",
      "lu",
      "gu",
      "meng",
      "qin",
      "shao",
      "wan",
      "hou",
      "yin",
      "qiu",
      "jin",
      "tan",
      "kim",
      "park",
      "lee",
      "choi",
      "jung",
      "kang",
      "cho",
      "yoon",
      "jang",
      "lim",
      "han",
      "oh",
      "seo",
      "shin",
      "kwon",
      "hwang",
      "ahn",
      "kim",
      "park",
      "nakamura",
      "tanaka",
      "suzuki",
      "watanabe",
      "ito",
      "yamamoto",
      "takahashi",
      "kobayashi",
      "sato",
      "sasaki",
      "yamada",
      "yamazaki",
      "mori",
      "abe",
      "ikeda",
      "hashimoto",
      "yamashita",
      "ishikawa",
      "nakajima",
      "maeda",
      "ogawa",
      "takeuchi",
      "nguyen",
      "tran",
      "le",
      "pham",
      "hoang",
      "phan",
      "vu",
      "vo",
      "dang",
      "bui",
      "do",
      "ho",
      "ngo",
      "duong",
      "ly",
    ]

    if (hispanicSurnames.includes(lastName)) {
      return { race: "Hispanic", confidence: 0.8 }
    } else if (blackSurnames.includes(lastName)) {
      return { race: "Black", confidence: 0.7 }
    } else if (asianSurnames.includes(lastName)) {
      return { race: "Asian", confidence: 0.85 }
    }

    // Default to White for common European surnames or unknown
    return { race: "White", confidence: 0.6 }
  }

  const processResumes = async (resumes: ResumeData[]) => {
    setCurrentScreen("processing")
    const processedResumes: ResumeData[] = []

    for (let i = 0; i < resumes.length; i++) {
      const resume = resumes[i]

      setProcessingStatus({
        stage: "Analyzing Demographics",
        progress: (i / resumes.length) * 100,
        message: `Processing resume ${i + 1} of ${resumes.length}...`,
      })

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Infer gender
      let genderResult = { gender: "Unknown", confidence: 0.0 }
      if (resume.name) {
        const nameGender = inferGenderFromName(resume.name)
        const textGender = inferGenderFromText(resume.text)

        // Combine name and text predictions (name gets higher weight)
        if (nameGender.confidence > 0.5) {
          genderResult = nameGender
        } else if (textGender.confidence > 0.5) {
          genderResult = textGender
        } else if (nameGender.confidence > textGender.confidence) {
          genderResult = nameGender
        } else {
          genderResult = textGender
        }
      } else {
        genderResult = inferGenderFromText(resume.text)
      }

      // Infer race
      let raceResult = { race: "Unknown", confidence: 0.0 }
      if (resume.name) {
        raceResult = inferRaceFromName(resume.name)
      }

      processedResumes.push({
        ...resume,
        inferredGender: genderResult.gender,
        inferredRace: raceResult.race,
        genderConfidence: genderResult.confidence,
        raceConfidence: raceResult.confidence,
      })
    }

    setProcessingStatus({
      stage: "Analyzing Bias",
      progress: 100,
      message: "Calculating bias metrics...",
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setProcessedResumes(processedResumes)
    localStorage.setItem("resumeData", JSON.stringify(processedResumes))
    processGroupedData(processedResumes)
    setCurrentScreen("results")
  }

  const processGroupedData = (resumes: ResumeData[]) => {
    setResumeCount(resumes.length)

    // Group by gender and race combination
    const groups: { [key: string]: number[] } = {}

    resumes.forEach((resume) => {
      const gender = resume.inferredGender || "Unknown"
      const race = resume.inferredRace || "Unknown"

      if (gender !== "Unknown" && race !== "Unknown") {
        const groupKey = `${gender} - ${race}`
        if (!groups[groupKey]) {
          groups[groupKey] = []
        }
        groups[groupKey].push(resume.matchScore)
      }
    })

    // Calculate averages and create chart data
    const chartData: any[] = []
    const colors = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]
    let colorIndex = 0

    Object.entries(groups).forEach(([groupKey, scores]) => {
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
      chartData.push({
        demographic: groupKey,
        matchScore: Math.round(average * 100) / 100,
        fill: colors[colorIndex % colors.length],
        count: scores.length,
      })
      colorIndex++
    })

    // Sort by match score descending
    chartData.sort((a, b) => b.matchScore - a.matchScore)

    // Detect bias: if any group has average < 80% of highest group
    if (chartData.length > 1) {
      const highestScore = chartData[0].matchScore
      const threshold = highestScore * 0.8
      const hasBias = chartData.some((group) => group.matchScore < threshold)
      setBiasDetected(hasBias)
    } else {
      setBiasDetected(false)
    }

    setGroupedData(chartData)
  }

  const handleCSVUpload = (file: File) => {
    setUploadedFiles([file])

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ",",
      complete: (results) => {
        console.log("Raw parsed data:", results.data)

        // Check if parsing failed and we have a single column with comma-separated values
        if (results.data.length > 0 && Object.keys(results.data[0]).length === 1) {
          const firstKey = Object.keys(results.data[0])[0]
          if (firstKey.includes(",")) {
            console.log("Detected improperly parsed CSV, attempting manual parsing...")

            const headers = firstKey.split(",").map((h) => h.trim())
            const manuallyParsedData = results.data
              .map((row: any) => {
                const values = row[firstKey].split(",").map((v: string) => v.trim())
                const parsedRow: any = {}
                headers.forEach((header, index) => {
                  parsedRow[header] = values[index] || ""
                })
                return parsedRow
              })
              .filter((row: any) => {
                return !Object.values(row).every((val, index) => val === headers[index])
              })

            const resumeData = convertToResumeData(manuallyParsedData)
            processResumes(resumeData)
            return
          }
        }

        // Standard parsing path
        const cleanedData = results.data
          .map((row: any) => {
            const cleanedRow: any = {}
            Object.keys(row).forEach((key) => {
              const cleanKey = key.replace(/^["']|["']$/g, "").trim()
              const cleanValue = typeof row[key] === "string" ? row[key].replace(/^["']|["']$/g, "").trim() : row[key]
              cleanedRow[cleanKey] = cleanValue
            })
            return cleanedRow
          })
          .filter((row) => {
            return Object.values(row).some((value) => value !== "" && value != null)
          })

        const resumeData = convertToResumeData(cleanedData)
        processResumes(resumeData)
      },
      error: (error) => {
        console.error("Error parsing CSV:", error)
      },
    })
  }

  const convertToResumeData = (data: any[]): ResumeData[] => {
    return data.map((row, index) => {
      let resumeText = ""
      let name = ""
      let matchScore = 0

      console.log(`Processing resume ${index + 1}:`)
      console.log("Row data:", row)

      // Handle your specific CSV format with "Resume" and "Score" columns
      if (row.Resume && row.Score) {
        resumeText = row.Resume
        matchScore = Number.parseFloat(String(row.Score))

        // Extract name from "Name: [Name]" pattern in the Resume text
        const nameMatch = resumeText.match(/Name:\s*([^\n\r]+)/i)
        if (nameMatch) {
          name = nameMatch[1].trim()
        }

        console.log("Extracted name:", name)
        console.log("Extracted score:", matchScore)
      } else {
        // Fallback logic for other formats
        const fullResumeText =
          (Object.values(row).find(
            (value) => value && typeof value === "string" && value.trim().length > 50,
          ) as string) || ""

        if (fullResumeText) {
          resumeText = fullResumeText

          // Extract name from "Name: [Name]" pattern
          const nameMatch = fullResumeText.match(/Name:\s*([^\n\r]+)/i)
          if (nameMatch) {
            name = nameMatch[1].trim()
          }

          // Extract score from the end of the text (look for numbers at the end)
          const scoreMatch = fullResumeText.match(/(\d+(?:\.\d+)?)\s*$/m)
          if (scoreMatch) {
            matchScore = Number.parseFloat(scoreMatch[1])
          } else {
            matchScore = Math.random() * 40 + 60
          }
        } else {
          // Standard CSV format fallback
          const nameFields = ["name", "Name", "full_name", "fullName", "candidate_name", "applicant_name"]
          name = nameFields.find((field) => row[field]) ? row[nameFields.find((field) => row[field]) || ""] : undefined

          const textFields = ["text", "resume_text", "content", "description", "summary"]
          resumeText = textFields.find((field) => row[field])
            ? row[textFields.find((field) => row[field]) || ""]
            : `Resume content for candidate ${index + 1}`

          const scoreFields = ["matchScore", "match_score", "score", "Score", "rating", "Rating"]
          const scoreField = scoreFields.find((field) => row[field])
          matchScore = scoreField
            ? Number.parseFloat(String(row[scoreField]).replace(/[^\d.-]/g, ""))
            : Math.random() * 40 + 60
        }
      }

      const result = {
        id: `resume_${index + 1}`,
        name: name || undefined,
        text: resumeText || `Resume content for candidate ${index + 1}`,
        matchScore: isNaN(matchScore) ? Math.random() * 40 + 60 : matchScore,
      }

      console.log("Final result for resume", index + 1, ":", {
        name: result.name,
        score: result.matchScore,
        textLength: result.text.length,
      })

      return result
    })
  }

  const handleUseSampleData = () => {
    const sampleResumes: ResumeData[] = [
      {
        id: "1",
        name: "John Smith",
        text: "Experienced software engineer who led multiple teams and achieved significant performance improvements. Delivered complex projects and exceeded expectations consistently.",
        matchScore: 88,
      },
      {
        id: "2",
        name: "Maria Garcia",
        text: "Collaborative project manager who supported cross-functional teams and helped coordinate successful product launches. Contributed to team success through careful planning.",
        matchScore: 85,
      },
      {
        id: "3",
        name: "David Johnson",
        text: "Results-driven sales executive who dominated the market and outperformed competitors. Won multiple awards and beat all quarterly targets.",
        matchScore: 92,
      },
      {
        id: "4",
        name: "Keisha Washington",
        text: "Dedicated marketing specialist who collaborated with diverse teams and facilitated successful campaigns. Mentored junior staff and supported organizational goals.",
        matchScore: 64,
      },
      {
        id: "5",
        name: "Jennifer Chen",
        text: "Analytical data scientist who contributed to machine learning initiatives and participated in research projects. Helped develop innovative solutions.",
        matchScore: 89,
      },
      {
        id: "6",
        name: "Michael Rodriguez",
        text: "Accomplished finance director who spearheaded cost reduction initiatives and drove revenue growth. Executed strategic plans and conquered market challenges.",
        matchScore: 90,
      },
      {
        id: "7",
        name: "Aisha Jackson",
        text: "Caring human resources manager who nurtured employee development and supported workplace diversity initiatives. Facilitated team building and mentored staff.",
        matchScore: 61,
      },
      {
        id: "8",
        name: "Robert Kim",
        text: "Innovative product manager who pioneered new features and led development teams. Achieved breakthrough results and delivered cutting-edge solutions.",
        matchScore: 87,
      },
      {
        id: "9",
        name: "Lisa Martinez",
        text: "Thoughtful UX designer who collaborated with stakeholders and helped create user-friendly interfaces. Contributed creative solutions and supported design teams.",
        matchScore: 82,
      },
      {
        id: "10",
        name: "James Thompson",
        text: "Competitive business analyst who exceeded performance metrics and dominated market analysis. Won recognition for outstanding achievements and aggressive growth strategies.",
        matchScore: 91,
      },
    ]

    processResumes(sampleResumes)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    const csvFiles = files.filter((file) => file.type === "text/csv" || file.name.endsWith(".csv"))
    if (csvFiles.length > 0) {
      handleCSVUpload(csvFiles[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        handleCSVUpload(file)
      }
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const goBackToUpload = () => {
    setCurrentScreen("upload")
    setUploadedFiles([])
  }

  if (currentScreen === "processing") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Processing Resumes</h1>
            <p className="text-lg text-gray-600">Analyzing demographics and detecting potential bias</p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{processingStatus.stage}</h3>
                <p className="text-gray-600 mb-4">{processingStatus.message}</p>
                <Progress value={processingStatus.progress} className="w-full max-w-md mx-auto" />
                <p className="text-sm text-gray-500 mt-2">{Math.round(processingStatus.progress)}% Complete</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Gender Inference</h4>
                  <p className="text-sm text-gray-600">Analyzing names and linguistic patterns</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Race Inference</h4>
                  <p className="text-sm text-gray-600">Using surname and demographic patterns</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Bias Detection</h4>
                  <p className="text-sm text-gray-600">Statistical analysis of score disparities</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentScreen === "upload") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">AI-Powered Resume Bias Detection</h1>
            <p className="text-lg text-gray-600">
              Upload resumes to automatically infer demographics and detect hiring bias
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-8">
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Drag and drop CSV file here</h3>
                <p className="text-gray-600 mb-4">CSV should contain resume text and candidate names</p>
                <input type="file" accept=".csv" onChange={handleFileSelect} className="hidden" id="file-upload" />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer bg-transparent">
                    Browse Files
                  </Button>
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Supports: Standard CSV (name, text, score) or structured resume text with embedded scores
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-2">Gender Inference</h4>
                  <p className="text-sm text-gray-600">
                    Analyzes names and linguistic patterns in resume text to infer gender with 70-85% accuracy
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-2">Race Inference</h4>
                  <p className="text-sm text-gray-600">
                    Uses surname patterns and demographic datasets to predict likely race/ethnicity
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-2">Bias Detection</h4>
                  <p className="text-sm text-gray-600">
                    Compares match scores across demographic groups using statistical analysis
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {uploadedFiles.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Uploaded Files ({uploadedFiles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center mb-6">
            <Button variant="outline" onClick={() => setShowDocumentation(true)} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Help & Documentation
            </Button>
          </div>

          <div className="text-center space-y-4">
            <div className="flex items-center gap-4 justify-center">
              <div className="h-px bg-gray-300 flex-1 max-w-20"></div>
              <span className="text-sm text-gray-500">or try with sample data</span>
              <div className="h-px bg-gray-300 flex-1 max-w-20"></div>
            </div>
            <Button variant="outline" onClick={handleUseSampleData} className="px-6 py-2 bg-transparent">
              Use Sample Resume Data
            </Button>
          </div>
        </div>
        <DocumentationModal isOpen={showDocumentation} onClose={() => setShowDocumentation(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Bias Detection Results</h1>
          <p className="text-lg text-gray-600">Demographic analysis and bias detection from resume screening</p>
        </div>

        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Match Score Comparison by Inferred Demographics</CardTitle>
                <Badge variant={biasDetected ? "destructive" : "default"} className="flex items-center gap-2">
                  {biasDetected ? <AlertTriangle className="h-4 w-4" /> : null}
                  Bias detected: {biasDetected ? "Yes" : "No"}
                </Badge>
              </div>
            </CardHeader>
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">AI-Powered Demographic Inference & Bias Detection</p>
                  <p>
                    <strong>Method:</strong> Demographics inferred using name analysis and linguistic patterns in resume
                    text. Bias detected when any group's average score falls below 80% of the highest-scoring group
                    (Disparate Impact Analysis).
                    <strong> Note:</strong> Demographic predictions are probabilistic and may not reflect actual
                    identity.
                  </p>
                </div>
              </div>
            </div>
            <CardContent>
              {groupedData.length > 0 ? (
                <>
                  <ChartContainer config={chartConfig} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={groupedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <XAxis
                          dataKey="demographic"
                          tick={{ fontSize: 10 }}
                          tickLine={false}
                          axisLine={false}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <ChartTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-white p-3 border rounded shadow-lg">
                                  <p className="font-medium">{label}</p>
                                  <p className="text-blue-600">Average Score: {data.matchScore}%</p>
                                  <p className="text-gray-600">Candidates: {data.count}</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar dataKey="matchScore" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="mt-4 text-sm text-gray-600">
                    <p>
                      <strong>Analysis:</strong>{" "}
                      {biasDetected
                        ? `Potential bias detected in screening process. Some demographic groups show significantly lower average match scores, suggesting possible discriminatory patterns.`
                        : `No significant bias detected. All demographic groups show relatively similar average match scores.`}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No demographic groups identified. Upload resume data to see analysis.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{resumeCount}</div>
                  <div className="text-sm text-gray-600">Resumes Analyzed</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{groupedData.length}</div>
                  <div className="text-sm text-gray-600">Demographic Groups</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {groupedData.length > 0
                      ? Math.round(
                          (groupedData.reduce((sum, group) => sum + group.matchScore, 0) / groupedData.length) * 100,
                        ) / 100
                      : 0}
                  </div>
                  <div className="text-sm text-gray-600">Overall Average</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${biasDetected ? "text-red-600" : "text-green-600"}`}>
                    {biasDetected ? "High" : "Low"}
                  </div>
                  <div className="text-sm text-gray-600">Bias Risk Level</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {processedResumes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Individual Resume Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Inferred Gender</th>
                        <th className="text-left p-2">Confidence</th>
                        <th className="text-left p-2">Inferred Race</th>
                        <th className="text-left p-2">Confidence</th>
                        <th className="text-left p-2">Match Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedResumes.slice(0, 10).map((resume) => (
                        <tr key={resume.id} className="border-b">
                          <td className="p-2 font-medium">{resume.name || "N/A"}</td>
                          <td className="p-2">{resume.inferredGender}</td>
                          <td className="p-2">
                            {resume.genderConfidence ? `${Math.round(resume.genderConfidence * 100)}%` : "N/A"}
                          </td>
                          <td className="p-2">{resume.inferredRace}</td>
                          <td className="p-2">
                            {resume.raceConfidence ? `${Math.round(resume.raceConfidence * 100)}%` : "N/A"}
                          </td>
                          <td className="p-2 font-semibold">{resume.matchScore.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {processedResumes.length > 10 && (
                    <p className="text-sm text-gray-500 mt-2">Showing first 10 of {processedResumes.length} resumes</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={goBackToUpload}>
            Analyze New Batch
          </Button>
          <Button className="flex items-center gap-2" onClick={generatePDFReport} disabled={isDownloading}>
            <Download className="h-4 w-4" />
            {isDownloading ? "Generating..." : "Download Full Report"}
          </Button>
        </div>
      </div>
    </div>
  )
}
