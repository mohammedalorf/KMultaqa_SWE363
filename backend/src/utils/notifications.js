import Club from '../../models/Club.js';
import Notification from '../../models/Notification.js';
import Student from '../../models/Student.js';

function buildNotificationMessage(type, clubName) {
  if (type === 'event') {
    return `A new event from ${clubName} has been added.`;
  }

  return `A new post from ${clubName} has been added.`;
}

function isDuplicateOnlyInsertError(error) {
  if (error?.code === 11000) {
    return true;
  }

  return Array.isArray(error?.writeErrors) && error.writeErrors.every((item) => item?.code === 11000);
}

function studentAllowsInAppNotification(student, clubId) {
  const preference = student.notificationPreferences?.clubs?.find((item) => {
    return String(item.club) === String(clubId);
  });

  return preference?.inApp !== false;
}

export async function notifyFollowersAboutClubContent({ clubId, targetId, targetModel, type }) {
  if (!clubId || !targetId || !targetModel || !type) {
    return { created: 0 };
  }

  const club = await Club.findById(clubId).select('clubName').lean();

  if (!club) {
    return { created: 0 };
  }

  const followers = (await Student.find({ followedClubs: club._id })
    .select('_id notificationPreferences.clubs')
    .lean())
    .filter((student) => studentAllowsInAppNotification(student, club._id));

  if (followers.length === 0) {
    return { created: 0 };
  }

  const message = buildNotificationMessage(type, club.clubName);
  const notifications = followers.map((student) => ({
    student: student._id,
    club: club._id,
    target: targetId,
    targetModel,
    type,
    message,
  }));

  try {
    const insertedNotifications = await Notification.insertMany(notifications, { ordered: false });
    return { created: insertedNotifications.length };
  } catch (error) {
    if (isDuplicateOnlyInsertError(error)) {
      return { created: error?.insertedDocs?.length ?? 0 };
    }

    throw error;
  }
}

export async function notifyStudentAboutRegistrationDecision({ studentId, clubId, eventId, eventTitle, status }) {
  if (!studentId || !clubId || !eventId || !eventTitle || !status) {
    return { notified: false };
  }

  const club = await Club.findById(clubId).select('clubName').lean();

  if (!club) {
    return { notified: false };
  }

  const decisionText = status === 'registered' ? 'approved' : 'declined';
  const message = `${club.clubName} ${decisionText} your registration request for ${eventTitle}.`;

  await Notification.findOneAndUpdate(
    {
      student: studentId,
      target: eventId,
      targetModel: 'Event',
    },
    {
      $set: {
        student: studentId,
        club: clubId,
        target: eventId,
        targetModel: 'Event',
        type: 'registration',
        message,
        isRead: false,
        createdAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  return { notified: true };
}
