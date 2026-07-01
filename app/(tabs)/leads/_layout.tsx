import { Stack } from 'expo-router';
import React from 'react';

export default function LeadsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Leads' }} />
      <Stack.Screen name="leads-filter" options={{ title: 'Leads Filter' }} />
      <Stack.Screen name="lead-details" options={{ title: 'Lead Details' }} />
      <Stack.Screen name="add-lead" options={{ title: 'Add Lead' }} />
      <Stack.Screen name="edit-lead" options={{ title: 'Edit Lead' }} />
      <Stack.Screen name="select-owner" options={{ title: 'Select Lead Owner' }} />
      <Stack.Screen name="select-company" options={{ title: 'Select Company' }} />
      <Stack.Screen name="select-category" options={{ title: 'Select Category' }} />
      <Stack.Screen name="lead-activity" options={{ title: 'Activity Log' }} />
      <Stack.Screen name="interested-products" options={{ title: 'Interested Products' }} />
      <Stack.Screen name="lead-contacts" options={{ title: 'Contacts' }} />
      <Stack.Screen name="lead-ledger" options={{ title: 'Ledger' }} />
      <Stack.Screen name="ledger-filter" options={{ title: 'Ledger Filter' }} />
      <Stack.Screen name="lead-meeting" options={{ title: 'Lead Meetings' }} />
      <Stack.Screen name="lead-order" options={{ title: 'Lead Orders' }} />
      <Stack.Screen name="lead-quotation" options={{ title: 'Lead Quotations' }} />
      <Stack.Screen name="lead-task" options={{ title: 'Lead Tasks' }} />
      <Stack.Screen name="lead-visit" options={{ title: 'Lead Visits' }} />
      <Stack.Screen name="lead-add-meeting" options={{ title: 'Add Lead Meeting' }} />
      <Stack.Screen name="lead-add-task" options={{ title: 'Add Lead Task' }} />
      <Stack.Screen name="lead-edit-task" options={{ title: 'Edit Lead Task' }} />
      <Stack.Screen name="lead-add-visit" options={{ title: 'Add Lead Visit' }} />
      <Stack.Screen name="lead-add-order" options={{ title: 'Add Lead Order' }} />
      <Stack.Screen name="lead-add-quotation" options={{ title: 'Add Lead Quotation' }} />
      <Stack.Screen name="lead-meeting-details" options={{ title: 'Lead Meeting Details' }} />
      <Stack.Screen name="lead-task-details" options={{ title: 'Lead Task Details' }} />
      <Stack.Screen name="lead-visit-details" options={{ title: 'Lead Visit Details' }} />
      <Stack.Screen name="lead-order-details" options={{ title: 'Lead Order Details' }} />
      <Stack.Screen name="lead-quotation-details" options={{ title: 'Lead Quotation Details' }} />
      <Stack.Screen name="lead-meeting-filter" options={{ title: 'Lead Meeting Filter' }} />
      <Stack.Screen name="lead-task-filter" options={{ title: 'Lead Task Filter' }} />
      <Stack.Screen name="lead-visit-filter" options={{ title: 'Lead Visit Filter' }} />
      <Stack.Screen name="lead-order-filter" options={{ title: 'Lead Order Filter' }} />
      <Stack.Screen name="lead-quotation-filter" options={{ title: 'Lead Quotation Filter' }} />
      <Stack.Screen name="lead-proforma" options={{ title: 'Lead Proformas' }} />
      <Stack.Screen name="lead-proforma-details" options={{ title: 'Lead Proforma Details' }} />
      <Stack.Screen name="lead-proforma-filter" options={{ title: 'Lead Proforma Filter' }} />
      <Stack.Screen name="convert-customer" options={{ title: 'Convert to Customer' }} />
    </Stack>
  );
}
