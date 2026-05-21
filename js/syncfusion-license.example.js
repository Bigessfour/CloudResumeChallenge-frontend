/**
 * Example Syncfusion license registration for CDN / global ej (ES5).
 * Do not paste your real key here if this file might be committed.
 *
 * Preferred setup:
 *   1. setx SYNCFUSION_LICENSE "<your-key>"  (restart Cursor)
 *   2. npm run syncfusion:setup
 *
 * Or: paste key into syncfusion-license.txt and run npm run syncfusion:license
 *
 * @see https://ej2.syncfusion.com/documentation/licensing/license-key-registration
 */
(function () {
  "use strict";

  var LICENSE_KEY = "YOUR_SYNCFUSION_LICENSE_KEY";
  var PLACEHOLDER = "YOUR_SYNCFUSION_LICENSE_KEY";

  if (typeof ej === "undefined" || !ej.base || typeof ej.base.registerLicense !== "function") {
    console.error(
      "[Syncfusion] EJ2 must load before js/syncfusion-license.js. Keep script order: ej2.min.js, then this file."
    );
    return;
  }

  if (!LICENSE_KEY || LICENSE_KEY === PLACEHOLDER) {
    console.warn("[Syncfusion] License key missing. Run: npm run syncfusion:setup");
    return;
  }

  ej.base.registerLicense(LICENSE_KEY);
})();
