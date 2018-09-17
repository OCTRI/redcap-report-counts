<?php
namespace Octri\ConsortReport;

require_once(dirname(realpath(__FILE__)) . '/constants.php');

/**
 * A class for managing report configuration.
 *
 * Example config:
 *
 * <pre><code>
 * [
 *   {
 *     "reportId": 1,
 *     "title": "Report Title - Only Totaled",
 *     "strategy": "total"
 *   },
 *   {
 *     "reportId": 2,
 *     "title": "Report Title - With Itemized Counts",
 *     "strategy": "itemized",
 *     "bucket-by": "field_to_bucket_on"
 *   }
 * ]
 * </code></pre>
 */
class ReportConfig {

  private $project_id;
  private $module;
  private $reportConfigKey = REPORT_CONFIG_KEY;

  /**
   * @param string $project_id The REDCap project id.
   * @param object $module Instance of external modules.
   */
  public function __construct($project_id, $module) {
    assert(isset($project_id), '$project_id is required.');
    assert(isset($module), 'An instance of external modules is required.');
    $this->project_id = $project_id;
    $this->module = $module;
  }

  /**
   * Get report configuration. If no configuration is present, it will be initialized from
   * sample configuration.
   * @return The report configuration in JSON format.
   */
  public function getReportConfig() {
    $existingReportConfig = $this->module->getProjectSetting($this->reportConfigKey, $this->project_id);
    if (isset($existingReportConfig)) {
      return $existingReportConfig;
    } else {
      return false;
    }
  }

  public function saveReportSummary($reportSummary) {
      $config = $this->getReportConfig();
      if (!$config) {
        $this->module->setProjectSetting($this->reportConfigKey, array($reportSummary), $this->project_id);
      } else {
        $config[] = $reportSummary;
        $this->module->setProjectSetting($this->reportConfigKey, $config, $this->project_id);
      }
  }

}
