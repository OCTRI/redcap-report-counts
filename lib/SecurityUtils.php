<?php
namespace Octri\ReportCounts;

/**
 * A class for handling permissions and other security related operations.
 */
class SecurityUtils {

  const REPORTS_RIGHTS = 'reports';

  public static function hasUserRightsFor($permission) {
    $rights = \REDCap::getUserRights(USERID);
    return $rights[USERID][$permission];
  }

  public static function hasReportsRights() {
    return SUPER_USER || self::hasUserRightsFor(self::REPORTS_RIGHTS);
  }
}