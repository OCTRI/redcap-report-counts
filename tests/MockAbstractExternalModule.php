<?php 

require_once("lib/ReportStrategy.php");

class MockAbstractExternalModule {

  public static $total = \Octri\ConsortReport\ReportStrategy::TOTAL;
  public static $itemized = \Octri\ConsortReport\ReportStrategy::ITEMIZED;

  // This property follows the format: $settings[project_id][settings_key]
  public static $settings = array(
    '42' => array(
      'report-config' => '
        [
          {
            "name": "Report 1",
            "reportId": 101,
            "strategy": "Total count"
          },
          {
            "name": "Report 2",
            "reportId": 202,
            "strategy": "Itemized count",
            "bucketBy": "bucket_field"
          },
          {
            "name": "Report 3",
            "reportId": 303,
            "strategy": "Total count"
          }
        ]'
    ),
    '99' => NULL
  );

  public function getProjectSetting($key, $project_id) {
    return self::$settings[$project_id][$key];
  }

  public function setProjectSetting($key, $value, $project_id) {
    assert(isset($key), '$key is required.');
    assert(isset($value), '$value is required.');
    assert(isset($project_id), '$project_id is required.');
    return;
  }

}
