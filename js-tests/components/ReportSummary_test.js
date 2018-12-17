import { mount, shallowMount } from '@vue/test-utils';

import ReportSummary from '@/components/ReportSummary';
import ReportSummaryForm from '@/components/ReportSummaryForm';
import ReportSummaryModel from '@/report-summary-model';
import { STRATEGY } from '@/report-strategy';
import { MISSING } from '@/constants';
import shuffle from 'lodash/shuffle';

import { createProvideObject } from '../test-utils';

const selectors = {
  metadata: '.summary-metadata li',
  counts: '[data-description="itemized-counts"] li'
};

describe('ReportSummary.vue', () => {
  describe('For total strategy', () => {
    let wrapper;

    beforeEach(() => {
      const model = ReportSummaryModel.fromObject({
        id: 'a51361a1-8d64-4348-a28a-fc6b5dcca663',
        title: 'Sample Report Name',
        totalRecords: 101,
        strategy: STRATEGY.TOTAL
      });

      wrapper = shallowMount(ReportSummary, {
        propsData: {
          model
        }
      });
    });

    it('renders report summary', () => {
      const reportName = wrapper.find('h3');
      expect(reportName.text()).toEqual('Sample Report Name');
      const metadata = wrapper.findAll(selectors.metadata);
      expect(metadata.length).toEqual(1);
      expect(metadata.at(0).text()).toEqual('Total Count: 101');
    });
  });

  describe('For itemized strategy', () => {
    let wrapper;

    beforeEach(() => {
      const model = ReportSummaryModel.fromObject({
        id: 'a48bc291-951f-4ef6-9ec3-fff6291d7cd1',
        title: 'Sample Itemized Report Name',
        totalRecords: 6,
        strategy: STRATEGY.ITEMIZED,
        bucketByLabel: 'Field Label',
        data: [
          'Patient follow-up',
          'Patient withdrew consent',
          'Patient follow-up',
          'Patient follow-up',
          'Patient withdrew consent',
          'Perceived drug side effects'
        ]
      });

      wrapper = shallowMount(ReportSummary, {
        propsData: {
          model
        }
      });
    });

    it('renders report summary with itemized counts', () => {
      const reportName = wrapper.find('h3');
      expect(reportName.text()).toEqual('Sample Itemized Report Name');

      const li = wrapper.findAll(selectors.counts);
      expect(li.length).toEqual(3);
      expect(li.at(0).text()).toEqual('3 - Patient follow-up');
      expect(li.at(1).text()).toEqual('2 - Patient withdrew consent');
      expect(li.at(2).text()).toEqual('1 - Perceived drug side effects');
    });

    it('renders a metadata section', () => {
      const metadata = wrapper.findAll(selectors.metadata);
      expect(metadata.length).toEqual(2);
      expect(metadata.at(0).text()).toEqual('Total Count: 6');
      expect(metadata.at(1).text()).toEqual('Grouped By: Field Label');
    });

    it('emits deleteSummary event', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      wrapper.find('.delete').trigger('click');
      expect(wrapper.emitted('summaryDeleted')).toBeTruthy();
      expect(wrapper.emitted('summaryDeleted')[0]).toBeTruthy();
    });

    it('does not emit deleteSummary event if canceled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      wrapper.find('.delete').trigger('click');
      expect(wrapper.emitted('summaryDeleted')).toBeFalsy();
    });
  });

  describe('Report Summary ordering', () => {
    const model = ReportSummaryModel.fromObject({
      id: '7e09f84b-76d8-48bb-9eca-e1e4fe33f844',
      title: 'Test Report Summary',
      totalRecords: 8,
      strategy: STRATEGY.ITEMIZED,
      data: []
    });

    it('handles missing values', () => {
      model.data = [
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

      const wrapper = shallowMount(ReportSummary, {
        propsData: {
          model
        }
      });
      expect(wrapper.vm.hasMissingValue).toEqual(true);

      const li = wrapper.findAll(selectors.counts);
      expect(li.length).toEqual(5);
      expect(li.at(4).text()).toEqual(`3 - ${MISSING}`);
    });

    it('orders counts', () => {
      model.data = shuffle([
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

      const wrapper = shallowMount(ReportSummary, {
        propsData: {
          model
        }
      });

      const li = wrapper.findAll(selectors.counts);
      expect(li.length).toEqual(8);

      // Count in descending order
      expect(li.at(0).text()).toEqual('15 - May');
      expect(li.at(1).text()).toEqual('10 - February');
      expect(li.at(2).text()).toEqual('7 - March');
      expect(li.at(3).text()).toEqual('3 - January');

      // Label is ascending when the count is the same
      expect(li.at(4).text()).toEqual('2 - Afakemonth');
      expect(li.at(5).text()).toEqual('2 - April');
      expect(li.at(6).text()).toEqual('2 - August');

      // Missing is always the last count
      expect(li.at(7).text()).toEqual(`42 - ${MISSING}`);
    });
  });

  describe('editing', () => {
    let wrapper, model;

    beforeEach(() => {
      model = ReportSummaryModel.fromObject({
        id: '68d41098-f49a-4241-8014-ab519224fda7',
        title: 'Original Title',
        reportId: 3,
        strategy: STRATEGY.TOTAL,
        totalRecords: 99
      });

      wrapper = mount(ReportSummary, {
        provide: createProvideObject(),
        propsData: {
          model
        }
      });
    });

    it('reveals the form when the edit link is clicked', () => {
      expect(wrapper.find(ReportSummaryForm).exists()).toBe(false);
      wrapper.find('.edit').trigger('click');
      expect(wrapper.find(ReportSummaryForm).exists()).toBe(true);
    });

    it('closes the form on cancel', () => {
      wrapper.find('.edit').trigger('click');
      expect(wrapper.find(ReportSummaryForm).exists()).toBe(true);

      wrapper.find('button[type="cancel"]').trigger('click');
      expect(wrapper.find(ReportSummaryForm).exists()).toBe(false);
    });

    it('emits an event when updated config is saved', async () => {
      wrapper.find('.edit').trigger('click');
      wrapper.find('input[name="title"]').setValue('New Title');
      wrapper.find('button[type="submit"]').trigger('click');

      // allow time for the form's save promise to resolve
      await Promise.resolve();

      expect(wrapper.emitted('reportSummaryUpdated')).toBeTruthy();

      const updatedModel = wrapper.emitted('reportSummaryUpdated')[0][0];
      expect(updatedModel).not.toEqual(model);
      expect(updatedModel.title).toEqual('New Title');
    });

    it('closes the form after saving', async () => {
      wrapper.find('.edit').trigger('click');
      wrapper.find('input[name="title"]').setValue('New Title');
      wrapper.find('button[type="submit"]').trigger('click');

      // allow time for the form's save promise to resolve
      await Promise.resolve();

      expect(wrapper.find(ReportSummaryForm).exists()).toBe(false);
    });
  });

  describe('drag and drop', () => {
    let wrapper;

    beforeEach(() => {
      const model = ReportSummaryModel.fromObject({
        id: 'a51361a1-8d64-4348-a28a-fc6b5dcca663',
        title: 'Some Name',
        totalRecords: 10,
        strategy: STRATEGY.TOTAL
      });

      wrapper = shallowMount(ReportSummary, {
        propsData: {
          model
        }
      });
    });

    it('is disabled by default to allow text selection', () => {
      expect(wrapper.attributes('draggable')).toEqual('false');
    });

    it('is enabled when the drag handle is grabbed', () => {
      expect(wrapper.attributes('draggable')).toEqual('false');
      wrapper.find('.drag-handle').trigger('mousedown');
      expect(wrapper.attributes('draggable')).toEqual('true');
    });

    it('is disabled when the drag handle is released', () => {
      wrapper.setData({ draggable: true });
      wrapper.find('.drag-handle').trigger('mouseup');
      expect(wrapper.attributes('draggable')).toEqual('false');
    });

    it('emits an event with the id when the user starts to drag it', () => {
      wrapper.trigger('dragstart');
      expect(wrapper.emitted('reorder-start')[0][0]).toEqual(wrapper.vm.model.id);
    });

    it('emits an event when an item is dropped on it', () => {
      wrapper.trigger('drop');
      expect(wrapper.emitted('reorder-end')).toBeTruthy();
    });

    it('disables dragging when the drag ends', () => {
      const dataTransfer = new DataTransfer();
      dataTransfer.dropEffect = 'move';

      wrapper.setData({ draggable: true });
      wrapper.trigger('dragend', {
        dataTransfer
      });

      expect(wrapper.attributes('draggable')).toEqual('false');
    });

    it('emits an event if the drag is canceled', () => {
      const dataTransfer = new DataTransfer();
      dataTransfer.dropEffect = 'none';

      wrapper.trigger('dragend', {
        dataTransfer
      });

      expect(wrapper.emitted('reorder-cancel')).toBeTruthy();
    });
  });
});
