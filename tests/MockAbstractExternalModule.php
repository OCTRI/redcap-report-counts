<?php 

class MockAbstractExternalModule {
  
  // This property follows the format: $settings[project_id][settings_key]
  public static $settings = array(
    '42' => array(
      'report-config' => '
        [
          {
            "name": "Report 1",
            "reportId": 101
          },
          {
            "name": "Report 2",
            "reportId": 202
          },
          {
            "name": "Report 3",
            "reportId": 303
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
