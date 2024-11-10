// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, UserCheck, Menu, Calendar } from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';

const DAILY_TARGET = 20; // Target attendance per day

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchAttendanceData = async () => {
    try {
      const response = await fetch('/api/attendance');
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      setAttendanceData(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
    const interval = setInterval(fetchAttendanceData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const processWeeklyData = () => {
    const dailyCount = {};
    
    // Group attendance by day
    attendanceData.forEach(record => {
      const date = format(parseISO(record.timestamp), 'yyyy-MM-dd');
      dailyCount[date] = (dailyCount[date] || 0) + 1;
    });

    // Get last 7 days
    const days = Array.from({length: 7}, (_, i) => {
      const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
      const count = dailyCount[date] || 0;
      return {
        date,
        count,
        target: DAILY_TARGET,
        percentage: Math.round((count / DAILY_TARGET) * 100),
        day: format(parseISO(date), 'EEE'),
        displayText: `${count}/${DAILY_TARGET}`
      };
    });

    return days;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-red-500 bg-red-950 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  const weeklyData = processWeeklyData();
  const totalToday = weeklyData[6].count;
  const uniqueStudents = new Set(attendanceData.map(entry => entry.uid)).size;
  const weeklyTotal = weeklyData.reduce((sum, day) => sum + day.count, 0);
  const weeklyAverage = Math.round(weeklyTotal / 7);

  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-zinc-900 border-r border-zinc-800 transition-all duration-300`}>
        <div className="p-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-50"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        {sidebarOpen && (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4 text-zinc-50">Dashboard</h2>
            <nav className="space-y-2">
              <a href="#" className="flex items-center space-x-2 p-2 rounded-lg bg-zinc-800 text-zinc-50">
                <Users className="h-5 w-5" />
                <span>Attendance</span>
              </a>
            </nav>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-zinc-900 border-b border-zinc-800 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-zinc-50">Attendance Dashboard</h1>
            <div className="text-sm text-zinc-400">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Today's Check-ins</p>
                    <h3 className="text-2xl font-bold text-zinc-50">{totalToday}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <UserCheck className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Unique Students</p>
                    <h3 className="text-2xl font-bold text-zinc-50">{uniqueStudents}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-500/10 rounded-full">
                    <Calendar className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Weekly Average</p>
                    <h3 className="text-2xl font-bold text-zinc-50">{weeklyAverage}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-yellow-500/10 rounded-full">
                    <Users className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Weekly Total</p>
                    <h3 className="text-2xl font-bold text-zinc-50">{weeklyTotal}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Attendance Chart */}
          <Card className="bg-zinc-900 border-zinc-800 mb-6">
            <CardHeader>
              <CardTitle className="text-zinc-50">Weekly Attendance (Target: {DAILY_TARGET} students/day)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="day"
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF' }}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181B',
                        borderColor: '#3F3F46',
                        borderRadius: '0.5rem',
                        color: '#fff'
                      }}
                      labelStyle={{ color: '#9CA3AF' }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="percentage" 
                      name="Attendance"
                    >
                      {weeklyData.map((entry, index) => (
                        <rect
                          key={`bar-${index}`}
                          fill={
                            entry.percentage >= 90 ? '#22C55E' : 
                            entry.percentage >= 75 ? '#3B82F6' :
                            entry.percentage >= 50 ? '#EAB308' : 
                            '#EF4444'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Color Legend */}
              <div className="mt-6 flex flex-wrap gap-4 justify-center bg-zinc-800/50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#22C55E] rounded"></div>
                  <span className="text-sm text-zinc-400">≥90% (Excellent)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#3B82F6] rounded"></div>
                  <span className="text-sm text-zinc-400">≥75% (Good)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#EAB308] rounded"></div>
                  <span className="text-sm text-zinc-400">≥50% (Average)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#EF4444] rounded"></div>
                  <span className="text-sm text-zinc-400">&lt;50% (Poor)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Summary Table */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-50">Weekly Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left p-4 text-zinc-400 font-medium">Day</th>
                      <th className="text-left p-4 text-zinc-400 font-medium">Date</th>
                      <th className="text-left p-4 text-zinc-400 font-medium">Attendance</th>
                      <th className="text-left p-4 text-zinc-400 font-medium">Target</th>
                      <th className="text-left p-4 text-zinc-400 font-medium">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyData.map((day) => (
                      <tr key={day.date} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                        <td className="p-4 text-zinc-50">{day.day}</td>
                        <td className="p-4 text-zinc-50">{format(parseISO(day.date), 'MMM dd')}</td>
                        <td className="p-4 text-zinc-50">{day.count}</td>
                        <td className="p-4 text-zinc-50">{day.target}</td>
                        <td className="p-4">
                          <span 
                            className={`px-2 py-1 rounded text-sm ${
                              day.percentage >= 90 ? 'bg-green-500/20 text-green-400' :
                              day.percentage >= 75 ? 'bg-blue-500/20 text-blue-400' :
                              day.percentage >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {day.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}