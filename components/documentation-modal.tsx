"use client"

import { X, FileText, BarChart3, AlertTriangle, Download, Upload, Brain, Users, CheckCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DocumentationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DocumentationModal({ isOpen, onClose }: DocumentationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">User Documentation</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-8">
          {/* Quick Start */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Quick Start Guide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Upload className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold mb-2">1. Upload CSV</h4>
                  <p className="text-sm text-gray-600">Upload your resume data in CSV format</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold mb-2">2. AI Analysis</h4>
                  <p className="text-sm text-gray-600">AI infers demographics and analyzes bias</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Download className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold mb-2">3. Get Report</h4>
                  <p className="text-sm text-gray-600">Download comprehensive bias analysis report</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CSV Format Requirements */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              CSV Format Requirements
            </h3>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Badge variant="default">Recommended</Badge>
                    Standard Format
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <code className="text-sm">
                      Resume,Score
                      <br />
                      "Name: John Smith
                      <br />
                      Email: john@example.com
                      <br />
                      Experience: Software Engineer...",85
                      <br />
                      "Name: Maria Garcia
                      <br />
                      Email: maria@example.com
                      <br />
                      Experience: Project Manager...",92
                    </code>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-green-700 mb-2">✅ Required Columns:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>
                          • <strong>Resume:</strong> Full resume text
                        </li>
                        <li>
                          • <strong>Score:</strong> Numerical match score
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-blue-700 mb-2">📋 Resume Text Should Include:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Name: [Full Name]</li>
                        <li>• Work experience descriptions</li>
                        <li>• Skills and qualifications</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Badge variant="secondary">Alternative</Badge>
                    Legacy Formats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">The tool also supports these column names:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>Name columns:</strong>
                      <ul className="text-gray-600 mt-1">
                        <li>• name, Name</li>
                        <li>• full_name, fullName</li>
                        <li>• candidate_name</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Text columns:</strong>
                      <ul className="text-gray-600 mt-1">
                        <li>• text, resume_text</li>
                        <li>• content, description</li>
                        <li>• summary</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Score columns:</strong>
                      <ul className="text-gray-600 mt-1">
                        <li>• score, Score</li>
                        <li>• matchScore, match_score</li>
                        <li>• rating, Rating</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* How AI Analysis Works */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              How AI Analysis Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Gender Inference
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h5 className="font-semibold text-gray-700">Name Analysis (85% accuracy)</h5>
                    <p className="text-sm text-gray-600">Matches first names against demographic datasets</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-700">Linguistic Patterns (70% accuracy)</h5>
                    <p className="text-sm text-gray-600">Analyzes word choice and language patterns in resume text</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>Examples:</strong> "Led," "achieved," "dominated" (more common in male resumes) vs.
                      "collaborated," "supported," "facilitated" (more common in female resumes)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    Race/Ethnicity Inference
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h5 className="font-semibold text-gray-700">Surname Analysis (60-85% accuracy)</h5>
                    <p className="text-sm text-gray-600">Matches surnames against census and demographic data</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-700">Categories Detected</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Hispanic/Latino surnames</li>
                      <li>• Asian surnames (East Asian, Southeast Asian)</li>
                      <li>• Common Black surnames</li>
                      <li>• White/European surnames (default)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Bias Detection Methodology */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              Bias Detection Methodology
            </h3>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Disparate Impact Analysis</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Uses the "80% Rule" from employment law to detect bias:
                    </p>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-orange-800">
                        <strong>Bias Detected When:</strong> Any demographic group's average score falls below 80% of
                        the highest-scoring group's average.
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Statistical Comparison</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Groups candidates by inferred gender + race</li>
                      <li>• Calculates average match scores per group</li>
                      <li>• Compares groups against highest performer</li>
                      <li>• Flags systematic score disparities</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Understanding Results */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Understanding Your Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-red-700">🚨 Bias Detected</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    When bias is detected, it means one or more demographic groups show significantly lower average
                    scores.
                  </p>
                  <h5 className="font-semibold text-gray-700 mb-2">Recommended Actions:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Review screening criteria for potential bias</li>
                    <li>• Implement blind resume screening</li>
                    <li>• Provide bias training for hiring managers</li>
                    <li>• Use structured interview processes</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-green-700">✅ No Bias Detected</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    All demographic groups show relatively similar average scores, suggesting fair evaluation.
                  </p>
                  <h5 className="font-semibold text-gray-700 mb-2">Continue Best Practices:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Monitor hiring metrics regularly</li>
                    <li>• Maintain current screening practices</li>
                    <li>• Conduct periodic bias audits</li>
                    <li>• Consider expanding demographic tracking</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Important Limitations */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-yellow-600" />
              Important Limitations & Disclaimers
            </h3>
            <Card>
              <CardContent className="p-6">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Key Limitations</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Demographic predictions are probabilistic, not definitive</li>
                    <li>• AI inference may not reflect actual candidate identity</li>
                    <li>• Results should supplement, not replace, human judgment</li>
                    <li>• Tool is for bias detection, not legal compliance certification</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-2">Accuracy Ranges:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Gender (Name): ~85% accuracy</li>
                      <li>• Gender (Text): ~70% accuracy</li>
                      <li>• Race (Surname): 60-85% accuracy</li>
                      <li>• Combined predictions vary by case</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-2">Best Practices:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Use as screening tool, not final decision</li>
                      <li>• Combine with other bias detection methods</li>
                      <li>• Regular audits with larger sample sizes</li>
                      <li>• Consider self-reported demographics when available</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Sample Data */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              Sample Data & Testing
            </h3>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Use the "Use Sample Resume Data" button to test the tool with pre-loaded examples that demonstrate
                  both biased and unbiased scenarios.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-700 mb-2">Sample Data Includes:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 10 diverse candidate profiles</li>
                    <li>• Mix of demographic backgrounds</li>
                    <li>• Varied resume writing styles</li>
                    <li>• Intentional score disparities for testing</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4">
          <div className="flex justify-end">
            <Button onClick={onClose}>Close Documentation</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
