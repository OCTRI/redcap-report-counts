import uuid from 'uuid/v4';
import { shallowMount } from '@vue/test-utils';

import ConsortReport from '@/components/ConsortReport';

function createProvideObject() {
  return {
    assetUrls: {},
    dataService: {
      fetchReportSummary() {
        return Promise.resolve([{ "title": "Report Name", "reportId": 42 }]);
      }
    }
  };
}

describe('ConsortReport.vue', () => {
  let mockProvide, wrapper;

  beforeEach((done) => {
    mockProvide = createProvideObject();
    spyOn(mockProvide.dataService, 'fetchReportSummary').and.callThrough();

    wrapper = shallowMount(ConsortReport, {
      provide: mockProvide
    });

    wrapper.vm.configPromise.then(() => done());
  });

  it('requests report summary when mounted', () => {
    const { dataService } = mockProvide;
    expect(dataService.fetchReportSummary).toHaveBeenCalled();
  });
});
