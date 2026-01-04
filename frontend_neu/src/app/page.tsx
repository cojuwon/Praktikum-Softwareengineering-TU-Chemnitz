import { FolderOpen, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components';
import Link from 'next/link';

// Mock data for dashboard
const statsData = [
  {
    label: 'Aktive Fälle',
    value: '2',
    subtext: 'Insgesamt 3 Fälle in 2024',
    icon: FolderOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    label: 'Offene Anfragen',
    value: '2',
    subtext: '2 heute eingegangen',
    icon: MessageSquare,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    label: 'Nächster Export',
    value: '30. Juni',
    subtext: null,
    link: { href: '/statistik', label: 'Zum Export' },
    icon: Clock,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
  },
];

const recentCases = [
  {
    id: 'B-2401',
    initials: 'A.S.',
    initialsColor: 'bg-blue-100 text-blue-700',
    title: 'Fall B-2401',
    description: 'Psychosoziale Beratung',
    time: 'Vor 2 Std.',
  },
  {
    id: 'B-2402',
    initials: 'K.M.',
    initialsColor: 'bg-emerald-100 text-emerald-700',
    title: 'Fall B-2402',
    description: 'Krisenintervention',
    time: 'Vor 1 Tag',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="py-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
                    <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                    {stat.subtext && (
                      <p className="text-xs text-slate-400">{stat.subtext}</p>
                    )}
                    {stat.link && (
                      <Link 
                        href={stat.link.href}
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        {stat.link.label}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                  <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellzugriff: Zuletzt bearbeitet</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {recentCases.map((item) => (
              <Link
                key={item.id}
                href={`/faelle/${item.id}`}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50"
              >
                <div className={`flex items-center justify-center w-10 h-10 text-sm font-medium rounded-full ${item.initialsColor}`}>
                  {item.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.description}</p>
                </div>
                <span className="text-xs text-slate-400">{item.time}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
