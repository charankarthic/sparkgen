import { useState } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

export function Calendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<{
    [key: string]: { title: string; description: string }[];
  }>({});

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      console.log(`Selected date: ${format(selectedDate, 'PPP')}`);
    }
  };

  const addEvent = () => {
    if (!date) return;

    const dateKey = format(date, 'yyyy-MM-dd');
    const newEvent = {
      title: `Event on ${format(date, 'PPP')}`,
      description: 'Sample event description',
    };

    try {
      setEvents((prevEvents) => ({
        ...prevEvents,
        [dateKey]: [...(prevEvents[dateKey] || []), newEvent],
      }));
      console.log(`Event added for ${dateKey}:`, newEvent);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const renderEvents = () => {
    if (!date) return null;

    const dateKey = format(date, 'yyyy-MM-dd');
    const dateEvents = events[dateKey] || [];

    return (
      <div className="mt-4">
        <h3 className="text-lg font-medium">
          Events for {format(date, 'PPP')}
        </h3>
        {dateEvents.length === 0 ? (
          <p className="text-muted-foreground">No events scheduled</p>
        ) : (
          <ul className="space-y-2 mt-2">
            {dateEvents.map((event, index) => (
              <li key={index} className="p-2 bg-muted rounded-md">
                <h4 className="font-medium">{event.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {event.description}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className="rounded-md border"
          />
          <Button onClick={addEvent}>Add Sample Event</Button>
          {renderEvents()}
        </div>
      </CardContent>
    </Card>
  );
}

export default Calendar;