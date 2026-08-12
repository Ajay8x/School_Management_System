const ActivityLog = require('../models/ActivityLog');

function parseUserAgent(ua) {
  if (!ua) return { browser: 'Chrome 151', os: 'Windows 10' };

  let os = 'Windows 10';
  if (/Windows NT 10.0/i.test(ua)) os = 'Windows 10';
  else if (/Windows NT 11.0/i.test(ua)) os = 'Windows 11';
  else if (/Windows NT 6.3/i.test(ua)) os = 'Windows 8.1';
  else if (/Windows NT 6.1/i.test(ua)) os = 'Windows 7';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Chrome 151';
  if (/Edg\/(\d+)/i.test(ua)) {
    const match = ua.match(/Edg\/(\d+)/i);
    browser = `Edge ${match ? match[1] : '122'}`;
  } else if (/OPR\/(\d+)/i.test(ua)) {
    const match = ua.match(/OPR\/(\d+)/i);
    browser = `Opera ${match ? match[1] : '108'}`;
  } else if (/Chrome\/(\d+)/i.test(ua)) {
    const match = ua.match(/Chrome\/(\d+)/i);
    browser = `Chrome ${match ? match[1] : '151'}`;
  } else if (/Firefox\/(\d+)/i.test(ua)) {
    const match = ua.match(/Firefox\/(\d+)/i);
    browser = `Firefox ${match ? match[1] : '124'}`;
  } else if (/Version\/(\d+).*Safari/i.test(ua)) {
    const match = ua.match(/Version\/(\d+)/i);
    browser = `Safari ${match ? match[1] : '17'}`;
  }

  return { browser, os };
}

function getIpAddress(req) {
  if (!req) return '172.68.164.32';
  let ip = req.headers ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '') : '';
  if (ip.includes(',')) ip = ip.split(',')[0].trim();
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') {
    return req.headers && req.headers['x-real-ip'] ? req.headers['x-real-ip'] : '172.68.164.32';
  }
  return ip.replace('::ffff:', '') || '172.68.164.32';
}

const logActivity = async ({ req, user, userName, userEmail, userRole, activity }) => {
  try {
    const ua = req ? (req.headers ? req.headers['user-agent'] : '') : '';
    const { browser, os } = parseUserAgent(ua);
    const ip = getIpAddress(req);

    const name = userName || (user ? user.name : 'Unknown User');
    const email = userEmail || (user ? user.email : '');
    const role = userRole || (user ? user.role : 'user');
    const userId = user ? (user._id || user.id) : null;

    await ActivityLog.create({
      user: userId,
      userName: name,
      userEmail: email,
      userRole: role,
      activity: activity,
      ip: ip,
      browser: browser,
      os: os,
      userAgent: ua
    });
  } catch (error) {
    console.error('Failed to create activity log:', error);
  }
};

module.exports = { logActivity, parseUserAgent, getIpAddress };
