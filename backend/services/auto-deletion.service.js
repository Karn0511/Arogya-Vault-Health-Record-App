const { ObjectId } = require('mongodb');

class AutoDeletionService {
  constructor() {
    this.enabled = process.env.AUTO_DELETE_ENABLED === 'true';
    this.defaultDays = parseInt(process.env.AUTO_DELETE_DAYS) || 180; // 6 months default
    this.checkInterval = 24 * 60 * 60 * 1000; // Check daily
    this.db = null;

    console.log(`Auto-deletion service: ${this.enabled ? 'ENABLED' : 'DISABLED'} (default: ${this.defaultDays} days)`);
  }

  initialize(database) {
    this.db = database;

    if (this.enabled) {
      // Run check immediately on startup
      this.checkInactiveAccounts();

      // Then run daily
      this.intervalId = setInterval(() => {
        this.checkInactiveAccounts();
      }, this.checkInterval);

      console.log('✅ Auto-deletion scheduler started');
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      console.log('Auto-deletion scheduler stopped');
    }
  }

  async checkInactiveAccounts() {
    if (!this.db) {
      console.warn('Database not initialized for auto-deletion service');
      return;
    }

    try {
      console.log('🔍 Checking for inactive accounts...');

      const users = await this.db.collection('users').find({
        role: { $in: ['PATIENT', 'DOCTOR'] }, // Don't auto-delete admins
        isActive: true
      }).toArray();

      let deletedCount = 0;

      for (const user of users) {
        const autoDeletionDays = user.autoDeletionDays || this.defaultDays;

        // Skip if user has disabled auto-deletion
        if (autoDeletionDays === 0 || autoDeletionDays === null) {
          continue;
        }

        const lastActivity = user.lastActivityAt || user.createdAt;
        const daysSinceActivity = Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceActivity >= autoDeletionDays) {
          console.log(`⚠️ Deleting inactive account: ${user.email} (inactive for ${daysSinceActivity} days)`);

          await this.deleteUserAndData(user._id);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        console.log(`✅ Auto-deleted ${deletedCount} inactive account(s)`);
      } else {
        console.log('✅ No inactive accounts to delete');
      }
    } catch (error) {
      console.error('Error in auto-deletion check:', error);
    }
  }

  async deleteUserAndData(userId) {
    try {
      // Delete all user-related data
      await Promise.all([
        this.db.collection('users').deleteOne({ _id: userId }),
        this.db.collection('appointments').deleteMany({
          $or: [{ patientId: userId }, { doctorId: userId }]
        }),
        this.db.collection('prescriptions').deleteMany({
          $or: [{ patientId: userId }, { doctorId: userId }]
        }),
        this.db.collection('medicalReports').deleteMany({ patientId: userId }),
        this.db.collection('healthRecords').deleteMany({ patientId: userId }),
        this.db.collection('vaccinations').deleteMany({ patientId: userId }),
        this.db.collection('notifications').deleteMany({ userId: userId }),
        this.db.collection('reviews').deleteMany({
          $or: [{ patientId: userId }, { doctorId: userId }]
        })
      ]);

      console.log(`✅ Deleted user ${userId} and all associated data`);
      return true;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      return false;
    }
  }

  async updateUserActivity(userId) {
    if (!this.db) return;

    try {
      await this.db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            lastActivityAt: new Date(),
            isActive: true
          }
        }
      );
    } catch (error) {
      console.error('Error updating user activity:', error);
    }
  }

  async updateUserAutoDeletion(userId, days) {
    if (!this.db) return;

    try {
      await this.db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $set: { autoDeletionDays: days } }
      );

      console.log(`Updated auto-deletion for user ${userId}: ${days} days`);
      return true;
    } catch (error) {
      console.error('Error updating auto-deletion setting:', error);
      return false;
    }
  }

  getAutoDeletionOptions() {
    return [
      { value: 0, label: 'Off - Never delete my account' },
      { value: 15, label: '15 days of inactivity' },
      { value: 30, label: '1 month of inactivity' },
      { value: 90, label: '3 months of inactivity' },
      { value: 180, label: '6 months of inactivity' },
      { value: 365, label: '1 year of inactivity' }
    ];
  }
}

module.exports = new AutoDeletionService();
