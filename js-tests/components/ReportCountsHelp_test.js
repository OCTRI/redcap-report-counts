import { shallowMount } from '@vue/test-utils';
import ReportCountsHelp from '@/components/ReportCountsHelp.vue';

describe('ReportCountsHelp.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(ReportCountsHelp, {
      propsData: {
        showAboutText: true
      }
    });
  });

  it('renders a details element', () => {
    expect(wrapper.find('details').exists()).toBe(true);
  });

  it('can show and hide about text', () => {
    const selector = '#about-report-counts-module';
    expect(wrapper.find(selector).exists()).toBe(true);

    wrapper.setProps({ showAboutText: false });
    expect(wrapper.find(selector).exists()).toBe(false);
  });
});