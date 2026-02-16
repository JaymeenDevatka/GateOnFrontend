import AttendeeTickets from '../components/dashboard/AttendeeTickets.jsx';
import Button from '../components/common/Button.jsx';

const MOCK_TICKETS = [
  {
    id: 't1',
    eventId: '1',
    eventTitle: 'GateOn Tech Meetup: Building Modern Event Platforms',
    date: 'Fri, Feb 20 · 6:30 PM',
    location: 'Bengaluru · In person',
    ticketType: 'General Admission',
    orderNumber: '1234-5678'
  }
];

function AttendeeDashboard() {
  return (
    <div className="container-page space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">My tickets</h1>
          <p className="text-sm text-slate-500">
            View upcoming events you are attending – similar to Eventbrite’s tickets page.
          </p>
        </div>
        <div className="text-right text-xs">
          <p className="font-semibold text-slate-900">Loyalty points: 120</p>
          <p className="text-slate-500">Earn rewards for repeat participation.</p>
        </div>
      </div>

      <AttendeeTickets tickets={MOCK_TICKETS} />

      <div className="bg-surface-elevated rounded-2xl border border-slate-200/80 shadow-card p-4 space-y-2 text-xs text-slate-600">
        <p className="font-semibold text-slate-900 text-sm">Refund & cancellation policy</p>
        <p>
          This is a frontend-only representation of your refund workflow. In production, rules like
          “Refunds allowed up to 24 hours before event” would be enforced by the backend and payment
          gateway.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button variant="outline" className="text-xs px-3 py-1.5">
            Request cancellation
          </Button>
          <Button variant="outline" className="text-xs px-3 py-1.5">
            View refund status
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AttendeeDashboard;

