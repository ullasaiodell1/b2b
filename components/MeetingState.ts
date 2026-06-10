import { MeetingRecord } from '../types/meeting';
export { MeetingRecord };

export const INITIAL_MEETINGS: MeetingRecord[] = [
  {
    id: '1',
    title: 'Years of excellence',
    venue: 'Development Room',
    location: 'Hybrid',
    isAllDay: false,
    fromTime: '11:00 am',
    toTime: '12:00 pm',
    host: 'Parth Solanki',
    status: 'Complete',
    notes: [
      'Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
    ],
    attachments: [
      { name: 'Demo_Card.pdf', size: '1.2 MB' },
    ],
    createdTime: '11:02 am',
    modifiedTime: '11:03 am',
  },
  {
    id: '2',
    title: 'Client Presentation',
    venue: 'Development Room',
    location: 'In-Person',
    isAllDay: false,
    fromTime: '12:30 pm',
    toTime: '01:30 pm',
    host: 'Vijay Rathod',
    status: 'In-Process',
    notes: [
      'Review slide deck with the design team before meeting client representation. Ensure all specs are validated.',
    ],
    attachments: [],
    createdTime: '10:15 am',
    modifiedTime: '10:20 am',
  },
  {
    id: '3',
    title: 'Product Demo',
    venue: 'Development Room',
    location: 'Online',
    isAllDay: true,
    fromTime: '03:00 pm',
    toTime: '04:00 pm',
    host: 'Dharmesh Vala',
    status: 'Pending',
    notes: [],
    attachments: [],
    createdTime: '09:00 am',
    modifiedTime: '09:00 am',
  },
  {
    id: '4',
    title: 'Support / issue',
    venue: 'Development Room',
    location: 'Hybrid',
    isAllDay: false,
    fromTime: '05:00 pm',
    toTime: '06:00 pm',
    host: 'Parth Solanki',
    status: 'Complete',
    notes: [
      'Solve reported hotfix issue for checkout basket validation. Test against sandbox server.',
    ],
    attachments: [],
    createdTime: '04:00 pm',
    modifiedTime: '04:05 pm',
  },
];

export let meetingsState: MeetingRecord[] = [...INITIAL_MEETINGS];

const listeners = new Set<() => void>();

export const updateMeetingsState = (newMeetings: MeetingRecord[]) => {
  meetingsState = newMeetings;
  listeners.forEach((listener) => listener());
};

export const subscribeToMeetings = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
