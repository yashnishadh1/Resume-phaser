import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GROWTH_DATA = [
  { name: "Jan", candidates: 400 },
  { name: "Feb", candidates: 300 },
  { name: "Mar", candidates: 550 },
  { name: "Apr", candidates: 480 },
  { name: "May", candidates: 700 },
  { name: "Jun", candidates: 1200 },
];

const SKILLS_DATA = [
  { name: "React", count: 850 },
  { name: "Node.js", count: 620 },
  { name: "Python", count: 540 },
  { name: "TypeScript", count: 480 },
  { name: "AWS", count: 390 },
];

export default function Analytics() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-zinc-900 mb-2">Analytics</h1>
        <p className="text-zinc-500">Detailed insights into your candidate database and parsing metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate Growth Chart */}
        <Card className="bg-white border-zinc-200">
          <CardHeader>
            <CardTitle className="text-zinc-900 font-display">Candidate Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={GROWTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCandidates" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252a38" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1e28', border: '1px solid #252a38', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#4ade80' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="candidates" 
                    stroke="#4ade80" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCandidates)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Skills Distribution */}
        <Card className="bg-white border-zinc-200">
          <CardHeader>
            <CardTitle className="text-zinc-900 font-display">Top Skills Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SKILLS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#252a38" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#e2e2e9" fontSize={12} tickLine={false} axisLine={false} width={80} />
                  <Tooltip 
                    cursor={{ fill: '#252a38' }}
                    contentStyle={{ backgroundColor: '#1a1e28', border: '1px solid #252a38', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#4ade80" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-stitch-surface to-stitch-card border-zinc-200">
          <CardContent className="p-6">
            <h3 className="text-zinc-500 text-sm font-medium mb-2">Average Parsing Accuracy</h3>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-display font-bold text-zinc-900">98.5%</span>
              <span className="text-sm text-[#10b981] mb-1">+1.2%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-stitch-surface to-stitch-card border-zinc-200">
          <CardContent className="p-6">
            <h3 className="text-zinc-500 text-sm font-medium mb-2">Time Saved (Est.)</h3>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-display font-bold text-zinc-900">450h</span>
              <span className="text-sm text-[#10b981] mb-1">This Month</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-stitch-surface to-stitch-card border-zinc-200">
          <CardContent className="p-6">
            <h3 className="text-zinc-500 text-sm font-medium mb-2">Database Size</h3>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-display font-bold text-zinc-900">12.4GB</span>
              <span className="text-sm text-zinc-500 mb-1">/ 50GB Limit</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
