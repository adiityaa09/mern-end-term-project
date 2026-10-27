const mongoose = require('mongoose');
const analyticsService = require('../src/services/analytics.service');
const Application = require('../src/models/Application');
const { STAGES } = require('../src/constants/stages');

describe('Analytics Aggregation Logic', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('returns graceful empty state when user has no applications', async () => {
    // Mock aggregate and find to return empty arrays
    jest.spyOn(Application, 'aggregate').mockResolvedValue([]);
    jest.spyOn(Application, 'find').mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      })
    });

    const dummyUserId = new mongoose.Types.ObjectId();
    const overview = await analyticsService.getOverviewAnalytics(dummyUserId);

    expect(overview).toHaveProperty('hasData', false);
    expect(overview).toHaveProperty('summary');
    expect(overview.summary.totalApplications).toBe(0);
    expect(overview.summary.responseRatePercent).toBe(0);
    expect(overview.summary.offerRatePercent).toBe(0);
    expect(overview.summary.avgDaysToFirstResponse).toBe(0);

    // Verify all stages are populated in stageFunnel
    expect(Array.isArray(overview.stageFunnel)).toBe(true);
    expect(overview.stageFunnel.length).toBe(Object.keys(STAGES).length);
    overview.stageFunnel.forEach((item) => {
      expect(item).toHaveProperty('stage');
      expect(item).toHaveProperty('count', 0);
    });
  });

  it('correctly calculates funnel and response rate with mock application data', async () => {
    // Mock funnel aggregate
    jest.spyOn(Application, 'aggregate').mockImplementation((pipeline) => {
      // If weekly activity pipeline
      if (
        pipeline[1] &&
        pipeline[1].$group &&
        pipeline[1].$group._id &&
        pipeline[1].$group._id.week
      ) {
        return Promise.resolve([
          { _id: { year: 2026, week: 42 }, count: 5, firstDate: new Date() }
        ]);
      }
      // If stage funnel pipeline
      return Promise.resolve([
        { _id: 'Wishlist', count: 3 },
        { _id: 'Applied', count: 4 },
        { _id: 'Interview', count: 2 },
        { _id: 'Offer', count: 1 }
      ]);
    });

    // Mock find for conversion rates
    jest.spyOn(Application, 'find').mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { stage: 'Wishlist' },
          { stage: 'Applied' },
          { stage: 'Interview' },
          { stage: 'Offer' }
        ])
      })
    });

    const dummyUserId = new mongoose.Types.ObjectId();
    const overview = await analyticsService.getOverviewAnalytics(dummyUserId);

    expect(overview.hasData).toBe(true);
    expect(overview.summary.totalApplications).toBe(10);
    // Submitted = 3 (Applied, Interview, Offer). Responded = 2 (Interview, Offer). Rate = (2/3)*100 = 66.7%
    expect(overview.summary.responseRatePercent).toBe(66.7);
    expect(overview.summary.offerRatePercent).toBe(33.3);
  });
});
