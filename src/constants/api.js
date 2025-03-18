import { MYMA_GPT_URL, BFF_URL, CHAT_API_URL } from "./url";

export const gAPI_THREAD_SUMMARY =`${MYMA_GPT_URL}/query-chatbot-json`;

export const gAPI_THREAD_DYNAMIC_SUMMARY =`${MYMA_GPT_URL}/query-chatbot-json-system-function`;

export const gAPI_THREAD_REPLY =`${MYMA_GPT_URL}/query-chatbot-json`;

export const post_API_CREATE_TICKET =`${BFF_URL}/public/plugin/ticket`;

export const gAPI_PROPERTY_DETAILS = `${BFF_URL}/public/property/internal`;

export const gAPI_Email_Integrations = `${BFF_URL}/public/integrations/email`;

export const gAPI_QUESTION_SET_DETAILS = `${CHAT_API_URL}/question-sets`;

export const API_EMAIL_STATS = `${BFF_URL}/public/emailStats`;