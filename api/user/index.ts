import { URL_UPLOAD_DOCUMENT_ACCEPT_CONSENT } from '@/constants/endpoints';
import api from '../api';

export async function acceptConsent(userId: string) {
  return api.post(URL_UPLOAD_DOCUMENT_ACCEPT_CONSENT(userId));
}
