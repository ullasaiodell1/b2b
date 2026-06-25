import { LeadRecord } from '@/types/leads';
export { LeadRecord };

export const INITIAL_LEADS: LeadRecord[] = [
  {
    id: '1',
    name: 'Parth Solanki',
    company: 'Parth Pvt.Ltd',
    email: 'parth123@gmail.com',
    phone: '+91 45637 12345',
    tag: 'Hardware',
    priority: 'High',
    owner: 'Arjun Maheta',
  },
  {
    id: '2',
    name: 'Khushal Nadiyapara',
    company: 'Khushal Pvt.Ltd',
    email: 'parth123@gmail.com',
    phone: '+91 45637 12345',
    tag: 'Software',
    priority: 'Normal',
    owner: 'Parth Solanki',
  },
  {
    id: '3',
    name: 'Jigar Kalariya',
    company: 'Jigar Pvt.Ltd',
    email: 'parth123@gmail.com',
    phone: '+91 45637 12345',
    tag: 'IT Services',
    priority: 'Low',
    owner: 'Khushal Nadiyapara',
  },
  {
    id: '4',
    name: 'Tejas Parmar',
    company: 'Tejas Pvt.Ltd',
    email: 'parth123@gmail.com',
    phone: '+91 45637 12345',
    tag: 'Hardware',
    priority: 'High',
    owner: 'Jigar Kalariya',
  },
  {
    id: '5',
    name: 'Mukesh Chaudhary',
    company: 'Mukesh Pvt.Ltd',
    email: 'parth123@gmail.com',
    phone: '+91 45637 12345',
    tag: 'Cybersecurity',
    priority: 'Normal',
    owner: 'Arjun Maheta',
  },
  {
    id: '6',
    name: 'Aryan Patel',
    company: 'Jigar Pvt.Ltd',
    email: 'parth123@gmail.com',
    phone: '+91 45637 12345',
    tag: 'Software',
    priority: 'Low',
    owner: 'Parth Solanki',
  },
];

export let leadsState: LeadRecord[] = [...INITIAL_LEADS];

const listeners = new Set<() => void>();

export const updateLeadsState = (newLeads: LeadRecord[]) => {
  leadsState = newLeads;
  listeners.forEach((listener) => listener());
};

export const resetLeadsState = () => {
  leadsState = [...INITIAL_LEADS];
  listeners.forEach((listener) => listener());
};

export const subscribeToLeads = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
