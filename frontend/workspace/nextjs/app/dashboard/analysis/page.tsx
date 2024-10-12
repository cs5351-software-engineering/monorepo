import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { AnalysisChart } from "@/components/analysis-chart"

export const metadata: Metadata = {
  title: "Analysis",
  description: "Project analysis and insights",
}

export default function AnalysisPage() {
  return (
    <div className="space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Analysis</h2>
      <Card>
        <CardHeader>
          <CardTitle>Project Performance</CardTitle>
          <CardDescription>Analysis of your project performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          {/* <AnalysisChart /> */}
        </CardContent>
      </Card>
    </div>
  )
}