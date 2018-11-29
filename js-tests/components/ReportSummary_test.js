import { shallowMount } from '@vue/test-utils';

import ReportSummary from '@/components/ReportSummary';
import { STRATEGY } from '@/report-strategy';
import { MISSING } from '@/constants';
import shuffle from 'lodash/shuffle';

const selectors = {
  metadata: '.summary-metadata li',
  counts: '[data-description="itemized-counts"] li'
};

describe('ReportSummary.vue', () => {
  describe('For total strategy', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(ReportSummary, {
        propsData: {
          id: 'a51361a1-8d64-4348-a28a-fc6b5dcca663',
          title: 'Sample Report Name',
          totalRecords: 101,
          strategy: STRATEGY.TOTAL
        }
      });
    });

    it('renders report summary', () => {
      const reportName = wrapper.find('h3');
      expect(reportName.text()).toBe('Sample Report Name');
      const metadata = wrapper.findAll(selectors.metadata);
      expect(metadata.length).toBe(1);
      expect(metadata.at(0).text()).toBe('Total Count: 101');
    });
  });

  describe('For itemized strategy', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(ReportSummary, {
        propsData: {
          id: 'a48bc291-951f-4ef6-9ec3-fff6291d7cd1',
          title: 'Sample Itemized Report Name',
          totalRecords: 6,
          strategy: STRATEGY.ITEMIZED,
          bucketByLabel: 'Field Label',
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
      expect(reportName.text()).toBe('Sample Itemized Report Name');

      wrapper.vm.$nextTick(() => {
        const li = wrapper.findAll(selectors.counts);
        expect(li.length).toEqual(3);
        expect(li.at(0).text()).toEqual('3 - Patient follow-up');
        expect(li.at(1).text()).toEqual('2 - Patient withdrew consent');
        expect(li.at(2).text()).toEqual('1 - Perceived drug side effects');
        done();
      });
    });

    it('renders a metadata section', (done) => {
      wrapper.vm.$nextTick(() => {
        const metadata = wrapper.findAll(selectors.metadata);
        expect(metadata.length).toBe(2);
        expect(metadata.at(0).text()).toBe('Total Count: 6');
        expect(metadata.at(1).text()).toBe('Grouped By: Field Label');
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
      id: '7e09f84b-76d8-48bb-9eca-e1e4fe33f844',
      title: 'Test Report Summary',
      totalRecords: 8,
      strategy: STRATEGY.ITEMIZED,
      summaryData: []
    };

    it('handles missing values', (done) => {
      propsData.summaryData = [
        'Patient follow-up',
        '42',
        'Patient withdrew consent',
        '',
        'Patient follow-up',
        '42',
        'Patient follow-up',
        null,
        'Patient withdrew consent',
        '42',
        '42',
        'Perceived drug side effects',
        '       '
      ];

      const wrapper = shallowMount(ReportSummary, { propsData: propsData });

      wrapper.vm.$nextTick(() => {
        expect(wrapper.vm.hasMissingValue).toBe(true);

        const li = wrapper.findAll(selectors.counts);
        expect(li.length).toBe(5);
        expect(li.at(4).text()).toBe(`3 - ${MISSING}`);
        done();
      });
    });

    it('orders counts', (done) => {
      propsData.summaryData = shuffle([
        ...new Array(3).fill('January'),
        ...new Array(2).fill('Afakemonth'),
        ...new Array(10).fill('February'),
        ...new Array(2).fill('August'),
        ...new Array(40).fill(''),
        ...new Array(2).fill(null),
        ...new Array(7).fill('March'),
        ...new Array(2).fill('April'),
        ...new Array(15).fill('May')
      ]);

      const wrapper = shallowMount(ReportSummary, { propsData: propsData });

      wrapper.vm.$nextTick(() => {
        const li = wrapper.findAll(selectors.counts);
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
