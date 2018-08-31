<?php
/**
 * MODULE NAME: Consort Report
 * DESCRIPTION: Renders a consort report on the page.
 */

require_once dirname(realpath(__FILE__)) . '/lib/main.php';

//
//// Call the REDCap Connect file in the main "redcap" directory
//require_once dirname(realpath(__FILE__)) . '/../../redcap_connect.php';
//require_once dirname(realpath(__FILE__)) . '/lib/ReportConfig.php';
//
//use Octri\ConsortReport\ReportConfig;
//
//// Display the project header
//require_once APP_PATH_DOCROOT . 'ProjectGeneral/header.php';
//
//// If noAuth is true, NOAUTH will be appended to the URL. The page will be public.
//$noAuth = false;
//// If true, the URL will be in the API format and will not include the REDCap version in the URL.
//$useApiEndpoint = true;
//$bundleUrl = $module->getUrl('lib/dist/bundle.js', $noAuth, $useApiEndpoint);
//$cssUrl = $module->getUrl('lib/consort-report.css', $noAuth, $useApiEndpoint);
//$dataUrl = $module->getUrl('lib/data.php', $noAuth, $useApiEndpoint);
//$settingsUrl = $module->getUrl('lib/settings.php', $noAuth, $useApiEndpoint);
//// JSON string for passing to ConsortReport.run(urls)
//$urls = json_encode(array(
//  "data" => $dataUrl,
//  "settings" => $settingsUrl
//));
//?>
//
//<div class="consort-report-container">
//  <h1>Consort Report</h1>
//
//  <div class="consort-report">
//  </div>
//
//  <div class="consort-report-version">
//  </div>
//</div>
//
//<script src="<?php print($bundleUrl); ?>"></script>
//<script type="text/javascript">
//$(document).ready(function(){
//  $('head').append('<link href="<?php print($cssUrl); ?>" rel="stylesheet">');
//  ConsortReport.run('<?php print($urls); ?>');
//});
//</script>
//
//<?php
//// Display the project footer
//require_once APP_PATH_DOCROOT . "ProjectGeneral/footer.php";
//?>
