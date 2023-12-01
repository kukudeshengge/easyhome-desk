export const isLoc = process.env.NODE_ENV === 'development';
export const baseDomain = process.env.baseDomain;
export const appUrl = baseDomain + '/easyhome-app-application';
export const acUrl = (type = 'production') => (type === 'production' ? 'https://ac.jrdaimao.com' : 'https://acsit.jrdaimao.com');
export const topicUrl = isLoc ? 'https://topicuat.jrdaimao.com' : 'https://topic.jrdaimao.com';
export const AcUrl = isLoc ? 'https://acsit.jrdaimao.com' : 'https://ac.jrdaimao.com';
export const OmUrl = process.env.omDomain;
