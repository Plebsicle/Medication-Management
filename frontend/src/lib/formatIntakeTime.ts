export default function formatIntakeTime(time: string) {
    // Handles both '15:15:00.000Z' and '15:15' formats
    let t = time;
    if (t.includes('T')) t = t.split('T')[1];
    if (t.includes('Z')) t = t.replace('Z', '');
    t = t.split('.')[0];
    const [hours, minutes] = t.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }