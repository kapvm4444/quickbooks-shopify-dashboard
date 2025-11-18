import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialCard } from "@/components/FinancialCard";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
} from "lucide-react";

// TikTok icon component (since it's not in lucide-react)
const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z" />
  </svg>
);

const staticData = {
  platformData: {
    Instagram: { followers: 25000, engagement: 2.5, reach: 150000, posts: 30 },
    Facebook: { followers: 15000, engagement: 1.8, reach: 120000, posts: 25 },
    Twitter: { followers: 10000, engagement: 1.2, reach: 80000, posts: 50 },
    TikTok: { followers: 50000, engagement: 5.5, reach: 500000, posts: 40 },
    YouTube: { followers: 5000, engagement: 3.0, reach: 60000, posts: 10 },
  },
  totalFollowers: 105000,
  averageEngagement: 2.8,
  totalReach: 910000,
  totalPosts: 155,
  chartData: [
    { name: "Jan", followers: 80000 },
    { name: "Feb", followers: 85000 },
    { name: "Mar", followers: 90000 },
    { name: "Apr", followers: 95000 },
    { name: "May", followers: 100000 },
    { name: "Jun", followers: 105000 },
  ],
};

export default function SocialMedia() {
  const {
    platformData,
    totalFollowers,
    averageEngagement,
    totalReach,
    totalPosts,
    chartData,
  } = staticData;

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const platformIcons = {
    Instagram: <Instagram className="w-6 h-6 text-pink-500" />,
    Facebook: <Facebook className="w-6 h-6 text-blue-600" />,
    Twitter: <Twitter className="w-6 h-6 text-sky-500" />,
    TikTok: <TikTokIcon className="w-6 h-6" />,
    YouTube: <Youtube className="w-6 h-6 text-red-600" />,
  };

  const audienceDemographics = {
    gender: [
      { name: "Female", value: 65, color: "#ec4899" },
      { name: "Male", value: 35, color: "#3b82f6" },
    ],
    age: [
      { range: "18-24", value: 40 },
      { range: "25-34", value: 35 },
      { range: "35-44", value: 15 },
      { range: "45+", value: 10 },
    ],
  };

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">
          Social Media Analytics
        </h1>

        {/* Platform Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(platformData).map(([platform, data]) => (
            <Card key={platform}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {platformIcons[platform]}
                  {platform}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(data.followers)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.engagement}% engagement
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Aggregate Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FinancialCard
            title="Total Followers"
            value={formatNumber(totalFollowers)}
            change={5.2}
            icon={<Users className="h-4 w-4" />}
          />
          <FinancialCard
            title="Avg. Engagement Rate"
            value={`${averageEngagement.toFixed(1)}%`}
            change={-2.1}
            icon={<Heart className="h-4 w-4" />}
          />
          <FinancialCard
            title="Total Reach (30 days)"
            value={formatNumber(totalReach)}
            change={12.8}
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <FinancialCard
            title="Total Posts (30 days)"
            value={totalPosts.toString()}
            change={8.3}
            icon={<MessageCircle className="h-4 w-4" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Follower Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Follower Growth (6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Line type="monotone" dataKey="followers" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Audience Demographics */}
          <Card>
            <CardHeader>
              <CardTitle>Audience Demographics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-center font-semibold mb-2">Gender</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={audienceDemographics.gender}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {audienceDemographics.gender.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-center font-semibold mb-2">Age Range</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={audienceDemographics.age} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="range" type="category" width={50} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
