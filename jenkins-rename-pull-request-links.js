// ==UserScript==
// @name         Jenkins | rename pull-requests links
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  This script renames the links in the pull-requests view to show the PR title instead of the PR number
// @author       Gregory Becker
// @match        https://ci.shared.noths.com/*/view/change-requests/
// @icon         https://ci.shared.noths.com/static/6f464c33/favicon.ico
// @grant        none
// ==/UserScript==

var timer = setInterval(rename_pull_requests_links, 250);
var retryCount = 10;

function rename_pull_requests_links() {
    if (window.location.pathname.match(/view\/change-requests/)) {
        var pr_links = $$('#projectstatus a.model-link')
        if (pr_links) {
            pr_links.each(function(pr_link) {
                if (!pr_link.pr_number) {
                    pr_link.pr_number = pr_link.text
                }
                pr_link.text = pr_link.title + " (" + pr_link.pr_number + ")"
            })
        } else if (retryCount <= 0) {
            clearInterval(timer)
        }
    }
    else {
        clearInterval(timer)
    }
    retryCount--;
}
