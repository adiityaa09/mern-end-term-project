const mongoose = require('mongoose');
const Application = require('../models/Application');
const { STAGES } = require('../constants/stages');

class AnalyticsService {
  /**
   * Aggregate complete analytics suite for user
   */
  async getOverviewAnalytics(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [funnel, rates, avgResponseDays, weeklyActivity, resumePerformance] =
      await Promise.all([
        this.getStageFunnel(userObjectId),
        this.getConversionRates(userObjectId),
        this.getAvgDaysToResponse(userObjectId),
        this.getWeeklyApplications(userObjectId),
        this.getResumePerformance(userObjectId)
      ]);

    const totalApplications = funnel.reduce((acc, curr) => acc + curr.count, 0);

    return {
      hasData: totalApplications > 0,
      summary: {
        totalApplications,
        activeApplications: rates.activeCount,
        responseRatePercent: rates.responseRate,
        offerRatePercent: rates.offerRate,
        avgDaysToFirstResponse: avgResponseDays
      },
      stageFunnel: funnel,
      weeklyActivity,
      resumePerformance
    };
  }

  /**
   * 1. Stage Funnel Aggregation
   */
  async getStageFunnel(userObjectId) {
    const results = await Application.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: '$stage', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    results.forEach((r) => {
      countMap[r._id] = r.count;
    });

    // Ensure every stage is represented in order even if count is 0
    return Object.values(STAGES).map((stage) => ({
      stage,
      count: countMap[stage] || 0
    }));
  }

  /**
   * 2. Key Conversion Rates (Response Rate & Offer Rate)
   */
  async getConversionRates(userObjectId) {
    const apps = await Application.find({ userId: userObjectId }).select('stage').lean();

    if (!apps.length) {
      return { responseRate: 0, offerRate: 0, activeCount: 0 };
    }

    // Exclude Wishlist from conversion denominator (only count submitted applications)
    const submittedApps = apps.filter((a) => a.stage !== STAGES.WISHLIST);
    const totalSubmitted = submittedApps.length;

    if (totalSubmitted === 0) {
      return { responseRate: 0, offerRate: 0, activeCount: apps.length };
    }

    // Responded applications: any stage beyond Applied
    const respondedApps = submittedApps.filter(
      (a) =>
        a.stage === STAGES.ONLINE_ASSESSMENT ||
        a.stage === STAGES.INTERVIEW ||
        a.stage === STAGES.OFFER ||
        a.stage === STAGES.REJECTED
    );

    const offerApps = submittedApps.filter((a) => a.stage === STAGES.OFFER);

    // Active apps: Wishlist, Applied, OA, Interview
    const activeApps = apps.filter(
      (a) =>
        a.stage !== STAGES.OFFER &&
        a.stage !== STAGES.REJECTED &&
        a.stage !== STAGES.WITHDRAWN
    );

    return {
      responseRate: parseFloat(((respondedApps.length / totalSubmitted) * 100).toFixed(1)),
      offerRate: parseFloat(((offerApps.length / totalSubmitted) * 100).toFixed(1)),
      activeCount: activeApps.length
    };
  }

  /**
   * 3. Average Days from 'Applied' to First Response
   */
  async getAvgDaysToResponse(userObjectId) {
    const pipeline = [
      { $match: { userId: userObjectId } },
      // Unwind status history array to inspect stage jumps
      { $unwind: '$statusHistory' },
      {
        $match: {
          'statusHistory.fromStage': STAGES.APPLIED,
          'statusHistory.toStage': {
            $in: [
              STAGES.ONLINE_ASSESSMENT,
              STAGES.INTERVIEW,
              STAGES.OFFER,
              STAGES.REJECTED
            ]
          }
        }
      },
      {
        $project: {
          diffDays: {
            $divide: [
              { $subtract: ['$statusHistory.changedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert milliseconds to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$diffDays' }
        }
      }
    ];

    const result = await Application.aggregate(pipeline);

    if (result.length && result[0].avgDays != null) {
      return parseFloat(result[0].avgDays.toFixed(1));
    }

    return 0;
  }

  /**
   * 4. Applications per week (trend for charts)
   */
  async getWeeklyApplications(userObjectId) {
    const pipeline = [
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: '$createdAt' },
            week: { $isoWeek: '$createdAt' }
          },
          count: { $sum: 1 },
          firstDate: { $min: '$createdAt' }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
      { $limit: 12 } // Last 12 active weeks
    ];

    const results = await Application.aggregate(pipeline);

    return results.map((r) => {
      const d = new Date(r.firstDate);
      return {
        weekLabel: `W${r._id.week} (${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
        count: r.count
      };
    });
  }

  /**
   * 5. Conversion Performance per Resume Version
   */
  async getResumePerformance(userObjectId) {
    const pipeline = [
      {
        $match: {
          userId: userObjectId,
          resumeId: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$resumeId',
          totalApplications: { $sum: 1 },
          interviews: {
            $sum: {
              $cond: [
                {
                  $in: ['$stage', [STAGES.INTERVIEW, STAGES.OFFER]]
                },
                1,
                0
              ]
            }
          },
          offers: {
            $sum: {
              $cond: [{ $eq: ['$stage', STAGES.OFFER] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'resumes',
          localField: '_id',
          foreignField: '_id',
          as: 'resumeDetails'
        }
      },
      { $unwind: '$resumeDetails' },
      {
        $project: {
          resumeId: '$_id',
          label: '$resumeDetails.label',
          fileName: '$resumeDetails.fileName',
          totalApplications: 1,
          interviews: 1,
          offers: 1,
          conversionRatePercent: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$interviews', '$totalApplications'] },
                  100
                ]
              },
              1
            ]
          }
        }
      },
      { $sort: { conversionRatePercent: -1 } }
    ];

    return Application.aggregate(pipeline);
  }
}

module.exports = new AnalyticsService();
