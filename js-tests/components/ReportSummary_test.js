import uuid from 'uuid/v4';
import { shallowMount } from '@vue/test-utils';

import ReportSummary from '@/components/ReportSummary';

describe('ReportSummary.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(ReportSummary, {
      propsData: {
        reportName: 'Sample Report Name',
        totalRecords: 101
      }
    });
  });

  it('renders report summary', () => {
    const reportName = wrapper.find('h3');
    expect(reportName.text()).toBe('Sample Report Name');

    const totalRecords = wrapper.find('p');
    expect(totalRecords.text()).toBe('101');
  });
});
