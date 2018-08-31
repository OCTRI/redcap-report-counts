<?php
namespace Octri\ConsortReport;

require_once(dirname(realpath(__FILE__)) . '/constants.php');

/**
 * A class for managing report configuration.
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
      $defaultReportConfig = file_get_contents(dirname(realpath(__FILE__)) . '/sample.report-config.json');
      $this->module->setProjectSetting($this->reportConfigKey, $defaultReportConfig, $this->project_id);
      return $defaultReportConfig;
    }
  }

}
