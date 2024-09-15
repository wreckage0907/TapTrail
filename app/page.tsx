"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts"

export default function TeacherDashboard() {
  // Mock data - replace with actual data from your backend
  const presentStudents = 86/2
  const totalStudents = 100/2

  const attendanceRatio = [
    { name: "Present", value: presentStudents },
    { name: "Absent", value: totalStudents - presentStudents },
  ]

  const weeklyAttendance = [
    { day: "Mon", attendance: 90/2 },
    { day: "Tue", attendance: 86/2 },
    { day: "Wed", attendance: 82/2 },
    { day: "Thu", attendance: 92/2 },
    { day: "Fri", attendance: 76/2 },
  ]

  const monthlyAttendance = [
    { date: "1", attendance: 96/2 },
    { date: "5", attendance: 88/2 },
    { date: "10", attendance: 92/2 },
    { date: "15", attendance: 90 /2},
    { date: "20", attendance: 94/2},
    { date: "25", attendance: 90/2 },
    { date: "30", attendance: 88/2 },
  ]

  const COLORS = ['#0088FE', '#FF8042']

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Teacher&apos;s Attendance Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{presentStudents} / {totalStudents}</div>
            <p className="text-sm text-muted-foreground">students present</p>
          </CardContent>
        </Card>
        <Card>
      <CardHeader>
        <CardTitle>Attendance Ratio</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={attendanceRatio}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {attendanceRatio.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart width={300} height={200} data={weeklyAttendance}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="attendance" fill="#8884d8" />
            </BarChart>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart width={300} height={200} data={monthlyAttendance}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="attendance" stroke="#8884d8" />
            </LineChart>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}