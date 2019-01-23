<?php
// Set the namespace defined in your config file
namespace Octri\ReportCounts;

// The next 2 lines should always be included and be the same in every module
use ExternalModules\AbstractExternalModule;
use ExternalModules\ExternalModules;

// Declare your module class, which must extend AbstractExternalModule
class ReportCounts extends AbstractExternalModule {

  /**
   * Override to allow anyone with project access to be able to view report counts. The
   * user will need `Add/Edit/Organize Reports` rights in order to modify summaries.
   */
  public function redcap_module_link_check_display($project_id, $link) {
    return $link;
  }

}
