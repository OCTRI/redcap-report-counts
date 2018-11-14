import uuid from 'uuid/v4';
import { shallowMount } from '@vue/test-utils';

import ReportSummary from '@/components/ReportSummary';
import { STRATEGY } from '@/report-strategy';
import { MISSING } from '@/constants';
import shuffle from 'lodash/shuffle';

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

describe('ReportSummary.vue', () => {
  describe('For total strategy', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(ReportSummary, {
        propsData: {
          index: 3,
          title: 'Sample Report Name',
          totalRecords: 101,
          strategy: STRATEGY.TOTAL
        }
      });
    });

    it('renders report summary', () => {
      const reportName = wrapper.find('h3');
      expect(reportName.text()).toBe('101 - Sample Report Name');
    });
  });

  describe('For itemized strategy', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(ReportSummary, {
        propsData: {
          index: 0,
          title: 'Sample Itemized Report Name',
          totalRecords: 6,
          strategy: STRATEGY.ITEMIZED,
          summaryData: [
            'Patient follow-up',
            'Patient withdrew consent',
            'Patient follow-up',
            'Patient follow-up',
            'Patient withdrew consent',
            'Perceived drug side effects'
          ]
        }
      });
    });

    it('renders report summary with itemized counts', (done) => {
      const reportName = wrapper.find('h3');

      expect(reportName.text()).toBe('6 - Sample Itemized Report Name');

      wrapper.vm.$nextTick(() => {
        expect(wrapper.findAll('li').length).toEqual(3);
        expect(wrapper.findAll('li').at(0).text()).toEqual('3 - Patient follow-up');
        expect(wrapper.findAll('li').at(1).text()).toEqual('2 - Patient withdrew consent');
        expect(wrapper.findAll('li').at(2).text()).toEqual('1 - Perceived drug side effects');
        done();
      });
    });

    it('emits deleteSummary event', (done) => {
      wrapper.vm.$nextTick(() => {
        spyOn(window, 'confirm').and.returnValue(true);
        wrapper.find('.delete').trigger('click');
        expect(wrapper.emitted('deleteSummary')).toBeTruthy();
        expect(wrapper.emitted('deleteSummary')[0]).toBeTruthy();
        done();
      });
    });

    it('does not emit deleteSummary event if canceled', (done) => {
      wrapper.vm.$nextTick(() => {
        spyOn(window, 'confirm').and.returnValue(false);
        wrapper.find('.delete').trigger('click');
        expect(wrapper.emitted('deleteSummary')).toBeFalsy();
        done();
      });
    });
  });

  describe('Report Summary ordering', () => {
    const propsData = {
      index: 0,
      title: 'Test Report Summary',
      totalRecords: 8,
      strategy: STRATEGY.ITEMIZED,
      summaryData: []
    };

    it('handles missing values', (done) => {
      propsData.summaryData = [
        'Patient follow-up',
        42,
        'Patient withdrew consent',
        '',
        'Patient follow-up',
        42,
        'Patient follow-up',
        null,
        'Patient withdrew consent',
        42,
        42,
        undefined,
        'Perceived drug side effects',
        '       '
      ];

      const wrapper = shallowMount(ReportSummary, { propsData: propsData });

      wrapper.vm.$nextTick(() => {
        expect(wrapper.vm.hasMissingValue).toBe(true);

        const li = wrapper.findAll('li');
        expect(li.length).toBe(5);
        expect(li.at(4).text()).toBe(`4 - ${MISSING}`);
        done();
      });
    });

    it('orders counts', (done) => {
      propsData.summaryData = shuffle([
        ...new Array(3).fill('January'),
        ...new Array(2).fill('Afakemonth'),
        ...new Array(10).fill('February'),
        ...new Array(2).fill('August'),
        ...new Array(42).fill(''),
        ...new Array(7).fill('March'),
        ...new Array(2).fill('April'),
        ...new Array(15).fill('May')
      ]);

      const wrapper = shallowMount(ReportSummary, { propsData: propsData });

      wrapper.vm.$nextTick(() => {
        const li = wrapper.findAll('li');
        expect(li.length).toBe(8);

        // Count in descending order
        expect(li.at(0).text()).toBe('15 - May');
        expect(li.at(1).text()).toBe('10 - February');
        expect(li.at(2).text()).toBe('7 - March');
        expect(li.at(3).text()).toBe('3 - January');

        // Label is ascending when the count is the same
        expect(li.at(4).text()).toBe('2 - Afakemonth');
        expect(li.at(5).text()).toBe('2 - April');
        expect(li.at(6).text()).toBe('2 - August');

        // Missing is always the last count
        expect(li.at(7).text()).toBe(`42 - ${MISSING}`);
        done();
      });
    });
  });
});
