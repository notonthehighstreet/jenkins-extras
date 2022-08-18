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

var timer = setInterval(rename_pull_requests_links, 150);

function rename_pull_requests_links() {
    if (window.location.pathname.match(/view\/change-requests/)) {
        console.log("looking for PR links...")
        $$('#projectstatus a.model-link').each(function(pr_link) {
            console.log("hello world")
            pr_link.pr_number = pr_link.text
            pr_link.text = pr_link.title + " (" + pr_link.pr_number + ")"
        })
    }
}
