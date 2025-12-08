// Development mode authentication bypass
export const DEV_MODE = import.meta.env.DEV_MODE === 'true';
export const DEV_USER_ID = import.meta.env.DEV_USER_ID || 'fletcher-dev-id';
export const DEV_USER_NAME = import.meta.env.DEV_USER_NAME || 'Fletcher';

export function getDevUser() {
  if (!DEV_MODE) return null;
  
  return {
    id: DEV_USER_ID,
    email: 'fletcher@dev.local',
    user_metadata: {
      display_name: DEV_USER_NAME
    }
  };
}
