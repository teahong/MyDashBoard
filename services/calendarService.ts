import { CalendarEvent } from "../types";

// User provided NEW GAS Web App URL (Optimized version)
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwi48QEgvmltbq5mtDaoL7LBIhqYRuJ51QPsdSwrZqtg0zy9Dd-_Q6W8248duUOWJBMUQ/exec';

export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
    try {
        // GAS web apps often return a 302 redirect. Fetch handles this by default.
        // We use 'no-cache' to ensure fresh data.
        const response = await fetch(GAS_URL, {
            method: 'GET',
            cache: 'no-cache',
            mode: 'cors'
        });

        if (!response.ok) {
            console.error('GAS Calendar API Error:', response.status);
            throw new Error('Failed to fetch calendar events from GAS');
        }

        const data = await response.json();

        // GAS error handling in script
        if (data.error) {
            console.error('GAS Script Error:', data.error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("Error fetching calendar events via GAS", error);
        return [];
    }
};
