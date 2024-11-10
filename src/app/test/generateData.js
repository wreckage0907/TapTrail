2// src/app/test/generateData.js
export async function generateTestData() {
    const names = [
      'John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Davis',
      'Eva Wilson', 'Frank Miller', 'Grace Lee', 'Henry Taylor', 'Iris Clark'
    ];
  
    const generateDailyAttendance = (date, baseCount) => {
      // Vary the attendance count slightly each day
      const studentCount = baseCount + Math.floor(Math.random() * 5);
      const attendances = [];
  
      // Generate attendance for 'studentCount' number of students
      for (let i = 0; i < studentCount; i++) {
        // Random hour between 8 AM and 11 AM
        const hour = 8 + Math.floor(Math.random() * 3);
        const minute = Math.floor(Math.random() * 60);
        
        const timestamp = new Date(date);
        timestamp.setHours(hour, minute, 0, 0);
  
        attendances.push({
          Name: names[Math.floor(Math.random() * names.length)],
          UID: `STU${(i + 1).toString().padStart(3, '0')}`,
          Time: timestamp.toISOString()
        });
      }
  
      return attendances;
    };
  
    // Generate data for the past 7 days
    const today = new Date();
    const attendanceData = [];
  
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      // Base count varies by day of week (less on weekends)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const baseCount = isWeekend ? 5 : 8;
      
      const dailyAttendance = generateDailyAttendance(date, baseCount);
      attendanceData.push(...dailyAttendance);
    }
  
    // Send all attendance records to the API
    for (const record of attendanceData) {
      try {
        await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        });
        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Error posting attendance:', error);
      }
    }
  
    return attendanceData;
  }